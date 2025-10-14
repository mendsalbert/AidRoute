"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { aidRouteSimulation, type Need } from "@/lib/simulation";
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
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
}

interface PlanningResult {
  supplier: string;
  route: string;
  risk: string;
  funds: number;
  reasoning: string;
}

export function PlanningView() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "system",
      content:
        "AI Planning Agent Online. Ready to optimize humanitarian logistics.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanningResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNeeds(aidRouteSimulation.getNeeds());

    const handleNeedsUpdated = (updatedNeeds: Need[]) => {
      setNeeds(updatedNeeds);
    };

    aidRouteSimulation.on("needs-updated", handleNeedsUpdated);

    return () => {
      aidRouteSimulation.off("needs-updated", handleNeedsUpdated);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (type: ChatMessage["type"], content: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
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

    // Simulate AI processing
    const thinkingId = addMessage("ai", "Processing request...");

    // Check if it's a planning request
    if (
      userMessage.toLowerCase().includes("plan") &&
      userMessage.toLowerCase().includes("delivery")
    ) {
      // Simulate AI planning steps
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateMessage(
        thinkingId,
        "Analyzing current needs and available resources..."
      );

      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateMessage(
        thinkingId,
        "Searching network for available supply nodes..."
      );

      await new Promise((resolve) => setTimeout(resolve, 1200));
      updateMessage(
        thinkingId,
        "Calculating optimal routes using MeTTa Nodes..."
      );

      await new Promise((resolve) => setTimeout(resolve, 1800));
      updateMessage(
        thinkingId,
        "Evaluating risk factors and cost efficiency..."
      );

      // Get planning result
      const openNeeds = needs.filter((n) => n.status === "open");
      if (openNeeds.length > 0) {
        const targetNeed = openNeeds[0];
        try {
          const planResult = await aidRouteSimulation.planMission(
            targetNeed.id
          );
          setCurrentPlan(planResult);

          updateMessage(
            thinkingId,
            `✅ Mission Plan Generated

**Target**: ${targetNeed.location} - ${targetNeed.item} (${
              targetNeed.quantity
            } units)
**Optimal Supplier**: ${planResult.supplier}
**Route Strategy**: ${planResult.route}
**Risk Assessment**: ${planResult.risk}
**Funds Required**: $${planResult.funds.toLocaleString()} PYUSD

Mission is ready for approval. Use "View MeTTa Reasoning" to see detailed analysis.`
          );
        } catch (error) {
          updateMessage(
            thinkingId,
            "Error generating mission plan. Please try again."
          );
        }
      } else {
        updateMessage(
          thinkingId,
          "No open needs found requiring immediate planning."
        );
      }
    } else if (
      userMessage.toLowerCase().includes("status") ||
      userMessage.toLowerCase().includes("overview")
    ) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const openNeeds = needs.filter((n) => n.status === "open").length;
      const criticalNeeds = needs.filter(
        (n) => n.urgency === "critical" && n.status === "open"
      ).length;

      updateMessage(
        thinkingId,
        `📊 Current System Status:

• **Open Needs**: ${openNeeds} locations requiring assistance
• **Critical Priority**: ${criticalNeeds} urgent interventions needed
• **Network Status**: All MeTTa nodes operational
• **Planning Capacity**: Ready for new mission optimization

Available commands:
- "Plan delivery for [location]" - Generate optimized mission plan
- "Show critical needs" - Display highest priority requirements
- "Analyze supply chain" - Review network efficiency`
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateMessage(
        thinkingId,
        `I can help optimize humanitarian logistics missions. Try these commands:

• **"Plan delivery for Camp Beta"** - Generate optimized mission plan
• **"Status overview"** - View current system status  
• **"Show critical needs"** - Display urgent requirements

I use MeTTa reasoning to evaluate suppliers, routes, and risk factors for maximum efficiency.`
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

  const handleApproveMission = () => {
    if (currentPlan) {
      addMessage(
        "system",
        `✅ Mission approved and funds locked. New mission added to Operations queue.`
      );
      setCurrentPlan(null);
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
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
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
                    ${currentPlan.funds.toLocaleString()} PYUSD
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-500" />
                  <span>{currentPlan.route}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  <span>Risk: {currentPlan.risk}</span>
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
                "Plan delivery for Camp Beta",
                "Status overview",
                "Show critical needs",
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

          {/* Open Needs Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Open Needs</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {needs
                .filter((n) => n.status === "open")
                .slice(0, 5)
                .map((need) => (
                  <div
                    key={need.id}
                    className="p-2 bg-secondary/50 rounded text-sm"
                  >
                    <div className="font-medium">{need.location}</div>
                    <div className="text-muted-foreground">
                      {need.item} • {need.quantity}
                    </div>
                  </div>
                ))}
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
