/**
 * API Route: Chat with AI Agent via ASI:One
 *
 * Connects to Agentverse agent using ASI:One API
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ASI:One API Configuration
const ASI_ONE_API_KEY =
  process.env.ASI_ONE_API_KEY ||
  "sk_d508726558134586a0228843773e35cd1efbe22ae88d45cda3b5284090d61045";
const ASI_ONE_ENDPOINT = "https://api.asi1.ai/v1/chat/completions";
const AGENT_ADDRESS =
  "agent1qfm2yn76gvqfvf04qh7k9x78hfrm33axpt35h4g675fvstsxl3npvnpc7vu";
const MODEL = "asi1-fast-agentic";

// Session management
const sessionMap = new Map<string, string>();

function getSessionId(conversationId?: string): string {
  const convId = conversationId || "default";
  let sessionId = sessionMap.get(convId);
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionMap.set(convId, sessionId);
  }
  return sessionId;
}

interface ChatRequest {
  message: string;
  session_id?: string;
  context?: {
    disasters?: any[];
    analyses?: any[];
  };
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  mission_data?: any;
}

/**
 * POST /api/ai/chat
 */
export async function POST(request: NextRequest) {
  try {
    const { message, session_id, context }: ChatRequest = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    console.log(`💬 Chat request: "${message}"`);
    console.log(`🔗 Routing to Agentverse agent: ${AGENT_ADDRESS}`);
    console.log(`🔑 API Key: ${ASI_ONE_API_KEY ? "Present" : "Missing"}`);

    // Check if API key is available
    if (!ASI_ONE_API_KEY) {
      console.error("❌ ASI:One API key is missing");
      return NextResponse.json(
        {
          error: "API key missing",
          message:
            "ASI:One API key is not configured. Please add ASI_ONE_API_KEY to .env.local",
        },
        { status: 401 }
      );
    }

    // Get or create session ID
    const sessionId = getSessionId(session_id);
    console.log(`📝 Using session ID: ${sessionId}`);

    // Build conversation messages
    const messages: any[] = [];

    // Add context if provided
    if (context?.disasters && context.disasters.length > 0) {
      messages.push({
        role: "system",
        content: `Context: There are ${context.disasters.length} active GDACS disasters being monitored.`,
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: message,
    });

    console.log(`📤 Sending request to ASI:One API...`);
    console.log(`📋 Messages:`, JSON.stringify(messages, null, 2));

    const startTime = Date.now();

    // Call ASI:One API with Agentverse agent
    const response = await fetch(ASI_ONE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ASI_ONE_API_KEY}`,
        "x-session-id": sessionId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        agent_address: AGENT_ADDRESS,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(120000), // Increased to 120 seconds (2 minutes)
    });

    console.log(`📥 Response status: ${response.status}`);
    console.log(`⏱️ Request completed in ${Date.now() - startTime}ms`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ ASI:One API error:", response.status, errorData);

      // Return detailed error information
      return NextResponse.json(
        {
          error: "ASI:One API error",
          status: response.status,
          details: errorData,
          message: `ASI:One API returned ${response.status}: ${
            errorData.error?.message || errorData.message || "Unknown error"
          }`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage =
      data.choices[0]?.message?.content || "No response from agent";

    console.log(`✅ Response received from Agentverse agent`);
    console.log(`📝 Response length: ${aiMessage.length} characters`);
    console.log(`📊 Full response data:`, JSON.stringify(data, null, 2));

    // Extract suggestions
    const suggestions = extractSuggestions(aiMessage);

    // Extract mission data if present
    const missionData = extractMissionData(aiMessage, context);

    const chatResponse: ChatResponse = {
      message: aiMessage,
      suggestions: suggestions,
    };

    if (missionData) {
      chatResponse.mission_data = missionData;
    }

    return NextResponse.json(chatResponse);
  } catch (error: any) {
    console.error("❌ Chat error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    // Handle timeout errors
    if (error.name === "TimeoutError" || error.message?.includes("timeout")) {
      return NextResponse.json(
        {
          error: "Request timeout",
          message:
            "The request to ASI:One API timed out after 120 seconds. This could be due to agent being offline or API issues.",
          details: error.message,
        },
        { status: 408 }
      );
    }

    // Handle network errors
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Network error",
          message:
            "Unable to connect to ASI:One API. Check your internet connection and API key.",
          details: error.message,
        },
        { status: 503 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Chat processing failed",
        message: error.message || "An unexpected error occurred",
        details: {
          name: error.name,
          stack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(message: string): string[] {
  const suggestions: string[] = [];

  // Look for quoted suggestions
  const quotedPattern = /["']([^"']{3,40})["']/g;
  const matches = message.matchAll(quotedPattern);
  for (const match of matches) {
    suggestions.push(match[1].trim());
  }

  // Look for bullet points
  const bulletPattern = /^[•\-\*]\s*(.{3,40})$/gm;
  const bulletMatches = message.matchAll(bulletPattern);
  for (const match of bulletMatches) {
    if (!match[1].includes(":")) {
      // Skip headers
      suggestions.push(match[1].trim());
    }
  }

  // Default suggestions
  if (suggestions.length === 0) {
    return [
      "Plan a mission",
      "Analyze disasters",
      "Status overview",
      "How does it work?",
    ];
  }

  return suggestions.slice(0, 4);
}

/**
 * Extract mission data from AI response
 */
function extractMissionData(message: string, context?: any): any {
  const hasMissionPlan =
    message.toLowerCase().includes("mission plan") ||
    message.toLowerCase().includes("supply package") ||
    message.toLowerCase().includes("estimated cost");

  if (!hasMissionPlan) {
    return null;
  }

  // Extract cost
  const costMatch = message.match(/\$[\d,]+/);
  if (!costMatch) return null;

  // Extract beneficiaries
  const beneficiariesMatch = message.match(
    /(\d+[\d,]*)\s*(?:people|beneficiaries)/i
  );

  // Extract timeline
  const timelineMatch = message.match(/(\d+-\d+\s*days)/i);

  // Extract efficiency
  const efficiencyMatch = message.match(/(\d+)\/100/);

  // Extract location
  let location = "Unknown";
  const locationPatterns = [/(?:for|in|at)\s+([A-Z][a-z]+)/, /([A-Z][a-z]+):/];
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match) {
      location = match[1];
      break;
    }
  }

  // Extract supplies
  const supplies: any[] = [];
  const supplyPattern = /[•\-\*]\s*(.+?)\s*[×x]\s*(\d+)/gi;
  const supplyMatches = message.matchAll(supplyPattern);
  for (const match of supplyMatches) {
    supplies.push({
      name: match[1].trim(),
      quantity: parseInt(match[2]),
      code: match[1].toLowerCase().replace(/\s+/g, "-"),
    });
  }

  if (supplies.length === 0) {
    // Default supplies if none extracted
    supplies.push(
      { name: "Medical Kit - Basic", quantity: 10, code: "medical-kit-basic" },
      {
        name: "Shelter Tent (Family)",
        quantity: 15,
        code: "shelter-tent-family",
      },
      {
        name: "Water Purification Kit",
        quantity: 8,
        code: "water-purification-kit",
      }
    );
  }

  return {
    location: location,
    supplies: supplies,
    estimated_cost: parseInt(costMatch[0].replace(/[$,]/g, "")),
    estimated_beneficiaries: beneficiariesMatch
      ? parseInt(beneficiariesMatch[1].replace(/,/g, ""))
      : 800,
    estimated_timeline: timelineMatch ? timelineMatch[1] : "7-14 days",
    efficiency_score: efficiencyMatch ? parseInt(efficiencyMatch[1]) : 85,
  };
}
