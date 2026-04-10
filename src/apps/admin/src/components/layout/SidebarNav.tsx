import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Play, 
  Send, 
  Users, 
  Settings, 
  ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../common/StatusBadge";

export const SidebarNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navItems = [
    { id: "review", label: "Review Queue", icon: LayoutDashboard, path: "/review-queue" },
    { id: "executions", label: "Executions", icon: Play, path: "/executions" },
    { id: "deliveries", label: "Deliveries", icon: Send, path: "/deliveries" },
    { id: "tenants", label: "Tenants", icon: Users, path: "/tenants" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="w-64 h-screen border-r border-slate-200/50 flex flex-col bg-pastel-yellow z-20">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-primary-accent rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-accent/20">F</div>
          <span className="text-xl font-display font-semibold tracking-tighter text-midnight">FullStack</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                activeTab === item.id 
                  ? "bg-white text-pastel-purple shadow-md border border-purple-100 font-bold" 
                  : "text-slate-500 hover:bg-white/60 hover:font-bold"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-pastel-purple" : "text-slate-400")} />
              <div className="flex flex-col items-start">
                <span>{item.label}</span>
                <span className="text-[9px] hidden group-hover:opacity-100 transition-opacity text-slate-400 font-mono">{item.path}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-8 relative">
        <div 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="p-4 rounded-2xl bg-white/80 border border-slate-200 flex items-center gap-3 group cursor-pointer hover:bg-white transition-all shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-accent/10 flex items-center justify-center text-secondary-accent text-xs font-bold ring-1 ring-secondary-accent/20">RS</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-midnight">Rob S.</p>
            <p className="text-[10px] text-pastel-pink uppercase tracking-widest">Admin • /profile</p>
          </div>
          <ChevronRight size={14} className={`text-slate-300 transition-transform ${isProfileMenuOpen ? "rotate-90" : ""}`} />
        </div>

        <AnimatePresence>
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute bottom-full left-8 mb-2 w-48 bg-white border border-slate-200 rounded-2xl p-2 z-50 shadow-2xl"
              >
                {[
                  { label: "View Profile", path: "/profile" },
                  { label: "Account Security", path: "/security" },
                  { label: "Sign Out", path: "/logout", color: "text-rose-500" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all",
                      item.color || "text-pastel-purple"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
