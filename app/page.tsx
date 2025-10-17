"use client";

import { useState, useEffect } from "react";
import { LandingPage } from "@/components/landing-page";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HomeView } from "@/components/home-view";
import { OperationsView } from "@/components/operations-view";
import { PlanningView } from "@/components/planning-view";
import { AuditView } from "@/components/audit-view";

type ViewType = "home" | "operations" | "planning" | "audit";

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("home");

  const renderActiveView = () => {
    switch (activeView) {
      case "home":
        return <HomeView onNavigate={setActiveView} />;
      case "operations":
        return <OperationsView />;
      case "planning":
        return <PlanningView />;
      case "audit":
        return <AuditView />;
      default:
        return <HomeView onNavigate={setActiveView} />;
    }
  };

  if (!showDashboard) {
    return <LandingPage onEnterDashboard={() => setShowDashboard(true)} />;
  }

  return (
    <DashboardLayout activeView={activeView} onViewChange={setActiveView}>
      {renderActiveView()}
    </DashboardLayout>
  );
}
