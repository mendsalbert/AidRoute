"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  realTimeDisasterService,
  RawDisasterEvent,
} from "@/lib/real-time-disasters";
import { blockchainDisasterIntegration } from "@/lib/blockchain-disaster-integration";
import { automatedDisasterService } from "@/lib/automated-disaster-service";
import { aidRouteDataService } from "@/lib/production-data";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Zap,
  Users,
  Map,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface HomeViewProps {
  onNavigate: (view: "operations" | "planning" | "audit") => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const [stats, setStats] = useState<{
    activeMissions: number;
    urgentNeeds: number;
    verifiedDeliveries: number;
    totalFundsDeployed: number;
  }>({
    activeMissions: 0,
    urgentNeeds: 0,
    verifiedDeliveries: 0,
    totalFundsDeployed: 0,
  });
  const [recentEvents, setRecentEvents] = useState<RawDisasterEvent[]>([]);

  useEffect(() => {
    // Function to update all stats from available services
    const updateAllStats = () => {
      try {
        console.log("🔄 Updating stats...");

        // Get disaster events
        const events = realTimeDisasterService.getEvents();
        console.log("📊 Disaster events:", events.length, events);

        // Get blockchain stats
        const blockchainData =
          blockchainDisasterIntegration.getBlockchainStats();
        console.log("⛓️ Blockchain data:", blockchainData);

        // Get system status (not used but kept for potential future use)
        // const systemData = automatedDisasterService.getSystemStatus();

        // Get production data for better metrics
        const productionStats = aidRouteDataService.getSystemStats();
        console.log("📊 Production stats:", productionStats);

        // Calculate critical alerts from disaster events
        const criticalAlerts = events.filter(
          (e: RawDisasterEvent) => e.urgency === "critical"
        ).length;
        console.log("🚨 Critical alerts:", criticalAlerts);

        // Get active missions from blockchain stats
        const activeMissions =
          blockchainData.totalMissionsCreated - blockchainData.pendingMissions;
        console.log("🎯 Active missions:", activeMissions);

        // Get verified deliveries from production data (more accurate than system status)
        const verifiedDeliveries = productionStats.verifiedDeliveries;

        // Get total funds deployed from production data (more accurate than blockchain stats)
        const totalFundsDeployed = productionStats.totalFundsDeployed;

        const newStats = {
          activeMissions: Math.max(0, activeMissions),
          urgentNeeds: criticalAlerts,
          verifiedDeliveries: verifiedDeliveries,
          totalFundsDeployed: totalFundsDeployed,
        };

        console.log("📈 New stats:", newStats);

        // Update stats with real data
        setStats(newStats);

        // Keep the most recent 6 events for the activity view
        setRecentEvents(events.slice(0, 6));
      } catch (error) {
        console.error("Error updating stats:", error);
      }
    };

    // Set up listeners for real-time updates
    const handleDisasterUpdate = () => {
      updateAllStats();
    };

    const handleBlockchainUpdate = () => {
      updateAllStats();
    };

    // Subscribe to events
    realTimeDisasterService.on("events-updated", handleDisasterUpdate);
    realTimeDisasterService.on("disasters-updated", handleDisasterUpdate);
    realTimeDisasterService.on(
      "blockchain-mission-created",
      handleBlockchainUpdate
    );
    realTimeDisasterService.on("mission-completed", handleBlockchainUpdate);

    // Update stats every 10 seconds
    const interval = setInterval(() => updateAllStats(), 10000);

    // Initial populate
    updateAllStats();

    return () => {
      clearInterval(interval);
      realTimeDisasterService.off("events-updated", handleDisasterUpdate);
      realTimeDisasterService.off("disasters-updated", handleDisasterUpdate);
      realTimeDisasterService.off(
        "blockchain-mission-created",
        handleBlockchainUpdate
      );
      realTimeDisasterService.off("mission-completed", handleBlockchainUpdate);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const urgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "text-red-600 bg-red-500/10 border-red-500/20";
      case "high":
        return "text-orange-600 bg-orange-500/10 border-orange-500/20";
      case "medium":
        return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-green-600 bg-green-500/10 border-green-500/20";
    }
  };

  const typeStyles = (type: string) => {
    switch (type) {
      case "EQ":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "FL":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "VO":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "WF":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "TC":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const timeFrom = (pubDate?: string) => {
    if (!pubDate) return "";
    const now = Date.now();
    const then = new Date(pubDate).getTime();
    const diffMin = Math.max(0, Math.round((now - then) / 60000));
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const hrs = Math.round(diffMin / 60);
    return `${hrs}h ago`;
  };

  const sanitizeLink = (url?: string) => {
    if (!url) return "";
    // Decode common HTML entities (minimal)
    const decoded = url.trim().replace(/&amp;/g, "&");
    // Ensure absolute URL stays absolute
    try {
      const u = new URL(decoded, "https://www.gdacs.org");
      return u.href;
    } catch {
      return decoded;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Activity className="w-8 h-8 text-blue-500" />
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-sm text-muted-foreground">Active Missions</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">9</p>
            <p className="text-sm text-muted-foreground">Critical Alerts</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.verifiedDeliveries}</p>
            <p className="text-sm text-muted-foreground">Verified Deliveries</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.totalFundsDeployed)}
            </p>
            <p className="text-sm text-muted-foreground">
              Total Funds Deployed
            </p>
          </div>
        </div>
      </div>

      {/* System Status Feed */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Live System Activity</h3>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time</span>
          </div>
        </div>

        <div className="space-y-3">
          {recentEvents.length > 0 ? (
            recentEvents.map((e, index) => (
              <div
                key={`${e.link}-${index}`}
                className={cn(
                  "p-3 bg-secondary/50 rounded-lg text-sm border border-border",
                  "animate-in slide-in-from-top-1 duration-500",
                  index === 0 && "bg-primary/10 border-primary/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full mt-1.5",
                      e.urgency === "critical" && "bg-red-500",
                      e.urgency === "high" && "bg-orange-500",
                      e.urgency === "medium" && "bg-yellow-500",
                      e.urgency === "low" && "bg-green-500"
                    )}
                  ></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border",
                          typeStyles(e.eventType)
                        )}
                      >
                        {e.typeName}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border",
                          urgencyStyles(e.urgency)
                        )}
                      >
                        {e.urgency}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">
                          {e.location}
                        </span>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                        {timeFrom(e.pubDate)}
                      </span>
                    </div>

                    <div className="mt-1 text-sm line-clamp-2">{e.title}</div>

                    {e.link && (
                      <a
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        href={sanitizeLink(e.link)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on GDACS <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Monitoring system activity...</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate("operations")}
          className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-left hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <Map className="w-10 h-10 text-blue-500" />
            <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Launch Operations Center
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitor live logistics coordination, active missions, and real-time
            aid movements across the network
          </p>
        </button>

        <button
          onClick={() => onNavigate("planning")}
          className="group bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 text-left hover:from-purple-500/20 hover:to-purple-600/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-purple-500" />
            <ArrowRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Collaborate with AI Planner
          </h3>
          <p className="text-sm text-muted-foreground">
            Work with autonomous AI agents to optimize delivery routes, allocate
            resources, and plan missions
          </p>
        </button>

        <button
          onClick={() => onNavigate("audit")}
          className="group bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 text-left hover:from-green-500/20 hover:to-green-600/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <ArrowRight className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Open Audit Portal</h3>
          <p className="text-sm text-muted-foreground">
            Access transparent mission records, verify delivery proofs, and
            track fund deployment with full accountability
          </p>
        </button>
      </div>
    </div>
  );
}
