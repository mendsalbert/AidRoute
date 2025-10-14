"use client";

import { useState } from "react";
import { LayoutDashboard, Home, Zap, Brain, Shield } from "lucide-react";
import { DashboardView } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

export default function DashboardLayout({
  children,
  currentView,
  onViewChange,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    { id: "home" as DashboardView, label: "Home", icon: Home },
    { id: "operations" as DashboardView, label: "Operations", icon: Zap },
    { id: "planning" as DashboardView, label: "Planning", icon: Brain },
    { id: "audit" as DashboardView, label: "Audit", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-300" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AidRoute</h1>
                <p className="text-xs text-slate-400">
                  Autonomous Humanitarian Network
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-slate-300">Active Coordinator</p>
              <p className="text-xs text-slate-400 font-mono">
                omar-coordinator-4A
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-slate-800/30 backdrop-blur-sm border-r border-slate-700/50 min-h-screen">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
