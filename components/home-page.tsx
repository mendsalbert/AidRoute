"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Globe,
  Zap,
  Brain,
  Shield,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { SystemStats, ActivityFeedItem } from "@/lib/types";
import {
  generateSystemStats,
  generateActivityFeed,
} from "@/lib/data-simulation";

interface HomePageProps {
  onNavigate: (view: "operations" | "planning" | "audit") => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [stats, setStats] = useState<SystemStats>(generateSystemStats());
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(
    generateActivityFeed()
  );

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats((prevStats) => ({
        ...prevStats,
        activeMissions:
          prevStats.activeMissions + (Math.random() > 0.7 ? 1 : 0),
        urgentNeeds: prevStats.urgentNeeds + (Math.random() > 0.8 ? 1 : 0),
        totalFundsDeployed:
          prevStats.totalFundsDeployed +
          (Math.random() > 0.9 ? Math.floor(Math.random() * 5000) : 0),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      icon: Globe,
      label: "Active Missions",
      value: stats.activeMissions,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      icon: Zap,
      label: "Urgent Needs",
      value: stats.urgentNeeds,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      icon: Users,
      label: "Verified Deliveries",
      value: stats.verifiedDeliveries,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      icon: TrendingUp,
      label: "Funds Deployed",
      value: `$${stats.totalFundsDeployed.toLocaleString()}`,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
  ];

  const navigationCards = [
    {
      title: "Launch Operations Center",
      description:
        "Monitor real-time logistics coordination and field operations",
      icon: Zap,
      action: () => onNavigate("operations"),
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      title: "Collaborate with AI Planner",
      description:
        "Work with autonomous AI agents to optimize humanitarian logistics",
      icon: Brain,
      action: () => onNavigate("planning"),
      gradient: "from-purple-600 to-pink-600",
    },
    {
      title: "Open Audit Portal",
      description:
        "Access transparency tools and verify all humanitarian transactions",
      icon: Shield,
      action: () => onNavigate("audit"),
      gradient: "from-green-600 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Coordinating Aid.
          </h1>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Autonomously.
          </h1>
        </div>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          AidRoute is the next-generation autonomous humanitarian coordination
          system. Our AI agents optimize logistics, ensure transparency, and
          coordinate aid delivery across global networks with unprecedented
          efficiency and accountability.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>
            System Status:{" "}
            <span className="text-green-400 font-mono">ONLINE</span>
          </span>
        </div>
      </div>

      {/* Live Summary Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 backdrop-blur-sm`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className={`${stat.color} text-2xl font-bold mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status Feed */}
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live System Activity</span>
        </h3>
        <div className="space-y-3">
          {activityFeed.slice(0, 4).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-slate-300 text-sm">{activity.message}</span>
              <span className="text-slate-500 text-xs ml-auto">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navigationCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={card.action}
              className={`group relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative z-10">
                <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {card.description}
                </p>
                <div className="flex items-center mt-4 text-white">
                  <span className="text-sm font-medium">Access Module</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* Mission Statement */}
      <div className="text-center space-y-4 pt-8">
        <p className="text-slate-400 italic max-w-2xl mx-auto">
          "Standing inside the command room of a planetary humanitarian AI —
          data flowing like neural signals, missions self-coordinating, and
          every decision transparently verifiable."
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
          <div className="w-1 h-1 bg-slate-500 rounded-full" />
          <span>AidRoute Dashboard</span>
          <div className="w-1 h-1 bg-slate-500 rounded-full" />
          <span>
            Living Interface Between Human Compassion & Autonomous Intelligence
          </span>
        </div>
      </div>
    </div>
  );
}
