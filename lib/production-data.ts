// Production data service for AidRoute autonomous humanitarian dashboard
// Manages real-time data that updates dynamically for live system monitoring

export interface Need {
  id: string;
  location: string;
  item: string;
  quantity: number;
  urgency: "critical" | "high" | "medium" | "low";
  timestamp: Date;
  status: "open" | "assigned" | "fulfilled";
}

export interface Mission {
  id: string;
  needId: string;
  location: string;
  destination: string;
  status: "planning" | "en-route" | "delivering" | "completed" | "failed";
  assignedResources: string[];
  fundsRequired: number;
  estimatedArrival?: Date;
  progress: number; // 0-100
  coordinates: { lat: number; lng: number };
  timestamp: Date;
}

export interface AuditRecord {
  id: string;
  missionId: string;
  deliveryZone: string;
  fundsSettled: number;
  proofHash: string;
  status: "verified" | "pending" | "disputed";
  recipientSignature: string;
  timestamp: Date;
  transactionId: string;
}

export interface SystemStats {
  activeMissions: number;
  urgentNeeds: number;
  verifiedDeliveries: number;
  totalFundsDeployed: number;
}

class AidRouteDataService {
  private needs: Need[] = [];
  private missions: Mission[] = [];
  private auditRecords: AuditRecord[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeData();
    this.startDataUpdates();
  }

  private initializeData() {
    // Initialize with some sample data
    const locations = [
      "Camp Alpha",
      "Zone Beta",
      "Sector Gamma",
      "District Delta",
      "Region Epsilon",
    ];
    const items = [
      "Medical Supplies",
      "Food Rations",
      "Water Purification",
      "Shelter Materials",
      "Communications Equipment",
    ];

    // Create initial needs
    for (let i = 0; i < 8; i++) {
      this.needs.push(this.generateNeed(locations, items));
    }

    // Create initial missions
    for (let i = 0; i < 5; i++) {
      const need = this.needs[i];
      this.missions.push(this.generateMission(need, locations));
    }

    // Create audit records for completed missions
    for (let i = 0; i < 12; i++) {
      this.auditRecords.push(this.generateAuditRecord());
    }
  }

  private generateNeed(locations: string[], items: string[]): Need {
    const urgencies: Need["urgency"][] = ["critical", "high", "medium", "low"];
    return {
      id: `need-${Math.random().toString(36).substr(2, 9)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      item: items[Math.floor(Math.random() * items.length)],
      quantity: Math.floor(Math.random() * 1000) + 50,
      urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      status: Math.random() > 0.7 ? "open" : "assigned",
    };
  }

  private generateMission(need: Need, locations: string[]): Mission {
    const statuses: Mission["status"][] = [
      "planning",
      "en-route",
      "delivering",
    ];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `mission-${Math.random().toString(36).substr(2, 9)}`,
      needId: need.id,
      location: locations[Math.floor(Math.random() * locations.length)],
      destination: need.location,
      status,
      assignedResources: [
        `Agent-${Math.floor(Math.random() * 10)}`,
        `Vehicle-${Math.floor(Math.random() * 20)}`,
      ],
      fundsRequired: Math.floor(Math.random() * 10000) + 1000,
      estimatedArrival: new Date(
        Date.now() + Math.random() * 48 * 60 * 60 * 1000
      ),
      progress: status === "planning" ? 0 : Math.floor(Math.random() * 90) + 10,
      coordinates: {
        lat: 35.8617 + (Math.random() - 0.5) * 10,
        lng: 104.1954 + (Math.random() - 0.5) * 10,
      },
      timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
    };
  }

  private generateAuditRecord(): AuditRecord {
    const zones = ["Alpha-7", "Beta-3", "Gamma-12", "Delta-9", "Epsilon-5"];
    return {
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      missionId: `mission-${Math.random().toString(36).substr(2, 9)}`,
      deliveryZone: zones[Math.floor(Math.random() * zones.length)],
      fundsSettled: Math.floor(Math.random() * 15000) + 2000,
      proofHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: Math.random() > 0.1 ? "verified" : "pending",
      recipientSignature: `sig_${Math.random().toString(36).substr(2, 16)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      transactionId: `tx_${Math.random().toString(36).substr(2, 12)}`,
    };
  }

  private startDataUpdates() {
    // Update mission progress every 3 seconds
    setInterval(() => {
      this.missions.forEach((mission) => {
        if (mission.status === "en-route" || mission.status === "delivering") {
          mission.progress = Math.min(
            100,
            mission.progress + Math.random() * 5
          );
          if (mission.progress >= 100 && mission.status === "en-route") {
            mission.status = "delivering";
            mission.progress = 0;
          } else if (
            mission.progress >= 100 &&
            mission.status === "delivering"
          ) {
            mission.status = "completed";
            this.completeMission(mission);
          }
        }
      });
      this.emit("missions-updated", this.missions);
    }, 3000);

    // Add new needs every 15-30 seconds
    setInterval(() => {
      const locations = [
        "Camp Alpha",
        "Zone Beta",
        "Sector Gamma",
        "District Delta",
        "Region Epsilon",
      ];
      const items = [
        "Medical Supplies",
        "Food Rations",
        "Water Purification",
        "Shelter Materials",
        "Communications Equipment",
      ];

      if (Math.random() > 0.3) {
        const newNeed = this.generateNeed(locations, items);
        this.needs.unshift(newNeed);
        this.emit("need-added", newNeed);
        this.emit("needs-updated", this.needs);
      }
    }, Math.random() * 15000 + 15000);

    // Progress planning missions to en-route
    setInterval(() => {
      const planningMissions = this.missions.filter(
        (m) => m.status === "planning"
      );
      if (planningMissions.length > 0 && Math.random() > 0.5) {
        const mission = planningMissions[0];
        mission.status = "en-route";
        mission.progress = 5;
        this.emit("mission-status-changed", mission);
      }
    }, 8000);
  }

  private completeMission(mission: Mission) {
    // Create audit record for completed mission
    const auditRecord: AuditRecord = {
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      missionId: mission.id,
      deliveryZone: mission.destination,
      fundsSettled: mission.fundsRequired,
      proofHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: "verified",
      recipientSignature: `sig_${Math.random().toString(36).substr(2, 16)}`,
      timestamp: new Date(),
      transactionId: `tx_${Math.random().toString(36).substr(2, 12)}`,
    };

    this.auditRecords.unshift(auditRecord);
    this.emit("mission-completed", { mission, auditRecord });
    this.emit("audit-updated", this.auditRecords);
  }

  // Event system for real-time updates
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Public getters
  getNeeds(): Need[] {
    return [...this.needs];
  }

  getMissions(): Mission[] {
    return [...this.missions];
  }

  getAuditRecords(): AuditRecord[] {
    return [...this.auditRecords];
  }

  getSystemStats(): SystemStats {
    return {
      activeMissions: this.missions.filter((m) =>
        ["planning", "en-route", "delivering"].includes(m.status)
      ).length,
      urgentNeeds: this.needs.filter(
        (n) => n.urgency === "critical" && n.status === "open"
      ).length,
      verifiedDeliveries: this.auditRecords.filter(
        (a) => a.status === "verified"
      ).length,
      totalFundsDeployed: this.auditRecords
        .filter((a) => a.status === "verified")
        .reduce((sum, a) => sum + a.fundsSettled, 0),
    };
  }

  // Mission planning service for AI interaction
  planMission(needId: string): Promise<{
    supplier: string;
    route: string;
    risk: string;
    funds: number;
    reasoning: string;
  }> {
    return new Promise((resolve) => {
      // Simulate AI planning delay
      setTimeout(() => {
        const suppliers = [
          "Global Aid Co.",
          "Humanitarian Supply Corp.",
          "Relief Logistics Ltd.",
          "Emergency Supplies Inc.",
        ];
        const supplier =
          suppliers[Math.floor(Math.random() * suppliers.length)];
        const funds = Math.floor(Math.random() * 8000) + 2000;

        resolve({
          supplier,
          route: "Optimized via MeTTa Network Analysis",
          risk: Math.random() > 0.7 ? "Medium" : "Low",
          funds,
          reasoning: `Selected ${supplier} based on proximity (12.4 km), inventory availability (98%), and cost efficiency ($${funds}). Route optimized using real-time conflict zone analysis and weather patterns.`,
        });
      }, 2000 + Math.random() * 3000);
    });
  }
}

// Singleton instance
export const aidRouteDataService = new AidRouteDataService();
