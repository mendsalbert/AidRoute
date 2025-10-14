"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { aidRouteSimulation, type Mission, type Need } from "@/lib/simulation";
import {
  Activity,
  Map,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  Truck,
  MapPin,
  TrendingUp,
  Zap,
} from "lucide-react";

export function OperationsView() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<string[]>([]);

  useEffect(() => {
    // Initial load
    setMissions(aidRouteSimulation.getMissions());
    setNeeds(aidRouteSimulation.getNeeds());

    // Set up listeners
    const handleMissionsUpdated = (updatedMissions: Mission[]) => {
      setMissions(updatedMissions);
    };

    const handleNeedsUpdated = (updatedNeeds: Need[]) => {
      setNeeds(updatedNeeds);
    };

    const handleMissionCompleted = ({ mission }: any) => {
      setRecentDeliveries((prev) => [
        `${mission.destination} - ${mission.assignedResources[0]} delivered successfully`,
        ...prev.slice(0, 4),
      ]);
    };

    aidRouteSimulation.on("missions-updated", handleMissionsUpdated);
    aidRouteSimulation.on("needs-updated", handleNeedsUpdated);
    aidRouteSimulation.on("mission-completed", handleMissionCompleted);

    return () => {
      aidRouteSimulation.off("missions-updated", handleMissionsUpdated);
      aidRouteSimulation.off("needs-updated", handleNeedsUpdated);
      aidRouteSimulation.off("mission-completed", handleMissionCompleted);
    };
  }, []);

  const activeMissions = missions.filter((m) =>
    ["planning", "en-route", "delivering"].includes(m.status)
  );
  const criticalNeeds = needs.filter(
    (n) => n.urgency === "critical" && n.status === "open"
  );
  const averageResponseTime = Math.floor(Math.random() * 180) + 120; // Simulated

  const getStatusColor = (status: Mission["status"]) => {
    switch (status) {
      case "planning":
        return "text-yellow-500";
      case "en-route":
        return "text-blue-500";
      case "delivering":
        return "text-purple-500";
      case "completed":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getUrgencyColor = (urgency: Need["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{activeMissions.length}</p>
              <p className="text-sm text-muted-foreground">Active Missions</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{criticalNeeds.length}</p>
              <p className="text-sm text-muted-foreground">Critical Needs</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {missions.filter((m) => m.status === "completed").length}
              </p>
              <p className="text-sm text-muted-foreground">Fulfilled Today</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{averageResponseTime}m</p>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulated Map Interface */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Map className="w-5 h-5" />
              Live Mission Tracking
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
          </div>

          {/* Simulated Map Grid */}
          <div className="bg-secondary/20 rounded-lg p-4 h-80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5"></div>

            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute border-l border-muted"
                  style={{ left: `${i * 12.5}%`, height: "100%" }}
                />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute border-t border-muted"
                  style={{ top: `${i * 16.67}%`, width: "100%" }}
                />
              ))}
            </div>

            {/* Mission markers */}
            {activeMissions.slice(0, 6).map((mission, index) => (
              <div
                key={mission.id}
                className="absolute transition-all duration-1000 ease-in-out"
                style={{
                  left: `${20 + index * 12 + mission.progress * 0.3}%`,
                  top: `${
                    15 + index * 10 + Math.sin(Date.now() / 2000 + index) * 5
                  }%`,
                }}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-white shadow-lg animate-pulse",
                    mission.status === "planning" && "bg-yellow-500",
                    mission.status === "en-route" && "bg-blue-500",
                    mission.status === "delivering" && "bg-purple-500"
                  )}
                ></div>
                <div className="absolute -top-8 -left-12 bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                  Mission {mission.id.slice(-3)}
                </div>
              </div>
            ))}

            {/* Route lines */}
            {activeMissions.slice(0, 3).map((mission, index) => (
              <svg
                key={`route-${mission.id}`}
                className="absolute inset-0 w-full h-full"
              >
                <path
                  d={`M ${20 + index * 12}% ${20 + index * 10}% Q ${
                    50 + index * 5
                  }% ${30 + index * 8}% ${75 + index * 3}% ${25 + index * 12}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  className="text-primary/30 animate-pulse"
                  strokeDasharray="4,4"
                />
              </svg>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>En Route</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Delivering</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Missions List */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Active Missions
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activeMissions.slice(0, 8).map((mission) => (
              <div key={mission.id} className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      #{mission.id.slice(-6)}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        getStatusColor(mission.status)
                      )}
                    >
                      {mission.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {mission.progress}% complete
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {mission.location} → {mission.destination}
                  </span>
                </div>

                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${mission.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Needs Feed */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Incoming Needs
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-green-500" />
              <span>Live Feed</span>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {needs.slice(0, 6).map((need) => (
              <div key={need.id} className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      getUrgencyColor(need.urgency)
                    )}
                  >
                    {need.urgency}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(need.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-sm">
                  <p className="font-medium">{need.item}</p>
                  <p className="text-muted-foreground">
                    {need.location} • Qty: {need.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deliveries Feed */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Deliveries
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentDeliveries.length > 0 ? (
              recentDeliveries.map((delivery, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm",
                    "animate-in slide-in-from-top-1 duration-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{delivery}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {index === 0 ? "Just now" : `${(index + 1) * 3}m ago`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Monitoring deliveries...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
