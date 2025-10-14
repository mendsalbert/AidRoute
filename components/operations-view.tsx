"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Mission, Need, ActivityFeedItem } from "@/lib/types";
import {
  generateMockMissions,
  generateMockNeeds,
  generateActivityFeed,
} from "@/lib/data-simulation";

export default function OperationsView() {
  const [missions, setMissions] = useState<Mission[]>(generateMockMissions());
  const [needs, setNeeds] = useState<Need[]>(generateMockNeeds());
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(
    generateActivityFeed()
  );

  useEffect(() => {
    // Simulate mission movement and status updates
    const interval = setInterval(() => {
      setMissions((prevMissions) =>
        prevMissions.map((mission) => {
          if (mission.status === "en_route") {
            // Simulate coordinate movement
            const newX = Math.max(
              50,
              Math.min(400, mission.coordinates.x + (Math.random() - 0.5) * 20)
            );
            const newY = Math.max(
              50,
              Math.min(300, mission.coordinates.y + (Math.random() - 0.5) * 20)
            );

            return {
              ...mission,
              coordinates: { x: newX, y: newY },
            };
          }
          return mission;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const kpiData = [
    {
      label: "Active Missions",
      value: missions.filter((m) => m.status !== "completed").length,
      color: "text-blue-400",
    },
    {
      label: "Critical Needs",
      value: needs.filter((n) => n.urgency === "critical").length,
      color: "text-red-400",
    },
    {
      label: "Fulfilled Deliveries",
      value: missions.filter((m) => m.status === "completed").length,
      color: "text-green-400",
    },
    { label: "Avg Response Time", value: "2.3h", color: "text-purple-400" },
  ];

  const getStatusColor = (status: Mission["status"]) => {
    switch (status) {
      case "planning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "en_route":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "delivered":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "completed":
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getUrgencyColor = (urgency: Need["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Operations Center</h1>
          <p className="text-slate-400 mt-1">
            Real-time logistics coordination and field operations
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live Operations Active</span>
        </div>
      </div>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <div
            key={kpi.label}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p className="text-slate-400 text-sm font-medium">{kpi.label}</p>
            <p className={`${kpi.color} text-2xl font-bold mt-1`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulated Map Interface */}
        <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Mission Tracking</span>
          </h3>

          <div className="relative bg-slate-900/50 rounded-lg border border-slate-700/50 h-96 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute border-l border-slate-600"
                  style={{ left: `${i * 5}%` }}
                />
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute border-t border-slate-600"
                  style={{ top: `${i * 6.67}%` }}
                />
              ))}
            </div>

            {/* Mission markers */}
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={`absolute w-4 h-4 rounded-full border-2 transition-all duration-1000 ${
                  mission.status === "en_route"
                    ? "bg-blue-400 border-blue-300 animate-pulse"
                    : mission.status === "planning"
                    ? "bg-yellow-400 border-yellow-300"
                    : "bg-green-400 border-green-300"
                }`}
                style={{
                  left: `${mission.coordinates.x}px`,
                  top: `${mission.coordinates.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
                title={`${mission.id} - ${mission.destination}`}
              >
                {mission.status === "en_route" && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                )}
              </div>
            ))}

            {/* Zone labels */}
            <div className="absolute top-4 left-4 text-xs text-slate-400 font-mono">
              Zone Alpha
            </div>
            <div className="absolute top-4 right-4 text-xs text-slate-400 font-mono">
              Zone Beta
            </div>
            <div className="absolute bottom-4 left-4 text-xs text-slate-400 font-mono">
              Sector Gamma
            </div>
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-mono">
              Camp Delta
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Live Activity</span>
            </h3>
            <div className="space-y-3">
              {activityFeed.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm">{activity.message}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Missions */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Active Missions</span>
          </h3>
          <div className="space-y-4">
            {missions
              .filter((m) => m.status !== "completed")
              .map((mission) => (
                <div
                  key={mission.id}
                  className={`p-4 rounded-lg border ${getStatusColor(
                    mission.status
                  )}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">
                      {mission.id}
                    </span>
                    <span className="text-xs capitalize">
                      {mission.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">
                    Destination: {mission.destination}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Funds: ${mission.fundsRequired.toLocaleString()}
                    </span>
                    <span>Resources: {mission.assignedResources.length}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Urgent Needs */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Urgent Needs</span>
          </h3>
          <div className="space-y-4">
            {needs
              .filter((n) => n.urgency === "critical" || n.urgency === "high")
              .map((need) => (
                <div
                  key={need.id}
                  className={`p-4 rounded-lg border ${getUrgencyColor(
                    need.urgency
                  )}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">
                      {need.id}
                    </span>
                    <span className="text-xs capitalize">{need.urgency}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">
                    {need.item} - {need.quantity} units
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Location: {need.location}</span>
                    <span className="capitalize">{need.status}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
