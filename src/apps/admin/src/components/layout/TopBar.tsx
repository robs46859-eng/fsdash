import React, { useState } from "react";
import { Search, Bell, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const TopBar = () => {
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState("Acme Corp");

  const tenants = ["Acme Corp", "Globex", "Soylent Corp", "Initech"];

  return (
    <div className="h-20 border-b border-slate-200/50 flex items-center justify-between px-10 bg-lilac sticky top-0 z-30">
      <div className="flex items-center gap-8">
        <div className="relative">
          <div 
            onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-200/50 bg-white/20 cursor-pointer hover:bg-white/40 transition-all group"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-midnight">{currentTenant}</span>
              <span className="text-[9px] text-pastel-pink font-mono">/tenants/{currentTenant.toLowerCase().replace(" ", "-")}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-300 transition-transform ${isTenantMenuOpen ? "rotate-180" : ""}`} />
          </div>

          <AnimatePresence>
            {isTenantMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTenantMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl p-2 z-50 shadow-2xl"
                >
                  <p className="px-3 py-2 text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Switch Tenant</p>
                  {tenants.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setCurrentTenant(t);
                        setIsTenantMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
                    >
                      <span className={currentTenant === t ? "text-pastel-purple" : "text-slate-400"}>{t}</span>
                      {currentTenant === t && <Check size={14} className="text-pastel-purple" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live System</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pastel-purple transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-11 pr-5 py-2.5 bg-white/20 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pastel-purple/5 focus:bg-white/40 transition-all w-72 outline-none text-midnight placeholder:text-slate-200"
          />
        </div>
        <button className="p-2.5 text-slate-400 hover:bg-white/40 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </div>
  );
};
