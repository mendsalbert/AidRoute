"use client";

import { useState, useEffect, useRef } from "react";
import { useMetaMask } from "@/hooks/useMetaMask";
import { cn } from "@/lib/utils";
import {
  realTimeDisasterService,
  type RawDisasterEvent,
} from "@/lib/real-time-disasters";
import { DeploymentStatus } from "./deployment-status";
import {
  transactionStorage,
  createTransactionFromMessage,
} from "@/lib/transaction-storage";
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
  AlertCircle,
  FileText,
  XCircle,
  Lightbulb,
  Truck,
  Handshake,
  Search,
  BarChart3,
  Gift,
} from "lucide-react";

interface AgentMessage {
  id: string;
  type: "agent" | "user" | "system" | "transaction" | "autonomous";
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
  confidence?: number;
  priority?: "low" | "medium" | "high" | "critical";
}

interface AgentState {
  id: string;
  name: string;
  status: "online" | "busy" | "analyzing" | "offline";
  currentTask?: string;
  lastActivity: Date;
  specialization: "logistics" | "funding" | "coordination" | "verification";
  confidence: number;
  workload: number;
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

// Helper function to get icon component for message headers
const getMessageHeaderIcon = (headerText: string) => {
  if (headerText.includes("Funding") || headerText.includes("FUNDING")) {
    return <DollarSign className="w-4 h-4" />;
  }
  if (headerText.includes("Analysis") || headerText.includes("ANALYSIS")) {
    return <BarChart3 className="w-4 h-4" />;
  }
  if (headerText.includes("Supply") || headerText.includes("Logistics")) {
    return <Truck className="w-4 h-4" />;
  }
  if (
    headerText.includes("Coordination") ||
    headerText.includes("Partnership")
  ) {
    return <Handshake className="w-4 h-4" />;
  }
  if (headerText.includes("Audit") || headerText.includes("Verification")) {
    return <Shield className="w-4 h-4" />;
  }
  if (headerText.includes("Proactive") || headerText.includes("Optimization")) {
    return <Lightbulb className="w-4 h-4" />;
  }
  if (
    headerText.includes("Search") ||
    headerText.includes("Cross-referencing")
  ) {
    return <Search className="w-4 h-4" />;
  }
  return <FileText className="w-4 h-4" />;
};

export function RealMetaMaskIntegration() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "1",
      type: "system",
      content:
        "AI Agent Network Initialized\n\n" +
        "• Logistics Agent (Agent-001): Online\n" +
        "• Funding Agent (Agent-002): Online\n" +
        "• Coordination Agent (Agent-003): Online\n" +
        "• Verification Agent (Agent-004): Online\n\n" +
        "All agents ready for humanitarian mission planning.\n\n" +
        "MetaMask Integration: Ready for real blockchain transactions",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<MissionPlan | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "confirmed" | "failed"
  >("pending");
  const [agents, setAgents] = useState<AgentState[]>([
    {
      id: "agent-001",
      name: "Logistics Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "logistics",
      confidence: 0.95,
      workload: 0.3,
    },
    {
      id: "agent-002",
      name: "Funding Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "funding",
      confidence: 0.92,
      workload: 0.2,
    },
    {
      id: "agent-003",
      name: "Coordination Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "coordination",
      confidence: 0.88,
      workload: 0.4,
    },
    {
      id: "agent-004",
      name: "Verification Agent",
      status: "online",
      lastActivity: new Date(),
      specialization: "verification",
      confidence: 0.91,
      workload: 0.1,
    },
  ]);
  const [disasters, setDisasters] = useState<RawDisasterEvent[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isMetaMaskInstalled,
    isConnected,
    account,
    isLoading,
    error,
    connect,
    switchToSepolia,
    sendTransaction,
    createMission,
    donateTo,
    deployMissionFunds,
    getContractStats,
  } = useMetaMask();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Monitor disasters and trigger autonomous agent responses
  useEffect(() => {
    const handleEventsUpdated = (events: RawDisasterEvent[]) => {
      setDisasters(events);

      // Autonomous agent analysis of new disasters
      if (autonomousMode && events.length > 0) {
        const criticalEvents = events.filter((e) => e.urgency === "critical");
        if (criticalEvents.length > 0) {
          setTimeout(() => {
            triggerAutonomousResponse(criticalEvents[0]);
          }, 3000);
        }
      }
    };

    realTimeDisasterService.on("events-updated", handleEventsUpdated);

    // Initial load
    const events = realTimeDisasterService.getEvents();
    setDisasters(events);

    return () => {
      realTimeDisasterService.off("events-updated", handleEventsUpdated);
    };
  }, [autonomousMode]);

  // Simulate realistic agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          const random = Math.random();
          let newStatus = agent.status;
          let newTask = agent.currentTask;
          let newWorkload = agent.workload;
          let newConfidence = agent.confidence;

          // Simulate agent state changes
          if (random < 0.1) {
            newStatus = "analyzing";
            newTask = getRandomTask(agent.specialization);
            newWorkload = Math.min(1, agent.workload + 0.2);
          } else if (random < 0.2) {
            newStatus = "busy";
            newWorkload = Math.max(0, agent.workload - 0.1);
          } else if (random < 0.05) {
            newStatus = "offline";
            newTask = undefined;
          } else {
            newStatus = "online";
            newTask =
              random < 0.3 ? getRandomTask(agent.specialization) : undefined;
          }

          // Adjust confidence based on workload
          if (newWorkload > 0.8) {
            newConfidence = Math.max(0.7, agent.confidence - 0.02);
          } else if (newWorkload < 0.3) {
            newConfidence = Math.min(0.98, agent.confidence + 0.01);
          }

          return {
            ...agent,
            status: newStatus,
            currentTask: newTask,
            lastActivity: new Date(),
            workload: newWorkload,
            confidence: newConfidence,
          };
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Autonomous proactive suggestions
  useEffect(() => {
    if (!autonomousMode) return;

    const interval = setInterval(() => {
      const random = Math.random();
      if (random < 0.15) {
        // 15% chance every 30 seconds
        triggerProactiveSuggestion();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autonomousMode, disasters]);

  const getRandomTask = (specialization: string) => {
    const tasks: Record<string, string[]> = {
      logistics: [
        "Optimizing supply routes...",
        "Analyzing inventory levels...",
        "Coordinating with suppliers...",
        "Calculating delivery times...",
        "Assessing transportation risks...",
      ],
      funding: [
        "Evaluating fund allocation...",
        "Processing donation requests...",
        "Analyzing cost efficiency...",
        "Reviewing budget constraints...",
        "Calculating ROI metrics...",
      ],
      coordination: [
        "Synchronizing team activities...",
        "Managing stakeholder communications...",
        "Coordinating multi-agent tasks...",
        "Optimizing resource allocation...",
        "Facilitating cross-team collaboration...",
      ],
      verification: [
        "Validating delivery confirmations...",
        "Auditing transaction records...",
        "Verifying supplier credentials...",
        "Checking compliance standards...",
        "Analyzing data integrity...",
      ],
    };

    const taskList = tasks[specialization] || tasks.logistics;
    return taskList[Math.floor(Math.random() * taskList.length)];
  };

  const triggerAutonomousResponse = async (disaster: RawDisasterEvent) => {
    const agent = agents.find((a) => a.specialization === "logistics");
    if (!agent) return;

    const recommendedBudget = Math.floor(Math.random() * 50 + 25); // Small test amounts: $25-$75 PYUSD

    addMessage(
      "autonomous",
      `AUTONOMOUS ALERT DETECTED\n\n` +
        `${agent.name} Analysis:\n` +
        `• Critical disaster detected: ${disaster.typeName}\n` +
        `• Location: ${disaster.location}\n` +
        `• Severity: ${disaster.severity}/5\n` +
        `• Urgency: ${disaster.urgency}\n\n` +
        `Autonomous Recommendation:\n` +
        `• Immediate response required\n` +
        `• Estimated affected population: ${Math.floor(
          Math.random() * 500 + 100
        )}\n` +
        `• Recommended budget: $${recommendedBudget.toLocaleString()}\n\n` +
        `Agent Confidence: ${Math.floor(agent.confidence * 100)}%\n\n` +
        `Ready for Blockchain Action:\n` +
        `• Emergency fund allocation prepared\n` +
        `• Click "Deploy Emergency Funds" to trigger MetaMask\n` +
        `• Real PYUSD transfer will be initiated`,
      agent.id,
      agent.name,
      {
        type: "fund_allocation",
        amount: recommendedBudget,
        missionId: `emergency-${Date.now()}`,
      },
      `Autonomous analysis triggered by real-time disaster monitoring system. Agent confidence: ${agent.confidence.toFixed(
        2
      )}`,
      ["Deploy Emergency Funds", "Prepare emergency plan", "Get more details"],
      agent.confidence,
      "critical"
    );
  };

  const triggerProactiveSuggestion = () => {
    const suggestions = [
      {
        agent: "funding",
        message:
          "Proactive Funding Analysis\n\nI've identified an opportunity to optimize our emergency fund allocation. Current efficiency could be improved by 12% with strategic rebalancing.",
        suggestions: [
          "Show optimization plan",
          "Current fund status",
          "Dismiss",
        ],
      },
      {
        agent: "logistics",
        message:
          "Supply Chain Optimization\n\nDetected potential bottleneck in our Mediterranean supply route. Alternative routing could reduce delivery time by 18 hours.",
        suggestions: [
          "View alternative routes",
          "Risk assessment",
          "Implement changes",
        ],
      },
      {
        agent: "coordination",
        message:
          "Partnership Opportunity\n\nNew NGO partnership available in Southeast Asia. Could expand our reach by 40% with minimal overhead increase.",
        suggestions: [
          "Review partnership",
          "Contact details",
          "Schedule meeting",
        ],
      },
      {
        agent: "verification",
        message:
          "Audit Recommendation\n\nRecommend conducting quarterly audit of delivery confirmations. Current verification rate: 94.2%.",
        suggestions: ["Schedule audit", "View metrics", "Update protocols"],
      },
    ];

    const suggestion =
      suggestions[Math.floor(Math.random() * suggestions.length)];
    const agent = agents.find((a) => a.specialization === suggestion.agent);
    if (!agent) return;

    addMessage(
      "autonomous",
      suggestion.message,
      agent.id,
      agent.name,
      undefined,
      "Proactive analysis based on continuous monitoring and optimization algorithms",
      suggestion.suggestions,
      agent.confidence,
      "medium"
    );
  };

  const addMessage = (
    type: AgentMessage["type"],
    content: string,
    agentId?: string,
    agentName?: string,
    transactionData?: any,
    reasoning?: string,
    suggestions?: string[],
    confidence?: number,
    priority?: "low" | "medium" | "high" | "critical"
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
      confidence,
      priority,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const simulateAgentResponse = async (userInput: string) => {
    setIsProcessing(true);

    const thinkingMessage = addMessage(
      "agent",
      "Analyzing request...",
      "agent-001",
      "Logistics Agent"
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === thinkingMessage
          ? {
              ...msg,
              content:
                "Cross-referencing disaster data with supply chain networks...",
            }
          : msg
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    let response = "";
    let missionPlan: MissionPlan | null = null;
    let transactionType: any = null;

    if (
      userInput.toLowerCase().includes("earthquake") ||
      userInput.toLowerCase().includes("disaster")
    ) {
      response =
        `CRITICAL ALERT PROCESSED\n\n` +
        `Logistics Agent Analysis:\n` +
        `• Detected high-priority humanitarian need\n` +
        `• Emergency supplies required: Medical kits, food, water, shelter\n` +
        `• Estimated response time: 4-6 hours\n` +
        `• Risk assessment: HIGH - Immediate action required\n\n` +
        `Funding Agent Recommendation:\n` +
        `• Allocate $45 PYUSD from emergency fund\n` +
        `• Pre-approve suppliers for rapid deployment\n` +
        `• Activate blockchain escrow for transparency\n\n` +
        `Coordination Agent Plan:\n` +
        `• Route optimization: 3 delivery points identified\n` +
        `• Local partners contacted: 2 confirmed\n` +
        `• Timeline: 6-8 hours for full deployment\n\n` +
        `Ready for Blockchain Deployment:\n` +
        `• Mission plan created and ready\n` +
        `• Click "Deploy Mission" button to trigger MetaMask\n` +
        `• Real PYUSD transaction will be initiated`;

      missionPlan = {
        id: `mission-${Date.now()}`,
        location: "Disaster Zone Alpha",
        supplies: [
          {
            name: "Emergency Medical Kits",
            quantity: 5,
            cost: 15, // $15 PYUSD (small test amount)
            supplier: "MedSupply Co.",
          },
          {
            name: "Water Purification Tablets",
            quantity: 20,
            cost: 5, // $5 PYUSD (small test amount)
            supplier: "AquaTech",
          },
          {
            name: "Emergency Food Rations",
            quantity: 10,
            cost: 10, // $10 PYUSD (small test amount)
            supplier: "NutriCorp",
          },
          {
            name: "Temporary Shelter Kits",
            quantity: 3,
            cost: 15, // $15 PYUSD (small test amount)
            supplier: "ShelterPro",
          },
        ],
        totalCost: 45, // $45 PYUSD total (small test amount)
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
        `FUNDING ANALYSIS COMPLETE\n\n` +
        `Funding Agent Report:\n` +
        `• Current emergency fund: $125 PYUSD\n` +
        `• Available for allocation: $95 PYUSD\n` +
        `• Pending missions: 3 active\n` +
        `• Funding efficiency: 94% utilization rate\n\n` +
        `Blockchain Integration:\n` +
        `• Smart contract escrow activated\n` +
        `• Multi-signature approval required\n` +
        `• Real-time fund tracking enabled\n\n` +
        `MetaMask Ready:\n` +
        `• Connect your wallet to process real transactions\n` +
        `• All funding will be transparent and verifiable\n\n` +
        `Recommendation: Ready to process funding requests with full transparency.`;

      transactionType = {
        type: "fund_allocation",
        amount: 25000,
      };
    } else {
      response =
        `AI AGENT COLLABORATION\n\n` +
        `Multi-Agent Analysis:\n` +
        `• 4 specialized agents working in coordination\n` +
        `• Real-time data processing: GDACS, weather, supply chains\n` +
        `• Blockchain integration: Full transparency and accountability\n` +
        `• Response time: < 2 minutes for complex scenarios\n\n` +
        `Current Capabilities:\n` +
        `• Emergency response planning\n` +
        `• Supply chain optimization\n` +
        `• Fund allocation and tracking\n` +
        `• Delivery verification and proof\n\n` +
        `MetaMask Integration:\n` +
        `• Real blockchain transactions\n` +
        `• PYUSD transfers with MetaMask popups\n` +
        `• Sepolia testnet verification\n\n` +
        `Ready for your humanitarian mission planning needs.`;
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === thinkingMessage
          ? { ...msg, content: "Analysis complete - Ready for action" }
          : msg
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

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

    // Check MetaMask connection
    if (!isConnected) {
      addMessage(
        "system",
        "MetaMask Connection Required\n\nPlease connect your MetaMask wallet to process real blockchain transactions.\n\nClick the 'Connect MetaMask' button above to continue.",
        undefined,
        undefined,
        undefined,
        undefined,
        ["Connect MetaMask"]
      );
      return;
    }

    // Switch to Sepolia testnet
    const switched = await switchToSepolia();
    if (!switched) {
      addMessage(
        "system",
        "Network Switch Failed\n\nCould not switch to Sepolia testnet. Please switch manually in MetaMask.",
        undefined,
        undefined,
        undefined,
        undefined,
        ["Try Again"]
      );
      return;
    }

    addMessage(
      "system",
      "Creating Real Mission on Blockchain\n\n" +
        "Calling AidRouteMissions.createMission()...\n" +
        "MetaMask popup will appear for transaction confirmation.",
      undefined,
      undefined,
      {
        type: "mission_creation",
        amount: currentPlan.totalCost,
        missionId: currentPlan.id,
      }
    );

    try {
      // Create mission on the actual smart contract
      const items = currentPlan.supplies.map((s) => s.name);
      const txHash = await createMission(
        currentPlan.location,
        `Emergency response mission: ${currentPlan.supplies.length} supply types needed`,
        items,
        currentPlan.totalCost
      );

      if (txHash) {
        const transactionMessage = addMessage(
          "transaction",
          `MISSION CREATED ON BLOCKCHAIN!\n\n` +
            `Contract: AidRouteMissions\n` +
            `Function: createMission()\n` +
            `Location: ${currentPlan.location}\n` +
            `Funding Goal: $${currentPlan.totalCost.toLocaleString()} PYUSD\n` +
            `Items: ${items.join(", ")}\n` +
            `Transaction Hash: ${txHash}\n` +
            `Network: Sepolia Testnet\n\n` +
            `View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}\n\n` +
            `Mission is now live on the blockchain and ready for donations!`,
          undefined,
          undefined,
          {
            type: "mission_creation",
            amount: currentPlan.totalCost,
            missionId: currentPlan.id,
            hash: txHash,
          }
        );

        // Store transaction in storage
        const message = messages.find((m) => m.id === transactionMessage);
        if (message) {
          const transaction = createTransactionFromMessage(
            message,
            txHash,
            "sepolia"
          );
          transactionStorage.addTransaction(transaction);
        } else {
          // Fallback: create transaction manually if message not found
          const transaction = {
            hash: txHash,
            type: "mission_creation" as const,
            amount: currentPlan.totalCost,
            currency: "PYUSD" as const,
            from: "user_wallet",
            to: "contract_address",
            missionId: currentPlan.id,
            description: `Mission created: ${currentPlan.location}`,
            status: "confirmed" as const,
            network: "sepolia" as const,
            agentName: "Logistics Agent",
            confidence: 0.95,
          };
          transactionStorage.addTransaction(transaction);
        }

        setTimeout(() => {
          setCurrentPlan(null);
        }, 3000);
      } else {
        addMessage(
          "system",
          "Mission Creation Failed\n\n" +
            "The blockchain transaction was not confirmed. Please try again.",
          undefined,
          undefined,
          undefined,
          undefined,
          ["Try Again"]
        );
      }
    } catch (err: any) {
      addMessage(
        "system",
        `Contract Interaction Error\n\n${
          err.message || "Unknown error occurred"
        }\n\nThis might be because:\n• Contract not deployed yet\n• Insufficient gas\n• Network issues`,
        undefined,
        undefined,
        undefined,
        undefined,
        ["Try Again", "Check Contract Status"]
      );
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Contract Deployment Status */}
      <DeploymentStatus />

      {/* MetaMask Status Bar */}
      <div className="mb-4 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">MetaMask Integration</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>
                      Connected: {account?.address?.slice(0, 6)}...
                      {account?.address?.slice(-4)}
                    </span>
                    <span>•</span>
                    <span>Balance: {account?.balance} ETH</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Not Connected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={!isMetaMaskInstalled || isLoading}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Connect MetaMask"
                )}
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {!isMetaMaskInstalled && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                MetaMask is not installed. Please install MetaMask to use
                blockchain features.
              </span>
            </div>
          </div>
        )}
      </div>

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
                  <span>
                    4 Agents Online •{" "}
                    {isConnected ? "MetaMask Connected" : "MetaMask Required"}
                  </span>
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
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative",
                        message.type === "agent" && "bg-blue-500",
                        message.type === "autonomous" &&
                          "bg-purple-500 animate-pulse",
                        message.type === "system" && "bg-green-500",
                        message.type === "transaction" && "bg-blue-500"
                      )}
                    >
                      {message.type === "agent" && (
                        <Brain className="w-4 h-4 text-white" />
                      )}
                      {message.type === "autonomous" && (
                        <AlertCircle className="w-4 h-4 text-white" />
                      )}
                      {message.type === "system" && (
                        <Zap className="w-4 h-4 text-white" />
                      )}
                      {message.type === "transaction" && (
                        <Wallet className="w-4 h-4 text-white" />
                      )}

                      {/* Priority indicator */}
                      {message.priority === "critical" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {message.priority === "high" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.type === "user" &&
                        "bg-primary text-primary-foreground ml-auto",
                      message.type === "agent" && "bg-secondary",
                      message.type === "autonomous" &&
                        "bg-purple-500/10 border border-purple-500/20",
                      message.type === "system" &&
                        "bg-green-500/10 border border-green-500/20",
                      message.type === "transaction" &&
                        "bg-blue-500/10 border border-blue-500/20"
                    )}
                  >
                    <div className="text-sm">
                      {message.content.split("\n").map((line, index) => {
                        if (line.startsWith("• ")) {
                          return (
                            <div
                              key={index}
                              className="flex items-start gap-2 ml-4 mb-1"
                            >
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">
                                {line.substring(2)}
                              </span>
                            </div>
                          );
                        }
                        if (
                          line.includes("Analysis:") ||
                          line.includes("Report:") ||
                          line.includes("Recommendation:") ||
                          line.includes("Plan:")
                        ) {
                          return (
                            <div
                              key={index}
                              className="font-semibold text-blue-600 mt-3 mb-2 flex items-center gap-2"
                            >
                              {getMessageHeaderIcon(line)}
                              {line}
                            </div>
                          );
                        }
                        if (
                          line.includes("Contract:") ||
                          line.includes("Function:") ||
                          line.includes("Location:") ||
                          line.includes("Amount:") ||
                          line.includes("Purpose:")
                        ) {
                          const [key, value] = line.split(": ");
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm mb-1"
                            >
                              <span className="font-medium text-gray-600 w-20">
                                {key}:
                              </span>
                              <span className="text-gray-900">{value}</span>
                            </div>
                          );
                        }
                        if (line.includes("Transaction Hash:")) {
                          const hash = line.split("Transaction Hash: ")[1];
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 mt-2 mb-2"
                            >
                              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {hash}
                              </span>
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://sepolia.etherscan.io/tx/${hash}`,
                                    "_blank"
                                  )
                                }
                                className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View
                              </button>
                            </div>
                          );
                        }
                        if (line.includes("View on Etherscan:")) {
                          const url = line.split("View on Etherscan: ")[1];
                          return (
                            <div key={index} className="mt-2 mb-2">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View on Etherscan
                              </a>
                            </div>
                          );
                        }
                        if (
                          line.includes("Network:") ||
                          line.includes("Funding Goal:") ||
                          line.includes("Items:")
                        ) {
                          const [key, value] = line.split(": ");
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm mb-1"
                            >
                              <span className="font-medium text-gray-600 w-24">
                                {key}:
                              </span>
                              <span className="text-gray-900">{value}</span>
                            </div>
                          );
                        }
                        if (line.trim() === "") {
                          return <div key={index} className="h-2"></div>;
                        }
                        // Proactive message titles
                        if (
                          (line.includes("Proactive") && index === 0) ||
                          (line.includes("Supply Chain Optimization") &&
                            index === 0) ||
                          (line.includes("Partnership Opportunity") &&
                            index === 0) ||
                          (line.includes("Audit Recommendation") && index === 0)
                        ) {
                          return (
                            <div
                              key={index}
                              className="font-bold text-base mb-3 p-2.5 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border-l-4 border-purple-500"
                            >
                              <div className="flex items-center gap-2 text-gray-800">
                                {getMessageHeaderIcon(line)}
                                {line}
                              </div>
                            </div>
                          );
                        }
                        if (
                          line.includes("AUTONOMOUS ALERT DETECTED") ||
                          line.includes("CRITICAL ALERT PROCESSED") ||
                          line.includes("FUNDING ANALYSIS COMPLETE") ||
                          line.includes("AI AGENT COLLABORATION")
                        ) {
                          let icon = (
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                          );
                          if (line.includes("FUNDING")) {
                            icon = (
                              <DollarSign className="w-5 h-5 text-green-600" />
                            );
                          } else if (line.includes("AI AGENT")) {
                            icon = (
                              <Brain className="w-5 h-5 text-purple-500" />
                            );
                          }
                          return (
                            <div
                              key={index}
                              className="font-bold text-lg mb-3 p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border-l-4 border-blue-500"
                            >
                              <div className="flex items-center gap-2 text-gray-800">
                                {icon}
                                {line}
                              </div>
                            </div>
                          );
                        }
                        if (
                          line.includes("MISSION CREATED ON BLOCKCHAIN") ||
                          line.includes("EMERGENCY FUNDS DEPLOYED") ||
                          line.includes("DONATION SUCCESSFUL") ||
                          line.includes("CONTRACT STATS RETRIEVED")
                        ) {
                          let icon = (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          );
                          if (line.includes("EMERGENCY FUNDS")) {
                            icon = <Zap className="w-5 h-5 text-orange-500" />;
                          } else if (line.includes("DONATION")) {
                            icon = <Gift className="w-5 h-5 text-purple-500" />;
                          } else if (line.includes("CONTRACT STATS")) {
                            icon = (
                              <BarChart3 className="w-5 h-5 text-blue-500" />
                            );
                          }
                          return (
                            <div
                              key={index}
                              className="font-bold text-lg mb-3 p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border-l-4 border-green-500"
                            >
                              <div className="flex items-center gap-2 text-gray-800">
                                {icon}
                                {line}
                              </div>
                            </div>
                          );
                        }
                        if (
                          line.includes("Contract Interaction Error") ||
                          line.includes("Mission Creation Failed") ||
                          line.includes("Donation Failed") ||
                          line.includes("Contract Query Failed")
                        ) {
                          return (
                            <div
                              key={index}
                              className="font-bold text-lg mb-3 p-3 bg-gradient-to-r from-red-50 to-transparent rounded-lg border-l-4 border-red-500"
                            >
                              <div className="flex items-center gap-2 text-gray-800">
                                <XCircle className="w-5 h-5 text-red-500" />
                                {line}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={index}
                            className="text-sm leading-relaxed mb-1"
                          >
                            {line}
                          </div>
                        );
                      })}
                    </div>

                    {/* Transaction Data Section */}
                    {message.transactionData && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap gap-2">
                          {message.transactionData.type && (
                            <div className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                              <Package className="w-3 h-3" />
                              <span className="font-medium">
                                {message.transactionData.type
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                          )}
                          {message.transactionData.amount && (
                            <div className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-700 px-2.5 py-1 rounded-md border border-green-200">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-medium">
                                $
                                {message.transactionData.amount.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {message.transactionData.missionId && (
                            <div className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200">
                              <MapPin className="w-3 h-3" />
                              <span className="font-medium font-mono text-[10px]">
                                {message.transactionData.missionId.slice(0, 16)}
                                ...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reasoning Section */}
                    {message.reasoning && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 p-2.5 rounded-lg">
                          <Brain className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-purple-500" />
                          <div>
                            <span className="font-medium text-gray-700">
                              Agent Reasoning:
                            </span>{" "}
                            <span className="italic">{message.reasoning}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-xs opacity-70 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(message.timestamp)}
                        </div>
                        {message.confidence && (
                          <div className="text-xs bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-blue-200">
                            <BarChart3 className="w-3 h-3" />
                            {Math.floor(message.confidence * 100)}% confident
                          </div>
                        )}
                        {message.priority === "critical" && (
                          <div className="text-xs bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Critical
                          </div>
                        )}
                        {message.priority === "high" && (
                          <div className="text-xs bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-orange-200">
                            <AlertCircle className="w-3 h-3" />
                            High Priority
                          </div>
                        )}
                        {message.priority === "medium" && (
                          <div className="text-xs bg-gradient-to-r from-yellow-500/20 to-green-500/20 text-yellow-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-yellow-200">
                            <Activity className="w-3 h-3" />
                            Medium
                          </div>
                        )}
                      </div>
                      {message.agentName && (
                        <div className="text-xs opacity-70 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {message.agentName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-11 max-w-[80%]">
                    {message.suggestions.map((suggestion, idx) => {
                      // Determine icon for suggestion
                      let suggestionIcon = null;
                      if (
                        suggestion.includes("Deploy") ||
                        suggestion.includes("deploy")
                      ) {
                        suggestionIcon = <Zap className="w-3 h-3" />;
                      } else if (
                        suggestion.includes("Connect") ||
                        suggestion.includes("MetaMask")
                      ) {
                        suggestionIcon = <Wallet className="w-3 h-3" />;
                      } else if (
                        suggestion.includes("Fund") ||
                        suggestion.includes("Allocate")
                      ) {
                        suggestionIcon = <DollarSign className="w-3 h-3" />;
                      } else if (
                        suggestion.includes("View") ||
                        suggestion.includes("Show")
                      ) {
                        suggestionIcon = <Eye className="w-3 h-3" />;
                      } else if (
                        suggestion.includes("Check") ||
                        suggestion.includes("Status")
                      ) {
                        suggestionIcon = <Activity className="w-3 h-3" />;
                      }

                      return (
                        <button
                          key={idx}
                          onClick={async () => {
                            if (suggestion === "Connect MetaMask") {
                              connect();
                            } else if (
                              suggestion === "Deploy Emergency Funds"
                            ) {
                              // Trigger emergency fund deployment
                              if (!isConnected) {
                                addMessage(
                                  "system",
                                  "Please connect MetaMask first to deploy emergency funds."
                                );
                                return;
                              }

                              try {
                                addMessage(
                                  "system",
                                  "DEPLOYING EMERGENCY FUNDS\n\n" +
                                    "Initiating emergency fund allocation...\n" +
                                    "MetaMask popup will appear for transaction confirmation."
                                );

                                const txHash = await sendTransaction({
                                  to: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9", // PYUSD contract
                                  value: "0x0",
                                  data: "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b60000000000000000000000000000000000000000000000000000000000002710",
                                });

                                if (txHash) {
                                  const emergencyMessage = addMessage(
                                    "transaction",
                                    `EMERGENCY FUNDS DEPLOYED\n\n` +
                                      `Amount: $25 PYUSD\n` +
                                      `Purpose: Emergency disaster response\n` +
                                      `Transaction Hash: ${txHash}\n` +
                                      `Network: Sepolia Testnet\n\n` +
                                      `View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}\n\n` +
                                      `Emergency funds have been successfully allocated and are ready for deployment to disaster relief operations.`,
                                    undefined,
                                    undefined,
                                    {
                                      type: "emergency_funds",
                                      amount: 25,
                                      hash: txHash,
                                    }
                                  );

                                  // Store transaction in storage
                                  const message = messages.find(
                                    (m) => m.id === emergencyMessage
                                  );
                                  if (message) {
                                    const transaction =
                                      createTransactionFromMessage(
                                        message,
                                        txHash,
                                        "sepolia"
                                      );
                                    transactionStorage.addTransaction(
                                      transaction
                                    );
                                  }
                                }
                              } catch (err: any) {
                                addMessage(
                                  "system",
                                  `Emergency fund deployment failed: ${err.message}`
                                );
                              }
                            } else if (suggestion === "Allocate funds") {
                              // Trigger fund allocation with MetaMask popup
                              if (!isConnected) {
                                addMessage(
                                  "system",
                                  "Please connect MetaMask first to allocate funds."
                                );
                                return;
                              }

                              try {
                                addMessage(
                                  "system",
                                  "ALLOCATING FUNDS\n\n" +
                                    "Calling AidRouteMissions.donate()...\n" +
                                    "This will allocate $5 PYUSD to the general fund (small test amount).\n" +
                                    "MetaMask popup will appear for transaction confirmation."
                                );

                                // Make a real donation to the contract
                                const txHash = await donateTo(5, 0); // $5 to general fund (missionId = 0) - SMALL TEST AMOUNT

                                if (txHash) {
                                  const allocationMessage = addMessage(
                                    "transaction",
                                    `FUND ALLOCATION SUCCESSFUL\n\n` +
                                      `Contract: AidRouteMissions\n` +
                                      `Function: donate()\n` +
                                      `Amount: $5 PYUSD\n` +
                                      `Target: General Fund (Mission ID: 0)\n` +
                                      `Transaction Hash: ${txHash}\n` +
                                      `Network: Sepolia Testnet\n\n` +
                                      `View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}\n\n` +
                                      `Funds have been successfully allocated to humanitarian aid!`,
                                    undefined,
                                    undefined,
                                    {
                                      type: "fund_allocation",
                                      amount: 5,
                                      hash: txHash,
                                    }
                                  );

                                  // Store transaction in storage
                                  const message = messages.find(
                                    (m) => m.id === allocationMessage
                                  );
                                  if (message) {
                                    const transaction =
                                      createTransactionFromMessage(
                                        message,
                                        txHash,
                                        "sepolia"
                                      );
                                    transactionStorage.addTransaction(
                                      transaction
                                    );
                                  }
                                } else {
                                  addMessage(
                                    "system",
                                    "Fund Allocation Failed\n\nTransaction was not confirmed. This might be due to:\n• Insufficient PYUSD balance\n• Contract not deployed\n• Gas estimation failed"
                                  );
                                }
                              } catch (err: any) {
                                addMessage(
                                  "system",
                                  `Fund allocation failed: ${err.message}\n\nMake sure you have:\n• PYUSD tokens in your wallet\n• Approved the contract to spend PYUSD\n• Sufficient ETH for gas`
                                );
                              }
                            } else {
                              setInputMessage(suggestion);
                              setTimeout(handleSendMessage, 100);
                            }
                          }}
                          className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-full transition-colors flex items-center gap-1.5 font-medium"
                          disabled={isProcessing}
                        >
                          {suggestionIcon}
                          {suggestion}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-secondary rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="font-medium">AI agents collaborating</span>
                    <div className="flex gap-1 ml-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
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

        {/* Mission Panel */}
        <div className="space-y-6">
          {/* Agent Network Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Agent Network Status
              </h3>
              <button
                onClick={() => setAutonomousMode(!autonomousMode)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
                  autonomousMode
                    ? "bg-green-500/20 text-green-600 border border-green-500/30"
                    : "bg-gray-500/20 text-gray-600 border border-gray-500/30"
                )}
              >
                {autonomousMode ? (
                  <>
                    <Zap className="w-3 h-3" />
                    Autonomous ON
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3" />
                    Manual Mode
                  </>
                )}
              </button>
            </div>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      agent.specialization === "logistics" && "bg-blue-500",
                      agent.specialization === "funding" && "bg-green-500",
                      agent.specialization === "coordination" &&
                        "bg-purple-500",
                      agent.specialization === "verification" && "bg-orange-500"
                    )}
                  >
                    {agent.specialization === "logistics" && (
                      <Route className="w-4 h-4 text-white" />
                    )}
                    {agent.specialization === "funding" && (
                      <DollarSign className="w-4 h-4 text-white" />
                    )}
                    {agent.specialization === "coordination" && (
                      <Users className="w-4 h-4 text-white" />
                    )}
                    {agent.specialization === "verification" && (
                      <Shield className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{agent.name}</span>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          agent.status === "online" && "bg-green-500",
                          agent.status === "busy" && "bg-yellow-500",
                          agent.status === "analyzing" &&
                            "bg-blue-500 animate-pulse",
                          agent.status === "offline" && "bg-red-500"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-[10px] font-medium uppercase px-1.5 py-0.5 rounded",
                          agent.status === "online" &&
                            "bg-green-100 text-green-700",
                          agent.status === "busy" &&
                            "bg-yellow-100 text-yellow-700",
                          agent.status === "analyzing" &&
                            "bg-blue-100 text-blue-700",
                          agent.status === "offline" &&
                            "bg-red-100 text-red-700"
                        )}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>{Math.floor(agent.confidence * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>{Math.floor(agent.workload * 100)}%</span>
                      </div>
                    </div>
                    {agent.currentTask && (
                      <div className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {agent.currentTask}
                      </div>
                    )}
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
                disabled={!isConnected || isLoading}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Deploy Mission & Trigger MetaMask Transaction"
                )}
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
    </div>
  );
}
