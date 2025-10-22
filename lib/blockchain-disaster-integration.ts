// Blockchain integration service for real-time disaster data
// Automatically creates missions on blockchain when critical disasters are detected

import {
  realTimeDisasterService,
  type DisasterEvent,
  type Need,
  type Mission,
} from "./real-time-disasters";

interface BlockchainConfig {
  rpcUrl: string;
  contractAddress: string;
  pyusdAddress: string;
  privateKey?: string;
}

interface MissionOnChain {
  id: number;
  location: string;
  description: string;
  items: string[];
  fundingGoal: number; // in PYUSD (6 decimals)
  status: string;
  created: boolean;
}

class BlockchainDisasterIntegration {
  private config: BlockchainConfig;
  private pendingMissions: Map<string, MissionOnChain> = new Map();
  private processedDisasters: Set<string> = new Set();
  private missionCounter = 1;

  constructor() {
    // Initialize with default config - in a real app, load from environment
    this.config = {
      rpcUrl:
        process.env.SEPOLIA_RPC_URL ||
        "https://ethereum-sepolia-rpc.publicnode.com",
      contractAddress:
        process.env.CONTRACT_ADDRESS ||
        "0x681735982373ae65a8f8b2074922a924780ba360",
      pyusdAddress:
        process.env.PYUSD_ADDRESS ||
        "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
      privateKey: process.env.PRIVATE_KEY,
    };

    this.initializeListeners();
    console.log("🔗 Blockchain disaster integration initialized");
  }

  private initializeListeners() {
    // Listen for disaster events from the real-time service
    realTimeDisasterService.on(
      "disasters-updated",
      (events: DisasterEvent[]) => {
        this.processCriticalDisasters(events);
      }
    );

    // Listen for new needs that might require blockchain missions
    realTimeDisasterService.on("need-added", (need: Need) => {
      if (need.urgency === "critical") {
        this.createBlockchainMission(need);
      }
    });

    // Listen for mission completion to update blockchain
    realTimeDisasterService.on(
      "mission-completed",
      ({ mission, auditRecord }: any) => {
        this.updateBlockchainMissionStatus(mission, "completed");
      }
    );
  }

  private async processCriticalDisasters(events: DisasterEvent[]) {
    for (const event of events) {
      // Only process each disaster once
      if (this.processedDisasters.has(event.id)) {
        continue;
      }

      // Only create blockchain missions for critical/high severity disasters
      if (event.data.severity_score >= 4) {
        await this.createDisasterMission(event);
        this.processedDisasters.add(event.id);
      }
    }
  }

  private async createDisasterMission(disaster: DisasterEvent): Promise<void> {
    try {
      console.log(
        `🚨 Creating blockchain mission for critical disaster: ${disaster.data.title}`
      );

      const missionData = this.generateMissionFromDisaster(disaster);

      // In a real implementation, this would interact with the actual smart contract
      // For now, we'll simulate the blockchain interaction
      const result = await this.simulateBlockchainMissionCreation(missionData);

      if (result.success) {
        console.log(
          `✅ Mission #${result.missionId} created on blockchain for ${disaster.data.location}`
        );

        // Add to pending missions tracking
        this.pendingMissions.set(disaster.id, {
          ...missionData,
          id: result.missionId,
          created: true,
        });

        // Emit blockchain mission created event
        this.emitMissionCreatedEvent(result.missionId, missionData, disaster);
      } else {
        console.error(
          "❌ Failed to create mission on blockchain:",
          result.error
        );
      }
    } catch (error) {
      console.error("Error creating disaster mission:", error);
    }
  }

  private generateMissionFromDisaster(
    disaster: DisasterEvent
  ): Omit<MissionOnChain, "id" | "created"> {
    // Determine required items based on disaster type
    const itemsByDisasterType = {
      EQ: [
        "Emergency Medical Supplies",
        "Search & Rescue Equipment",
        "Temporary Shelter Materials",
        "Water Purification Systems",
      ],
      TC: [
        "Storm Shelter Supplies",
        "Emergency Food Rations",
        "Water Storage",
        "Communications Equipment",
      ],
      FL: [
        "Water Purification Tablets",
        "Emergency Boats",
        "Flood Barriers",
        "Medical Supplies",
      ],
      VO: [
        "Respiratory Protection Masks",
        "Evacuation Vehicles",
        "Emergency Medical Kits",
        "Communication Radios",
      ],
      WF: [
        "Fire Suppression Equipment",
        "Evacuation Buses",
        "Respiratory Protection",
        "Emergency Medical Care",
      ],
      DR: [
        "Water Tankers",
        "Food Aid Packages",
        "Agricultural Seeds",
        "Nutrition Supplements",
      ],
    };

    const items = itemsByDisasterType[
      disaster.data.event_type as keyof typeof itemsByDisasterType
    ] || ["Emergency Supplies", "Medical Aid", "Food & Water"];

    // Calculate funding goal based on severity and estimated affected population
    const baseFunding = 10000; // $10k base
    const severityMultiplier = disaster.data.severity_score;
    const urgencyMultiplier = disaster.data.urgency === "critical" ? 2 : 1.5;

    const fundingGoal = Math.floor(
      baseFunding * severityMultiplier * urgencyMultiplier
    );

    return {
      location: disaster.data.location,
      description: `Emergency response to ${disaster.data.type_name} in ${disaster.data.location}. ${disaster.data.title}. Immediate humanitarian assistance required.`,
      items: items,
      fundingGoal: fundingGoal * 1_000_000, // Convert to PYUSD wei (6 decimals)
      status: "Pending",
    };
  }

  private async createBlockchainMission(need: Need): Promise<void> {
    try {
      console.log(
        `🔗 Creating blockchain mission for critical need: ${need.item} in ${need.location}`
      );

      const missionData = {
        location: need.location,
        description: `Critical need for ${need.item} in ${need.location}. Quantity required: ${need.quantity} units.`,
        items: [need.item],
        fundingGoal: need.quantity * 50 * 1_000_000, // $50 per unit, converted to PYUSD wei
        status: "Pending",
      };

      const result = await this.simulateBlockchainMissionCreation(missionData);

      if (result.success) {
        console.log(
          `✅ Mission #${result.missionId} created on blockchain for need ${need.id}`
        );
        this.emitMissionCreatedEvent(result.missionId, missionData, null, need);
      }
    } catch (error) {
      console.error("Error creating blockchain mission from need:", error);
    }
  }

  private async simulateBlockchainMissionCreation(
    missionData: any
  ): Promise<{
    success: boolean;
    missionId?: number;
    error?: string;
    txHash?: string;
  }> {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simulate 95% success rate
    if (Math.random() < 0.95) {
      const missionId = this.missionCounter++;
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      return {
        success: true,
        missionId,
        txHash,
      };
    } else {
      return {
        success: false,
        error: "Transaction failed - insufficient gas or network congestion",
      };
    }
  }

  private async updateBlockchainMissionStatus(
    mission: Mission,
    status: string
  ): Promise<void> {
    try {
      console.log(
        `🔄 Updating blockchain mission status to ${status} for mission ${mission.id}`
      );

      // Simulate blockchain status update
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(
        `✅ Mission ${mission.id} status updated to ${status} on blockchain`
      );
    } catch (error) {
      console.error("Error updating mission status on blockchain:", error);
    }
  }

  private emitMissionCreatedEvent(
    missionId: number,
    missionData: any,
    disaster?: DisasterEvent,
    need?: Need
  ) {
    const event = {
      type: "blockchain_mission_created",
      missionId,
      data: missionData,
      source: disaster ? "disaster" : "need",
      sourceData: disaster || need,
      timestamp: new Date().toISOString(),
    };

    // Emit to real-time service listeners
    realTimeDisasterService["emit"]("blockchain-mission-created", event);

    // Log the blockchain activity
    console.log(
      `📝 Blockchain Mission #${missionId}: ${missionData.description}`
    );
    console.log(
      `💰 Funding Goal: ${(
        missionData.fundingGoal / 1_000_000
      ).toLocaleString()} PYUSD`
    );
    console.log(`📦 Items: ${missionData.items.join(", ")}`);
  }

  // Public methods for external use
  public getPendingMissions(): MissionOnChain[] {
    return Array.from(this.pendingMissions.values());
  }

  public getProcessedDisasters(): string[] {
    return Array.from(this.processedDisasters);
  }

  public getBlockchainStats() {
    const totalMissions = this.missionCounter - 1;
    const pendingMissions = this.pendingMissions.size;
    const totalFunding = Array.from(this.pendingMissions.values()).reduce(
      (sum, mission) => sum + mission.fundingGoal,
      0
    );

    return {
      totalMissionsCreated: totalMissions,
      pendingMissions,
      totalFundingRequested: totalFunding / 1_000_000, // Convert back to PYUSD
      processedDisasters: this.processedDisasters.size,
      successRate: 0.95, // Simulated success rate
    };
  }

  // Method to manually create a mission (for testing or admin use)
  public async createManualMission(
    location: string,
    description: string,
    items: string[],
    fundingGoal: number
  ): Promise<number | null> {
    try {
      const missionData = {
        location,
        description,
        items,
        fundingGoal: fundingGoal * 1_000_000, // Convert to wei
        status: "Pending",
      };

      const result = await this.simulateBlockchainMissionCreation(missionData);

      if (result.success && result.missionId) {
        this.emitMissionCreatedEvent(result.missionId, missionData);
        return result.missionId;
      } else {
        console.error("Failed to create manual mission:", result.error);
        return null;
      }
    } catch (error) {
      console.error("Error creating manual mission:", error);
      return null;
    }
  }

  // Cleanup method
  public destroy(): void {
    this.pendingMissions.clear();
    this.processedDisasters.clear();
    console.log("🧹 Blockchain disaster integration cleaned up");
  }
}

// Singleton instance
export const blockchainDisasterIntegration =
  new BlockchainDisasterIntegration();
export default blockchainDisasterIntegration;

