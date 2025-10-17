// Automated disaster monitoring and blockchain integration service
// Runs continuously to fetch GDACS data and create blockchain missions

import { realTimeDisasterService } from "./real-time-disasters";
import { blockchainDisasterIntegration } from "./blockchain-disaster-integration";

interface ServiceConfig {
  fetchInterval: number; // minutes
  enableBlockchainIntegration: boolean;
  logLevel: "verbose" | "normal" | "minimal";
}

interface ServiceStats {
  uptime: number;
  lastFetch: Date | null;
  totalDisastersFetched: number;
  totalMissionsCreated: number;
  errors: number;
  status: "running" | "stopped" | "error";
}

class AutomatedDisasterService {
  private config: ServiceConfig;
  private stats: ServiceStats;
  private fetchInterval?: NodeJS.Timeout;
  private startTime: Date;
  private recentActivity: string[] = [];

  constructor(config?: Partial<ServiceConfig>) {
    this.config = {
      fetchInterval: 3, // Fetch every 3 minutes
      enableBlockchainIntegration: true,
      logLevel: "normal",
      ...config,
    };

    this.stats = {
      uptime: 0,
      lastFetch: null,
      totalDisastersFetched: 0,
      totalMissionsCreated: 0,
      errors: 0,
      status: "stopped",
    };

    this.startTime = new Date();
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    // Listen for disaster updates
    realTimeDisasterService.on("disasters-updated", (events: any[]) => {
      this.stats.totalDisastersFetched += events.length;
      this.stats.lastFetch = new Date();

      if (events.length > 0) {
        this.addActivity(
          `🌍 Fetched ${events.length} disaster events from GDACS`
        );

        const criticalEvents = events.filter(
          (e) => e.data.urgency === "critical"
        );
        if (criticalEvents.length > 0) {
          this.addActivity(
            `🚨 ${criticalEvents.length} critical disasters detected`
          );
        }
      }
    });

    // Listen for blockchain mission creation
    if (this.config.enableBlockchainIntegration) {
      realTimeDisasterService.on("blockchain-mission-created", (event: any) => {
        this.stats.totalMissionsCreated++;
        this.addActivity(
          `🔗 Mission #${event.missionId} created on blockchain: ${event.data.location}`
        );
      });
    }

    // Listen for mission updates
    realTimeDisasterService.on("mission-completed", ({ mission }: any) => {
      this.addActivity(`✅ Mission completed: ${mission.destination}`);
    });

    // Listen for new needs
    realTimeDisasterService.on("need-added", (need: any) => {
      const urgencyEmoji = {
        critical: "🔴",
        high: "🟠",
        medium: "🟡",
        low: "🟢",
      };
      this.addActivity(
        `${urgencyEmoji[need.urgency as keyof typeof urgencyEmoji]} New need: ${
          need.item
        } in ${need.location}`
      );
    });
  }

  private addActivity(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;

    this.recentActivity.unshift(logMessage);

    // Keep only last 50 activities
    if (this.recentActivity.length > 50) {
      this.recentActivity = this.recentActivity.slice(0, 50);
    }

    // Log based on level
    if (
      this.config.logLevel === "verbose" ||
      (this.config.logLevel === "normal" &&
        (message.includes("🚨") ||
          message.includes("🔗") ||
          message.includes("✅")))
    ) {
      console.log(logMessage);
    }
  }

  public start(): void {
    if (this.stats.status === "running") {
      console.log("⚠️  Service is already running");
      return;
    }

    console.log("🚀 Starting Automated Disaster Service");
    console.log(`📊 Configuration:`);
    console.log(`   - Fetch Interval: ${this.config.fetchInterval} minutes`);
    console.log(
      `   - Blockchain Integration: ${
        this.config.enableBlockchainIntegration ? "Enabled" : "Disabled"
      }`
    );
    console.log(`   - Log Level: ${this.config.logLevel}`);

    this.stats.status = "running";
    this.startTime = new Date();

    // Start the periodic fetching
    this.scheduleNextFetch();

    // Update uptime counter every minute
    const uptimeInterval = setInterval(() => {
      if (this.stats.status === "running") {
        this.stats.uptime = Math.floor(
          (Date.now() - this.startTime.getTime()) / 1000
        );
      } else {
        clearInterval(uptimeInterval);
      }
    }, 1000);

    this.addActivity("🚀 Automated disaster service started");
  }

  public stop(): void {
    if (this.stats.status === "stopped") {
      console.log("⚠️  Service is already stopped");
      return;
    }

    console.log("🛑 Stopping Automated Disaster Service");

    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = undefined;
    }

    this.stats.status = "stopped";
    this.addActivity("🛑 Automated disaster service stopped");
  }

  public restart(): void {
    console.log("🔄 Restarting Automated Disaster Service");
    this.stop();
    setTimeout(() => this.start(), 1000);
  }

  private scheduleNextFetch(): void {
    if (this.stats.status !== "running") return;

    // Clear existing interval
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }

    // Schedule next fetch
    this.fetchInterval = setInterval(async () => {
      try {
        await this.performFetch();
      } catch (error) {
        this.handleError(error);
      }
    }, this.config.fetchInterval * 60 * 1000); // Convert minutes to milliseconds

    // Perform initial fetch immediately
    this.performFetch().catch(this.handleError.bind(this));
  }

  private async performFetch(): Promise<void> {
    if (this.config.logLevel === "verbose") {
      console.log("🔄 Performing scheduled disaster data fetch...");
    }

    try {
      // The real-time service handles the actual fetching
      // We just need to trigger it via its internal update mechanism
      // This is already handled by the real-time service's own intervals

      // Update our stats
      this.stats.lastFetch = new Date();
    } catch (error) {
      throw error;
    }
  }

  private handleError(error: any): void {
    this.stats.errors++;
    this.stats.status = "error";

    const errorMessage = `❌ Error in disaster service: ${
      error.message || error
    }`;
    this.addActivity(errorMessage);
    console.error(errorMessage, error);

    // Auto-restart after error (with backoff)
    setTimeout(() => {
      if (this.stats.status === "error") {
        console.log("🔄 Attempting to recover from error...");
        this.stats.status = "running";
        this.scheduleNextFetch();
      }
    }, 30000); // Wait 30 seconds before retry
  }

  // Public getters
  public getStats(): ServiceStats {
    return { ...this.stats };
  }

  public getRecentActivity(): string[] {
    return [...this.recentActivity];
  }

  public getConfig(): ServiceConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ServiceConfig>): void {
    const wasRunning = this.stats.status === "running";

    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...newConfig };

    console.log("⚙️  Configuration updated:", newConfig);

    if (wasRunning) {
      this.start();
    }
  }

  // Status and monitoring methods
  public getSystemStatus() {
    const disasterServiceStats = realTimeDisasterService.getSystemStats();
    const blockchainStats = blockchainDisasterIntegration.getBlockchainStats();

    return {
      service: this.getStats(),
      disasters: disasterServiceStats,
      blockchain: blockchainStats,
      uptime: this.formatUptime(this.stats.uptime),
      lastActivity: this.recentActivity[0] || "No activity yet",
    };
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Force manual operations
  public async forceDisasterFetch(): Promise<void> {
    this.addActivity("🔄 Manual disaster fetch triggered");
    await this.performFetch();
  }

  public async createTestMission(): Promise<number | null> {
    const missionId = await blockchainDisasterIntegration.createManualMission(
      "Test Location",
      "Test mission created manually for system verification",
      ["Test Supplies", "Emergency Kit"],
      5000 // $5,000 PYUSD
    );

    if (missionId) {
      this.addActivity(`🧪 Test mission #${missionId} created manually`);
    }

    return missionId;
  }

  // Cleanup
  public destroy(): void {
    this.stop();
    realTimeDisasterService.destroy();
    blockchainDisasterIntegration.destroy();
    console.log("🧹 Automated disaster service destroyed");
  }
}

// Create and export singleton instance
export const automatedDisasterService = new AutomatedDisasterService();

// Auto-start the service
console.log("🌍 AidRoute Automated Disaster Service initializing...");
automatedDisasterService.start();

export default automatedDisasterService;
