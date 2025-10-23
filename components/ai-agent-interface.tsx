"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
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
  Wallet,
  ExternalLink,
  Clock,
  Users,
  MapPin,
  Package,
  TrendingUp,
  Activity,
} from "lucide-react";

interface AgentMessage {
  id: string;
  type: "agent" | "user" | "system" | "transaction";
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  status?: "thinking" | "processing" | "completed" | "failed";
  transactionData?: {
    type:
      | "mission_creation"
      | "fund_allocation"
      | "supply_procurement"
      | "delivery_confirmation";
    amount?: number;
    recipient?: string;
    missionId?: string;
    hash?: string;
  };
  reasoning?: string;
  suggestions?: string[];
}

interface AgentState {
  id: string;
  name: string;
  status: "online" | "busy" | "offline";
  currentTask?: string;
  lastActivity: Date;
  specialization: "logistics" | "funding" | "coordination" | "verification";
}

interface MissionPlan {
  id: string;
  location: string;
  supplies: Array<{
    name: string;
    quantity: number;
    cost: number;
    supplier: string;
  }>;
  totalCost: number;
  beneficiaries: number;
  timeline: string;
  efficiency: number;
  riskFactors: string[];
  agentRecommendations: string[];
}

export function AIAgentSimulator() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "1",
      type: "system",
      content:
        "🤖 AI Agent Network Initialized\n\n" +
        "• Logistics Agent (Agent-001): Online\n" +
        "• Funding Agent (Agent-002): Online\n" +
        "• Coordination Agent (Agent-003): Online\n" +
        "• Verification Agent (Agent-004): Online\n\n" +
        "All agents ready for humanitarian mission planning.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>([
    {
      id: "agent-001",
      name: "Logistics Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "logistics",
    },
    {
      id: "agent-002",
      name: "Funding Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "funding",
    },
    {
      id: "agent-003",
      name: "Coordination Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "coordination",
    },
    {
      id: "agent-004",
      name: "Verification Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "verification",
    },
  ]);
  const [currentPlan, setCurrentPlan] = useState<MissionPlan | null>(null);
  const [showMetaMask, setShowMetaMask] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "confirmed" | "failed"
  >("pending");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          lastActivity: new Date(),
          status: Math.random() > 0.8 ? "busy" : "online",
          currentTask:
            Math.random() > 0.8 ? "Analyzing supply chains..." : undefined,
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addMessage = (
    type: AgentMessage["type"],
    content: string,
    agentId?: string,
    agentName?: string,
    transactionData?: any,
    reasoning?: string,
    suggestions?: string[]
  ) => {
    const newMessage: AgentMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
      agentId,
      agentName,
      transactionData,
      reasoning,
      suggestions,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const simulateAgentResponse = async (userInput: string) => {
    setIsProcessing(true);

    // Simulate agent thinking
    const thinkingMessage = addMessage(
      "agent",
      "🤔 Analyzing request...",
      "agent-001",
      "Logistics Agent",
      undefined,
      undefined,
      undefined
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update thinking message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === thinkingMessage
          ? {
              ...msg,
              content:
                "🔍 Cross-referencing disaster data with supply chain networks...",
            }
          : msg
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate realistic agent response based on input
    let response = "";
    let missionPlan: MissionPlan | null = null;
    let transactionType: any = null;

    if (
      userInput.toLowerCase().includes("earthquake") ||
      userInput.toLowerCase().includes("disaster")
    ) {
      response =
        `🚨 **CRITICAL ALERT PROCESSED**\n\n` +
        `**Logistics Agent Analysis:**\n` +
        `• Detected high-priority humanitarian need\n` +
        `• Emergency supplies required: Medical kits, food, water, shelter\n` +
        `• Estimated response time: 4-6 hours\n` +
        `• Risk assessment: HIGH - Immediate action required\n\n` +
        `**Funding Agent Recommendation:**\n` +
        `• Allocate $45,000 PYUSD from emergency fund\n` +
        `• Pre-approve suppliers for rapid deployment\n` +
        `• Activate blockchain escrow for transparency\n\n` +
        `**Coordination Agent Plan:**\n` +
        `• Route optimization: 3 delivery points identified\n` +
        `• Local partners contacted: 2 confirmed\n` +
        `• Timeline: 6-8 hours for full deployment`;

      missionPlan = {
        id: `mission-${Date.now()}`,
        location: "Disaster Zone Alpha",
        supplies: [
          {
            name: "Emergency Medical Kits",
            quantity: 50,
            cost: 15000,
            supplier: "MedSupply Co.",
          },
          {
            name: "Water Purification Tablets",
            quantity: 1000,
            cost: 5000,
            supplier: "AquaTech",
          },
          {
            name: "Emergency Food Rations",
            quantity: 200,
            cost: 10000,
            supplier: "NutriCorp",
          },
          {
            name: "Temporary Shelter Kits",
            quantity: 30,
            cost: 15000,
            supplier: "ShelterPro",
          },
        ],
        totalCost: 45000,
        beneficiaries: 500,
        timeline: "6-8 hours",
        efficiency: 92,
        riskFactors: [
          "Weather conditions",
          "Road accessibility",
          "Security concerns",
        ],
        agentRecommendations: [
          "Deploy immediately - time critical",
          "Use blockchain escrow for supplier payments",
          "Activate local coordination network",
        ],
      };

      transactionType = {
        type: "mission_creation",
        amount: 45000,
        missionId: missionPlan.id,
      };
    } else if (
      userInput.toLowerCase().includes("fund") ||
      userInput.toLowerCase().includes("donate")
    ) {
      response =
        `💰 **FUNDING ANALYSIS COMPLETE**\n\n` +
        `**Funding Agent Report:**\n` +
        `• Current emergency fund: $125,000 PYUSD\n` +
        `• Available for allocation: $95,000 PYUSD\n` +
        `• Pending missions: 3 active\n` +
        `• Funding efficiency: 94% utilization rate\n\n` +
        `**Blockchain Integration:**\n` +
        `• Smart contract escrow activated\n` +
        `• Multi-signature approval required\n` +
        `• Real-time fund tracking enabled\n\n` +
        `**Recommendation:** Ready to process funding requests with full transparency.`;

      transactionType = {
        type: "fund_allocation",
        amount: 25000,
      };
    } else {
      response =
        `🤖 **AI AGENT COLLABORATION**\n\n` +
        `**Multi-Agent Analysis:**\n` +
        `• 4 specialized agents working in coordination\n` +
        `• Real-time data processing: GDACS, weather, supply chains\n` +
        `• Blockchain integration: Full transparency and accountability\n` +
        `• Response time: < 2 minutes for complex scenarios\n\n` +
        `**Current Capabilities:**\n` +
        `• Emergency response planning\n` +
        `• Supply chain optimization\n` +
        `• Fund allocation and tracking\n` +
        `• Delivery verification and proof\n\n` +
        `**Ready for your humanitarian mission planning needs.**`;
    }

    // Update thinking message to completed
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === thinkingMessage
          ? { ...msg, content: "✅ Analysis complete - Ready for action" }
          : msg
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add agent response
    addMessage(
      "agent",
      response,
      "agent-001",
      "Logistics Agent",
      transactionType,
      "Multi-agent neural network analysis using real-time disaster data, supply chain optimization algorithms, and blockchain transparency protocols.",
      [
        "Create emergency mission",
        "Allocate funds",
        "View supply chain",
        "Check agent status",
      ]
    );

    if (missionPlan) {
      setCurrentPlan(missionPlan);
    }

    setIsProcessing(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage("user", userMessage);

    await simulateAgentResponse(userMessage);
  };

  const handleApproveMission = async () => {
    if (!currentPlan) return;

    // Show MetaMask popup interface
    setShowMetaMask(true);
    setPendingTransaction({
      type: "mission_creation",
      amount: currentPlan.totalCost,
      missionId: currentPlan.id,
      recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Example supplier address
    });
    setTransactionStatus("pending");

    // Simulate MetaMask interaction
    setTimeout(() => {
      setTransactionStatus("confirmed");
      addMessage(
        "transaction",
        `✅ **TRANSACTION CONFIRMED**\n\n` +
          `**Mission Created:** ${currentPlan.id}\n` +
          `**Amount:** ${currentPlan.totalCost.toLocaleString()} PYUSD\n` +
          `**Recipient:** 0x742d35Cc...4b4d8b6\n` +
          `**Transaction Hash:** 0x8f2a3774...9c3e1a2b\n` +
          `**Block:** 4,521,847\n` +
          `**Gas Used:** 156,789\n\n` +
          `Mission is now live and suppliers have been notified.`,
        undefined,
        undefined,
        {
          type: "mission_creation",
          amount: currentPlan.totalCost,
          missionId: currentPlan.id,
          hash: "0x8f2a3774...9c3e1a2b",
        }
      );

      setTimeout(() => {
        setShowMetaMask(false);
        setCurrentPlan(null);
      }, 3000);
    }, 3000);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAgentIcon = (specialization: string) => {
    switch (specialization) {
      case "logistics":
        return <Route className="w-4 h-4" />;
      case "funding":
        return <DollarSign className="w-4 h-4" />;
      case "coordination":
        return <Users className="w-4 h-4" />;
      case "verification":
        return <Shield className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getAgentColor = (specialization: string) => {
    switch (specialization) {
      case "logistics":
        return "bg-blue-500";
      case "funding":
        return "bg-green-500";
      case "coordination":
        return "bg-purple-500";
      case "verification":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* AI Agent Chat */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Agent Network</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>4 Agents Online • Blockchain Ready</span>
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
                        message.type === "agent" &&
                          getAgentColor(
                            message.agentId?.split("-")[1] === "001"
                              ? "logistics"
                              : "funding"
                          ),
                        message.type === "system" && "bg-green-500",
                        message.type === "transaction" && "bg-blue-500"
                      )}
                    >
                      {message.type === "agent" &&
                        getAgentIcon(
                          message.agentId?.split("-")[1] === "001"
                            ? "logistics"
                            : "funding"
                        )}
                      {message.type === "system" && <Zap className="w-4 h-4" />}
                      {message.type === "transaction" && (
                        <Wallet className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.type === "user" &&
                        "bg-primary text-primary-foreground ml-auto",
                      message.type === "agent" && "bg-secondary",
                      message.type === "system" &&
                        "bg-green-500/10 border border-green-500/20",
                      message.type === "transaction" &&
                        "bg-blue-500/10 border border-blue-500/20"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs opacity-70">
                        {formatTimestamp(message.timestamp)}
                      </div>
                      {message.agentName && (
                        <div className="text-xs opacity-70">
                          {message.agentName}
                        </div>
                      )}
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
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI agents collaborating...</span>
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
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                placeholder="Ask AI agents to plan a humanitarian mission..."
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

        {/* Agent Status & Mission Panel */}
        <div className="space-y-6">
          {/* Agent Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Agent Network Status
            </h3>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      getAgentColor(agent.specialization)
                    )}
                  >
                    {getAgentIcon(agent.specialization)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {agent.status === "online" && "🟢 Online"}
                      {agent.status === "busy" && "🟡 Busy"}
                      {agent.status === "offline" && "🔴 Offline"}
                      {agent.currentTask && ` • ${agent.currentTask}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Mission Plan */}
          {currentPlan && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Mission Ready for Deployment
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{currentPlan.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    ${currentPlan.totalCost.toLocaleString()} PYUSD
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>
                    {currentPlan.beneficiaries.toLocaleString()} beneficiaries
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Timeline: {currentPlan.timeline}</span>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Efficiency: {currentPlan.efficiency}%</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Supplies Required:</h4>
                {currentPlan.supplies.map((supply, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs bg-secondary/50 p-2 rounded"
                  >
                    <span>{supply.name}</span>
                    <span className="font-medium">
                      ${supply.cost.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApproveMission}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Deploy Mission & Initiate Blockchain Transaction
              </button>
            </div>
          )}

          {/* Quick Commands */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Agent Commands</h3>
            <div className="space-y-2">
              {[
                "Analyze earthquake disaster",
                "Create emergency fund allocation",
                "Check agent network status",
                "Simulate supply chain optimization",
                "View blockchain transactions",
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
        </div>
      </div>

      {/* MetaMask Popup Interface */}
      {showMetaMask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">MetaMask</h3>
                <p className="text-sm text-muted-foreground">
                  Transaction Request
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">
                  Mission Deployment Transaction
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">
                      {pendingTransaction?.amount?.toLocaleString()} PYUSD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mission ID:</span>
                    <span className="font-medium">
                      {pendingTransaction?.missionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipient:</span>
                    <span className="font-medium text-xs">
                      {pendingTransaction?.recipient}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-medium">Sepolia Testnet</span>
                  </div>
                </div>
              </div>

              {transactionStatus === "pending" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Waiting for transaction confirmation...</span>
                </div>
              )}

              {transactionStatus === "confirmed" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Transaction confirmed! Mission deployed successfully.
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowMetaMask(false)}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTransactionStatus("confirmed");
                    setTimeout(() => setShowMetaMask(false), 2000);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  disabled={transactionStatus === "confirmed"}
                >
                  {transactionStatus === "pending" ? "Confirm" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
