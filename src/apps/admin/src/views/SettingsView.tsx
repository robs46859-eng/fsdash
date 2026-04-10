import React from "react";
import { 
  Shield, 
  Lock, 
  Bell, 
  Cpu, 
  Database, 
  Globe,
  ChevronRight,
  Key
} from "lucide-react";

export const SettingsView = () => {
  const sections = [
    {
      title: "Governance Protocols",
      desc: "Configure system-wide execution boundaries and approval workflows.",
      items: [
        { icon: Shield, label: "Execution Guardrails", desc: "Define mandatory review scores and auto-rejection thresholds.", path: "/settings/guardrails" },
        { icon: Lock, label: "Access Control", desc: "Manage RBAC roles and administrative permissions.", path: "/settings/access" },
        { icon: Key, label: "API Governance", desc: "Rotate system keys and manage outbound service credentials.", path: "/settings/api" },
      ]
    },
    {
      title: "System Infrastructure",
      desc: "Monitor and configure the underlying execution engine.",
      items: [
        { icon: Cpu, label: "Compute Resources", desc: "Allocate execution priority and concurrent workflow limits.", path: "/settings/compute" },
        { icon: Database, label: "Data Persistence", desc: "Configure retention policies for decision traces and history.", path: "/settings/data" },
        { icon: Globe, label: "Regional Routing", desc: "Manage data residency and execution node locations.", path: "/settings/regions" },
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl font-display font-semibold tracking-tighter mb-3 text-midnight">Settings</h1>
          <p className="text-pastel-purple font-medium">Configure system governance and security protocols.</p>
        </header>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <div key={idx}>
              <div className="mb-6">
                <h2 className="text-base font-semibold text-midnight">{section.title}</h2>
                <p className="text-sm text-pastel-purple">{section.desc}</p>
              </div>
              
              <div className="grid gap-4">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    className="glass-panel p-6 flex items-center justify-between hover:border-pastel-purple transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 group-hover:text-pastel-purple group-hover:bg-pastel-purple/5 transition-all">
                        <item.icon size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-midnight">{item.label}</p>
                        <p className="text-xs text-pastel-pink mt-0.5">{item.desc}</p>
                        <p className="text-[9px] text-slate-200 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{item.path}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 glass-panel bg-rose-500/5 border-rose-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-rose-900">Danger Zone</p>
              <p className="text-xs text-rose-600 mt-1">Irreversible system-wide actions.</p>
            </div>
            <button className="px-4 py-2 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all">
              Reset Governance Engine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
