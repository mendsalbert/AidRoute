/**
 * API Route: Analyze GDACS disasters with AI
 *
 * Connects Next.js frontend to Python AI agents
 * Uses GDACS data + MeTTa reasoning for mission planning
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DisasterAnalysis {
  disaster: {
    title: string;
    location: string;
    eventType: string;
    typeName: string;
    severity: number;
    urgency: string;
    description: string;
  };
  mission_plan: {
    location: string;
    crisis_type: string;
    urgency: string;
    supplies: Array<{
      name: string;
      quantity: number;
      code: string;
    }>;
    estimated_cost: number;
    estimated_beneficiaries: number;
    estimated_timeline: string;
    efficiency_score: number;
    reasoning: string;
    recommendation: string;
    risk_factors: string[];
  };
  priority_score: number;
}

/**
 * POST /api/ai/analyze-disasters
 *
 * Analyzes current GDACS disasters and returns AI-powered mission plans
 */
export async function POST(request: NextRequest) {
  try {
    const { disasters } = await request.json();

    if (!disasters || !Array.isArray(disasters)) {
      return NextResponse.json(
        { error: "Invalid disasters data" },
        { status: 400 }
      );
    }

    console.log(`🧠 Analyzing ${disasters.length} disasters with AI...`);

    // Connect to Python AI service (required)
    const AI_SERVICE_URL =
      process.env.AI_SERVICE_URL || "http://localhost:5001";

    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disasters }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const analyses = await response.json();
    console.log(`✅ AI analysis complete: ${analyses.length} mission plans`);
    return NextResponse.json(analyses);
  } catch (error: any) {
    console.error("❌ Disaster analysis error:", error);

    // Return specific error for AI service unavailability
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      return NextResponse.json(
        {
          error: "AI service unavailable",
          message:
            "The AI planning service is not running. Please start it with: cd ai-agents && ./start_ai_service.sh",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze disasters", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/analyze-disasters
 *
 * Fetches GDACS data and analyzes with AI in one call
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🌍 Fetching GDACS disasters...");

    // Fetch GDACS data via our proxy
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";
    const gdacsResponse = await fetch(`${baseUrl}/api/gdacs/rss`, {
      cache: "no-store",
    });

    if (!gdacsResponse.ok) {
      throw new Error("Failed to fetch GDACS data");
    }

    const xmlText = await gdacsResponse.text();

    // Parse disasters (simple regex parsing)
    const disasters = parseGDACSXML(xmlText);

    console.log(`✅ Fetched ${disasters.length} disasters from GDACS`);

    // Analyze with AI
    const analysisRequest = new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ disasters }),
    });

    return POST(analysisRequest);
  } catch (error) {
    console.error("❌ GDACS fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch and analyze disasters" },
      { status: 500 }
    );
  }
}

// No fallback - AI service must be running for disaster analysis
