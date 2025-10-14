export interface Need {
  id: string;
  location: string;
  item: string;
  quantity: number;
  urgency: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  status: "pending" | "in_progress" | "fulfilled";
}

export interface Mission {
  id: string;
  destination: string;
  coordinates: { x: number; y: number };
  status: "planning" | "en_route" | "delivered" | "completed";
  assignedResources: string[];
  fundsRequired: number;
  timestamp: Date;
  proofHash?: string;
}

export interface AuditLog {
  missionId: string;
  deliveryZone: string;
  fundsSettled: number;
  proofHash: string;
  status: "verified" | "pending_verification";
  timestamp: Date;
  recipientSignature?: string;
  transactionHash?: string;
}

export interface SystemStats {
  activeMissions: number;
  urgentNeeds: number;
  verifiedDeliveries: number;
  totalFundsDeployed: number;
  averageResponseTime: number;
}

export interface ActivityFeedItem {
  id: string;
  type:
    | "need_registered"
    | "mission_confirmed"
    | "delivery_verified"
    | "funds_deployed";
  message: string;
  timestamp: Date;
  location?: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  reasoning?: string;
}

export type DashboardView = "home" | "operations" | "planning" | "audit";
