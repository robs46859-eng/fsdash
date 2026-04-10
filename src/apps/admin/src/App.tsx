import React, { useState } from "react";
import { AdminShell } from "./components/layout/AdminShell";
import { SidebarNav } from "./components/layout/SidebarNav";
import { TopBar } from "./components/layout/TopBar";
import { WorkflowMemoryView } from "./views/WorkflowMemoryView";
import { ExecutionsView } from "./views/ExecutionsView";
import { DeliveriesView } from "./views/DeliveriesView";
import { TenantsView } from "./views/TenantsView";
import { SettingsView } from "./views/SettingsView";
import { Play, Send, Users, Settings, LayoutDashboard } from "lucide-react";

const MockView = ({ title, icon: Icon, desc }: { title: string, icon: any, desc: string }) => (
  <div className="flex-1 overflow-y-auto p-10">
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-2xl font-display font-semibold tracking-tighter mb-3 text-midnight">{title}</h1>
        <p className="text-pastel-purple font-medium">{desc}</p>
      </header>
      <div className="glass-panel p-12 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-pastel-purple/5 flex items-center justify-center text-pastel-purple border border-pastel-purple/10">
            <Icon size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-midnight">{title} Engine Ready</h3>
            <p className="text-pastel-pink text-sm max-w-md mx-auto">Operational boundaries are active. Governance protocol is monitoring all system interactions.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState("review");

  const renderContent = () => {
    switch (activeTab) {
      case "review":
        return <WorkflowMemoryView />;
      case "executions":
        return <ExecutionsView />;
      case "deliveries":
        return <DeliveriesView />;
      case "tenants":
        return <TenantsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <WorkflowMemoryView />;
    }
  };

  return (
    <AdminShell>
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </AdminShell>
  );
}
