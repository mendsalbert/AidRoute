"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import HomePage from "@/components/home-page";
import OperationsView from "@/components/operations-view";
import PlanningView from "@/components/planning-view";
import AuditView from "@/components/audit-view";
import { DashboardView } from "@/lib/types";

export default function AidRouteDashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>("home");

  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return <HomePage onNavigate={(view) => setCurrentView(view)} />;
      case "operations":
        return <OperationsView />;
      case "planning":
        return <PlanningView />;
      case "audit":
        return <AuditView />;
      default:
        return <HomePage onNavigate={(view) => setCurrentView(view)} />;
    }
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={handleViewChange}>
      {renderCurrentView()}
    </DashboardLayout>
  );
}
