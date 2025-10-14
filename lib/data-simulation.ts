import {
  Need,
  Mission,
  AuditLog,
  SystemStats,
  ActivityFeedItem,
  AIChatMessage,
} from "./types";

// Mock data generators
export const generateMockNeeds = (): Need[] => [
  {
    id: "need-001",
    location: "Camp Alpha",
    item: "Medical Supplies",
    quantity: 150,
    urgency: "critical",
    timestamp: new Date(Date.now() - 300000),
    status: "pending",
  },
  {
    id: "need-002",
    location: "Zone Beta",
    item: "Food Rations",
    quantity: 500,
    urgency: "high",
    timestamp: new Date(Date.now() - 180000),
    status: "in_progress",
  },
  {
    id: "need-003",
    location: "Sector Gamma",
    item: "Water Purification",
    quantity: 75,
    urgency: "medium",
    timestamp: new Date(Date.now() - 120000),
    status: "pending",
  },
];

export const generateMockMissions = (): Mission[] => [
  {
    id: "mission-042",
    destination: "Zone Delta",
    coordinates: { x: 340, y: 180 },
    status: "en_route",
    assignedResources: ["Truck-7A", "Coordinator-3B"],
    fundsRequired: 4500,
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: "mission-043",
    destination: "Camp Alpha",
    coordinates: { x: 120, y: 90 },
    status: "planning",
    assignedResources: ["Drone-2X"],
    fundsRequired: 3200,
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "mission-041",
    destination: "Sector Gamma",
    coordinates: { x: 280, y: 240 },
    status: "completed",
    assignedResources: ["Truck-5C"],
    fundsRequired: 2800,
    timestamp: new Date(Date.now() - 900000),
    proofHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
  },
];

export const generateMockAuditLogs = (): AuditLog[] => [
  {
    missionId: "mission-041",
    deliveryZone: "Sector Gamma",
    fundsSettled: 2800,
    proofHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
    status: "verified",
    timestamp: new Date(Date.now() - 900000),
    recipientSignature: "sig_recipient_gamma_001",
    transactionHash: "tx_0x1a2b3c4d5e6f7890abcdef1234567890",
  },
  {
    missionId: "mission-040",
    deliveryZone: "Camp Beta",
    fundsSettled: 5200,
    proofHash: "0x9876543210fedcba0987654321fedcba",
    status: "verified",
    timestamp: new Date(Date.now() - 1800000),
    recipientSignature: "sig_recipient_beta_002",
    transactionHash: "tx_0x9876543210fedcba0987654321fedcba",
  },
];

export const generateSystemStats = (): SystemStats => ({
  activeMissions: 12,
  urgentNeeds: 8,
  verifiedDeliveries: 47,
  totalFundsDeployed: 125400,
  averageResponseTime: 2.3,
});

export const generateActivityFeed = (): ActivityFeedItem[] => [
  {
    id: "activity-001",
    type: "need_registered",
    message: "New Need Registered: Camp Beta – Medical Supplies",
    timestamp: new Date(Date.now() - 45000),
    location: "Camp Beta",
  },
  {
    id: "activity-002",
    type: "mission_confirmed",
    message: "Mission #042 Confirmed – En Route to Zone Delta",
    timestamp: new Date(Date.now() - 120000),
    location: "Zone Delta",
  },
  {
    id: "activity-003",
    type: "delivery_verified",
    message: "Delivery Verified: Sector Gamma – 75 Water Units",
    timestamp: new Date(Date.now() - 300000),
    location: "Sector Gamma",
  },
  {
    id: "activity-004",
    type: "funds_deployed",
    message: "Funds Deployed: $2,800 PYUSD to Mission #041",
    timestamp: new Date(Date.now() - 600000),
  },
];

export const generateAIChatHistory = (): AIChatMessage[] => [
  {
    id: "msg-001",
    role: "user",
    content: "Plan delivery for Camp Beta",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "msg-002",
    role: "assistant",
    content: "Searching network for available supply nodes…",
    timestamp: new Date(Date.now() - 290000),
  },
  {
    id: "msg-003",
    role: "assistant",
    content: "Calculating optimal route using MeTTa Nodes…",
    timestamp: new Date(Date.now() - 280000),
  },
  {
    id: "msg-004",
    role: "assistant",
    content:
      "Proposal ready: Supplier Y optimal. Route Risk: Low. Funds Required: 4500 PYUSD.",
    timestamp: new Date(Date.now() - 270000),
    reasoning:
      "Supplier Y selected based on proximity (12km), reliability score (94%), and cost efficiency. Route optimized using MeTTa node network to avoid conflict zones. Estimated delivery time: 3.2 hours.",
  },
];

// Utility functions for data updates
export const updateMissionStatus = (
  missions: Mission[],
  missionId: string,
  newStatus: Mission["status"]
): Mission[] => {
  return missions.map((mission) =>
    mission.id === missionId ? { ...mission, status: newStatus } : mission
  );
};

export const addNewNeed = (
  needs: Need[],
  newNeed: Omit<Need, "id" | "timestamp">
): Need[] => {
  const need: Need = {
    ...newNeed,
    id: `need-${Date.now()}`,
    timestamp: new Date(),
  };
  return [need, ...needs];
};

export const addNewActivity = (
  activities: ActivityFeedItem[],
  newActivity: Omit<ActivityFeedItem, "id" | "timestamp">
): ActivityFeedItem[] => {
  const activity: ActivityFeedItem = {
    ...newActivity,
    id: `activity-${Date.now()}`,
    timestamp: new Date(),
  };
  return [activity, ...activities];
};
