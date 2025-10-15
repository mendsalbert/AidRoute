"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Home, Activity, Brain, Shield, User, Zap } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: "home" | "operations" | "planning" | "audit";
  onViewChange: (view: "home" | "operations" | "planning" | "audit") => void;
}

export function DashboardLayout({
  children,
  activeView,
  onViewChange,
}: DashboardLayoutProps) {
  const [userIdentity] = useState("omar-coordinator-4A");

  const navigationItems = [
    {
      id: "home" as const,
      label: "Overview",
      icon: Home,
      description: "System Status",
    },
    {
      id: "operations" as const,
      label: "Operations",
      icon: Activity,
      description: "Live Logistics",
    },
    {
      id: "planning" as const,
      label: "Planning",
      icon: Brain,
      description: "AI Collaboration",
    },
    {
      id: "audit" as const,
      label: "Audit",
      icon: Shield,
      description: "Transparency",
    },
  ];

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            {/* <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm"> */}
            <Image
              src="/logo.png"
              alt="AidRoute Logo"
              width={24}
              height={24}
              className="w-10 h-10 object-contain"
            />
            {/* </div> */}
            <div>
              <h1 className="text-xl font-bold">AidRoute</h1>
              <p className="text-sm text-muted-foreground">
                Autonomous Command
              </p>
            </div>
          </div>

          {/* User Identity */}
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
            <User className="w-4 h-4 text-secondary-foreground" />
            <div>
              <p className="text-sm font-medium text-secondary-foreground">
                {userIdentity}
              </p>
              <p className="text-xs text-muted-foreground">Field Coordinator</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-secondary hover:text-secondary-foreground",
                    isActive && "bg-primary text-primary-foreground shadow-md"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs opacity-70">{item.description}</p>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-green-500" />
            <span>All Systems Operational</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Network: Connected</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold capitalize">{activeView}</h2>
            <div className="h-4 w-px bg-border"></div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              UTC
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
