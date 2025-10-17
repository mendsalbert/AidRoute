"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  realTimeDisasterService,
  type RawDisasterEvent,
} from "@/lib/real-time-disasters";
import {
  Brain,
  Send,
  MessageCircle,
  Loader2,
  CheckCircle,
  Eye,
  DollarSign,
  Route,
  Shield,
  Zap,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  mission_data?: any;
  suggestions?: string[];
}

interface PlanningResult {
  location: string;
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
  risk_factors?: string[];
}

export function PlanningView() {
  const [disasters, setDisasters] = useState<RawDisasterEvent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "system",
      content:
        "Agentverse AI Agent Online\n\n" +
        "Powered by: Fetch.ai uAgents • SingularityNET MeTTa • ASI:One • Agentverse\n\n" +
        "Agent Address: agent1qfm2yn76gvqfvf04qh7k9x78hfrm33axpt35h4g675fvstsxl3npvnpc7vu\n\n" +
        "Ready to optimize humanitarian logistics with real-time GDACS data.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanningResult | null>(null);
  const [aiAnalyses, setAiAnalyses] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(
      `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }, []);

  useEffect(() => {
    // Fetch disasters on mount
    fetchAndAnalyzeDisasters();

    // Subscribe to disaster updates
    const handleEventsUpdated = (events: RawDisasterEvent[]) => {
      setDisasters(events);
      // Auto-analyze new disasters
      if (events.length > 0) {
        analyzeDisastersWithAI(events);
      }
    };

    realTimeDisasterService.on("events-updated", handleEventsUpdated);

    return () => {
      realTimeDisasterService.off("events-updated", handleEventsUpdated);
    };
  }, []);

  const fetchAndAnalyzeDisasters = async () => {
    try {
      const events = realTimeDisasterService.getEvents();
      setDisasters(events);

      if (events.length > 0) {
        await analyzeDisastersWithAI(events);
      }
    } catch (error) {
      console.error("Error fetching disasters:", error);
    }
  };

  const analyzeDisastersWithAI = async (events: RawDisasterEvent[]) => {
    try {
      console.log("🧠 Analyzing disasters with Agentverse agent...");

      // Add a message to show we're processing
      addMessage(
        "system",
        `Connecting to Agentverse agent…\n` +
          `This can take up to 2 minutes. Please wait`
      );

      // Use the chat API to ask the agent to analyze disasters
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Hello! Can you help me with disaster analysis?",
          session_id: sessionId,
          context: {
            disasters: events,
            analyses: aiAnalyses,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Analysis error:", errorData);

        if (response.status === 503) {
          // Network error
          addMessage(
            "system",
            `Network error\n\n` +
              `Unable to connect to ASI:One API.\n\n` +
              `Error: ${errorData.message}\n\n` +
              `To fix:\n` +
              `1. Check your internet connection\n` +
              `2. Verify ASI:One API key\n` +
              `3. Check if Agentverse agent is online`
          );
          return;
        }

        if (response.status === 408) {
          // Silently stop processing on timeout without verbose error message
          return;
        }

        if (response.status === 401) {
          // API key error
          addMessage(
            "system",
            `API key error\n\n` +
              `ASI:One API key is missing or invalid.\n\n` +
              `Error: ${errorData.message}\n\n` +
              `To fix:\n` +
              `1. Get API key from https://asi1.ai\n` +
              `2. Add to .env.local file\n` +
              `3. Restart the development server`
          );
          return;
        }

        // Generic error with details
        addMessage(
          "system",
          `Analysis error\n\n` +
            `Status: ${response.status}\n` +
            `Error: ${errorData.message || "Unknown error"}`
        );
        return;
      }

      const aiResponse = await response.json();
      console.log(`Disaster analysis complete via Agentverse agent`);

      // Add the AI response as a message
      addMessage(
        "ai",
        aiResponse.message,
        aiResponse.mission_data,
        aiResponse.suggestions
      );
    } catch (error) {
      console.error("AI analysis error:", error);
      addMessage(
        "system",
        `Analysis error\n\n` +
          `Failed to analyze disasters via Agentverse agent.\n\n` +
          `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }\n\n` +
          `Please ensure your ASI:One API key is set in \`.env.local\``
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (
    type: ChatMessage["type"],
    content: string,
    mission_data?: any,
    suggestions?: string[]
  ) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
      mission_data,
      suggestions,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  // Render helper to remove markdown symbols for a clean preview
  const renderContent = (content: string) => {
    const sanitized = content
      .replace(/<\/?think>/g, "") // remove <think> tags but keep inner content
      .replace(/\*\*/g, "") // remove bold markers
      .replace(/`{1,3}/g, "") // remove backticks and code fences
      .replace(/^###\s+/gm, "") // strip markdown headings
      .replace(/^##\s+/gm, "")
      .replace(/^#\s+/gm, "");

    const lines = sanitized.split("\n");
    return (
      <div className="leading-relaxed">
        {lines.map((line, idx) => {
          const formatted = line.replace(/^\-\s+/, "• ");
          return (
            <div key={idx} className="whitespace-pre-wrap">
              {formatted}
            </div>
          );
        })}
      </div>
    );
  };

  const updateMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage("user", userMessage);
    setIsProcessing(true);

    // Add progress message for slow ASI:One API
    addMessage(
      "system",
      `Awaiting agent response… This may take up to 2 minutes`
    );

    try {
      // Call AI chat API with session ID for Agentverse agent
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          context: {
            disasters: disasters,
            analyses: aiAnalyses,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Chat error:", errorData);

        if (response.status === 503) {
          // Network error
          addMessage(
            "system",
            `Network error\n\n` +
              `Unable to connect to ASI:One API.\n\n` +
              `Error: ${errorData.message}\n\n` +
              `To fix:\n` +
              `1. Check your internet connection\n` +
              `2. Verify ASI:One API key\n` +
              `3. Check if Agentverse agent is online`,
            undefined,
            ["View setup guide", "Check agent status"]
          );
        } else if (response.status === 408) {
          // Silently stop processing on timeout without verbose error message
        } else if (response.status === 401) {
          // API key error
          addMessage(
            "system",
            `API key error\n\n` +
              `ASI:One API key is missing or invalid.\n\n` +
              `Error: ${errorData.message}\n\n` +
              `To fix:\n` +
              `1. Get API key from https://asi1.ai\n` +
              `2. Add to .env.local file\n` +
              `3. Restart the development server`
          );
        } else {
          // Generic error with details
          addMessage(
            "system",
            `Chat error\n\n` +
              `Status: ${response.status}\n` +
              `Error: ${errorData.message || "Unknown error"}`
          );
        }

        setIsProcessing(false);
        return;
      }

      const aiResponse = await response.json();

      // Check if this generated a mission plan
      if (aiResponse.mission_data && aiResponse.mission_data.supplies) {
        setCurrentPlan(aiResponse.mission_data);
      }

      // Add AI message with suggestions
      addMessage(
        "ai",
        aiResponse.message,
        aiResponse.mission_data,
        aiResponse.suggestions
      );
    } catch (error) {
      console.error("Chat error:", error);
      addMessage(
        "system",
        `Connection error\n\n` +
          `Unable to connect to the Agentverse agent via ASI:One API.\n\n` +
          `Please ensure:\n` +
          `1. ASI:One API key is set in .env.local\n` +
          `2. Your Agentverse agent is running\n` +
          `3. Network connection is active\n\n` +
          `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }\n\n` +
          `See AGENTVERSE_SETUP.md for setup instructions`,
        undefined,
        ["View setup guide", "Check API key"]
      );
    }

    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApproveMission = async () => {
    if (!currentPlan) return;

    try {
      const amount = currentPlan.estimated_cost; // demo: use estimated cost
      const recipient = "0x0000000000000000000000000000000000000001"; // demo recipient
      const missionId = Math.floor(Math.random() * 1000) + 1; // demo mission id

      const res = await fetch("/api/payments/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, amount, recipient }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addMessage(
          "system",
          `Payment failed\n\nStatus: ${res.status}\nError: ${
            err.message || err.error || "Unknown error"
          }`
        );
        return;
      }

      const data = await res.json();
      addMessage(
        "system",
        `Mission approved and funds locked.\nTransaction: ${data.transaction_id}`
      );
      setCurrentPlan(null);
    } catch (e: any) {
      addMessage(
        "system",
        `Payment failed\n\n${e?.message || "Unknown error"}`
      );
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">AI Planning Agent</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>ASI:One Neural Network Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 flex-col",
                  message.type === "user" && "items-end"
                )}
              >
                <div
                  className={cn(
                    "flex gap-3",
                    message.type === "user" && "justify-end"
                  )}
                >
                  {message.type !== "user" && (
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        message.type === "ai" &&
                          "bg-primary text-primary-foreground",
                        message.type === "system" && "bg-green-500 text-white"
                      )}
                    >
                      {message.type === "ai" && <Brain className="w-4 h-4" />}
                      {message.type === "system" && <Zap className="w-4 h-4" />}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.type === "user" &&
                        "bg-primary text-primary-foreground ml-auto",
                      message.type === "ai" && "bg-secondary",
                      message.type === "system" &&
                        "bg-green-500/10 border border-green-500/20"
                    )}
                  >
                    <div className="text-sm">
                      {renderContent(message.content)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-11 max-w-[80%]">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputMessage(suggestion);
                          setTimeout(handleSendMessage, 100);
                        }}
                        className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
                        disabled={isProcessing}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI agent thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask AI to plan a delivery..."
                className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !inputMessage.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mission Planning Panel */}
        <div className="space-y-6">
          {/* Current Plan */}
          {currentPlan && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Mission Ready
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    ${currentPlan.estimated_cost.toLocaleString()} PYUSD
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-500" />
                  <span>
                    {currentPlan.estimated_beneficiaries.toLocaleString()}{" "}
                    beneficiaries
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  <span>Efficiency: {currentPlan.efficiency_score}%</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Timeline: {currentPlan.estimated_timeline}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowReasoning(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View MeTTa Reasoning</span>
                </button>
              </div>

              <button
                onClick={handleApproveMission}
                className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Approve & Lock Funds
              </button>
            </div>
          )}

          {/* Quick Commands */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Quick Commands</h3>
            <div className="space-y-2">
              {[
                "Status overview",
                "Analyze current disasters",
                "Show critical needs",
                "How does AI planning work?",
              ].map((command) => (
                <button
                  key={command}
                  onClick={() => {
                    setInputMessage(command);
                    setTimeout(handleSendMessage, 100);
                  }}
                  className="w-full text-left px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors text-sm"
                  disabled={isProcessing}
                >
                  {command}
                </button>
              ))}
            </div>
          </div>

          {/* Active Disasters Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Live GDACS Disasters
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {disasters.slice(0, 5).map((disaster, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 rounded text-sm",
                    disaster.urgency === "critical"
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-secondary/50"
                  )}
                >
                  <div className="font-medium flex items-center gap-2">
                    {disaster.urgency === "critical" && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    {disaster.location}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {disaster.typeName} • Severity: {disaster.severity}/5
                  </div>
                </div>
              ))}
              {disasters.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Monitoring for disasters...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MeTTa Reasoning Modal */}
      {showReasoning && currentPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                MeTTa Neural Reasoning Analysis
              </h3>
              <button
                onClick={() => setShowReasoning(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">Decision Logic:</h4>
                <p>{currentPlan.reasoning}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h5 className="font-medium text-blue-600 mb-1">
                    Supply Chain Analysis
                  </h5>
                  <p className="text-xs">
                    Real-time inventory levels, supplier reliability scores, and
                    historical performance metrics evaluated.
                  </p>
                </div>

                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h5 className="font-medium text-green-600 mb-1">
                    Route Optimization
                  </h5>
                  <p className="text-xs">
                    Multi-factor pathfinding considering terrain, weather,
                    conflict zones, and fuel efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
