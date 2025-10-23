"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { realTimeDisasterService } from "@/lib/real-time-disasters";
import { blockchainDisasterIntegration } from "@/lib/blockchain-disaster-integration";
import { automatedDisasterService } from "@/lib/automated-disaster-service";
import {
  Activity,
  Zap,
  Globe,
  Link,
  TrendingUp,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Hash,
  Play,
  Pause,
  RotateCcw,
  Settings,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Rocket,
  Square,
} from "lucide-react";

interface SystemActivity {
  id: string;
  timestamp: string;
  type: "disaster" | "blockchain" | "mission" | "system";
  message: string;
  severity: "info" | "warning" | "success" | "error";
}

export function LiveSystemMonitor() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<SystemActivity[]>([]);
  const [isServiceRunning, setIsServiceRunning] = useState(true);
  const [blockchainStats, setBlockchainStats] = useState<any>(null);

  useEffect(() => {
    // Initialize status
    updateSystemStatus();
    updateBlockchainStats();

    // Set up real-time listeners
    const handleDisasterUpdate = (events: any[]) => {
      events.forEach((event) => {
        if (event.data.severity_score >= 3) {
          addActivity({
            type: "disaster",
            message: `${event.data.type_name} detected in ${event.data.location}`,
            severity: event.data.urgency === "critical" ? "error" : "warning",
          });
        }
      });
    };

    const handleBlockchainMission = (event: any) => {
      addActivity({
        type: "blockchain",
        message: `Mission #${event.missionId} created: ${event.data.location}`,
        severity: "success",
      });
      updateBlockchainStats();
    };

    const handleMissionCompleted = ({ mission }: any) => {
      addActivity({
        type: "mission",
        message: `Mission completed in ${mission.destination}`,
        severity: "success",
      });
    };

    const handleNeedAdded = (need: any) => {
      if (need.urgency === "critical") {
        addActivity({
          type: "system",
          message: `Critical need registered: ${need.item} in ${need.location}`,
          severity: "error",
        });
      }
    };

    // Subscribe to events
    realTimeDisasterService.on("disasters-updated", handleDisasterUpdate);
    realTimeDisasterService.on(
      "blockchain-mission-created",
      handleBlockchainMission
    );
    realTimeDisasterService.on("mission-completed", handleMissionCompleted);
    realTimeDisasterService.on("need-added", handleNeedAdded);

    // Update status every 10 seconds
    const statusInterval = setInterval(() => {
      updateSystemStatus();
      updateServiceStatus();
    }, 10000);

    return () => {
      clearInterval(statusInterval);
      realTimeDisasterService.off("disasters-updated", handleDisasterUpdate);
      realTimeDisasterService.off(
        "blockchain-mission-created",
        handleBlockchainMission
      );
      realTimeDisasterService.off("mission-completed", handleMissionCompleted);
      realTimeDisasterService.off("need-added", handleNeedAdded);
    };
  }, []);

  const addActivity = (activity: Omit<SystemActivity, "id" | "timestamp">) => {
    const newActivity: SystemActivity = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...activity,
    };

    setRecentActivity((prev) => [newActivity, ...prev.slice(0, 19)]); // Keep last 20
  };

  const updateSystemStatus = () => {
    try {
      const status = automatedDisasterService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error("Error updating system status:", error);
    }
  };

  const updateBlockchainStats = () => {
    try {
      const stats = blockchainDisasterIntegration.getBlockchainStats();
      setBlockchainStats(stats);
    } catch (error) {
      console.error("Error updating blockchain stats:", error);
    }
  };

  const updateServiceStatus = () => {
    try {
      const stats = automatedDisasterService.getStats();
      setIsServiceRunning(stats.status === "running");
    } catch (error) {
      setIsServiceRunning(false);
    }
  };

  const handleServiceToggle = () => {
    try {
      if (isServiceRunning) {
        automatedDisasterService.stop();
        addActivity({
          type: "system",
          message: "Automated service stopped",
          severity: "warning",
        });
      } else {
        automatedDisasterService.start();
        addActivity({
          type: "system",
          message: "Automated service started",
          severity: "success",
        });
      }
      setIsServiceRunning(!isServiceRunning);
    } catch (error) {
      console.error("Error toggling service:", error);
    }
  };

  const handleForceUpdate = async () => {
    try {
      addActivity({
        type: "system",
        message: "Manual disaster data fetch triggered",
        severity: "info",
      });
      await automatedDisasterService.forceDisasterFetch();
    } catch (error) {
      console.error("Error forcing update:", error);
    }
  };

  const handleTestMission = async () => {
    try {
      const missionId = await automatedDisasterService.createTestMission();
      if (missionId) {
        addActivity({
          type: "blockchain",
          message: `Test mission #${missionId} created successfully`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error creating test mission:", error);
    }
  };

  const getSeverityColor = (severity: SystemActivity["severity"]) => {
    switch (severity) {
      case "error":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "warning":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "success":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getTypeIcon = (type: SystemActivity["type"]) => {
    switch (type) {
      case "disaster":
        return <Globe className="w-4 h-4" />;
      case "blockchain":
        return <Link className="w-4 h-4" />;
      case "mission":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Live System Monitor</h2>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  isServiceRunning ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}
              ></div>
              <span className="text-sm text-muted-foreground">
                Real-time GDACS disaster data with blockchain integration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleForceUpdate}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Force Update</span>
            </button>
            <button
              onClick={handleTestMission}
              className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Test Mission</span>
            </button>
            <button
              onClick={handleServiceToggle}
              className={cn(
                "px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                isServiceRunning
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              )}
            >
              {isServiceRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isServiceRunning ? "Stop" : "Start"}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Service Status</span>
            </div>
            <p className="text-xl font-bold">
              {isServiceRunning ? "Running" : "Stopped"}
            </p>
            {systemStatus && (
              <p className="text-xs text-muted-foreground">
                Uptime: {systemStatus.uptime}
              </p>
            )}
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Disasters Tracked</span>
            </div>
            <p className="text-xl font-bold">
              {systemStatus?.disasters.urgentNeeds || 0}
            </p>
            <p className="text-xs text-muted-foreground">Critical/Active</p>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Blockchain Missions</span>
            </div>
            <p className="text-xl font-bold">
              {blockchainStats?.totalMissionsCreated || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Success:{" "}
              {blockchainStats
                ? (blockchainStats.successRate * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Total Funding</span>
            </div>
            <p className="text-xl font-bold">
              {blockchainStats
                ? `$${Math.floor(
                    blockchainStats.totalFundingRequested
                  ).toLocaleString()}`
                : "$0"}
            </p>
            <p className="text-xs text-muted-foreground">PYUSD Requested</p>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Live System Activity
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time</span>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-300",
                  getSeverityColor(activity.severity),
                  index === 0 && "animate-in slide-in-from-top-1 duration-500"
                )}
              >
                <div className="flex items-center gap-2">
                  {getTypeIcon(activity.type)}
                  <span className="flex-1 text-sm">{activity.message}</span>
                  <span className="text-xs opacity-70">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Monitoring system activity...</p>
              <p className="text-xs mt-1">
                Real disaster events will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Details */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GDACS Integration Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              GDACS Integration
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Fetch:</span>
                <span>
                  {systemStatus.service.lastFetch
                    ? new Date(systemStatus.service.lastFetch).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Fetched:</span>
                <span>{systemStatus.service.totalDisastersFetched}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Missions:</span>
                <span>{systemStatus.disasters.activeMissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Errors:</span>
                <span
                  className={
                    systemStatus.service.errors > 0 ? "text-red-500" : ""
                  }
                >
                  {systemStatus.service.errors}
                </span>
              </div>
            </div>
          </div>

          {/* Blockchain Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Link className="w-5 h-5 text-purple-500" />
              Blockchain Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Missions Created:</span>
                <span>{systemStatus.blockchain.totalMissionsCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span>{systemStatus.blockchain.pendingMissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="text-green-500">
                  {(systemStatus.blockchain.successRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Funding:</span>
                <span className="font-medium">
                  $
                  {Math.floor(
                    systemStatus.blockchain.totalFundingRequested
                  ).toLocaleString()}{" "}
                  PYUSD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
