import React, { useState } from "react";
import {
  LayoutDashboard,
  Box,
  Lightbulb,
  Library,
  PlayCircle,
  Zap,
  Cpu,
  Settings,
  Orbit,
  ChevronRight,
  TrendingUp,
  WalletCards,
  Database,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../admin/src/components/common";
import { StelaraiSectionId, StelaraiSurfaceDefinition } from "../data/surfaces";

const icons: Record<StelaraiSectionId, React.ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
  "connected-accounts": WalletCards,
  "connected-sources": Database,
  "canvas-builder": Box,
  "workflow-suggestions": Lightbulb,
  "workflow-library": Library,
  "execution-simulator": PlayCircle,
  "predictive-niche": TrendingUp,
  "software-tracker": Cpu,
  "industry-automation": Zap,
  settings: Settings,
};

interface WorkspaceSidebarProps {
  activeTab: StelaraiSectionId;
  items: StelaraiSurfaceDefinition[];
  onNavigate: (path: string) => void;
  workspaceName: string;
}

const transition = { duration: 0.15, ease: [0, 0, 0.2, 1] as const };

export const WorkspaceSidebar = ({ activeTab, items, onNavigate, workspaceName }: WorkspaceSidebarProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="z-20 flex h-screen w-64 flex-col bg-surface-container-low border-r border-outline-variant/10">
      <div className="p-8">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-on-primary font-display text-sm font-bold shadow-lg shadow-primary/20">
            <Orbit size={20} />
          </div>
          <span className="font-display text-xl font-semibold uppercase tracking-tight text-on-surface">
            StelarAI
          </span>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = icons[item.id];
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "group relative flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-all duration-150",
                  active
                    ? "border-l-[3px] border-primary bg-primary/5 pl-[13px] text-on-surface"
                    : "border-l-[3px] border-transparent pl-[16px] text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-opacity duration-150",
                    active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface",
                  )}
                />
                <div className="flex min-w-0 flex-col items-start">
                  <span className="truncate uppercase tracking-wide">{item.navLabel}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="relative mt-auto p-8">
        <button
          type="button"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex w-full cursor-pointer items-center gap-3 bg-surface-container-high p-4 text-left outline outline-1 -outline-offset-1 outline-outline-variant/15 transition-colors duration-150 hover:bg-surface-container-highest"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-xs font-bold text-primary">
            {workspaceName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-on-surface">{workspaceName}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">StelarAI Workspace</p>
          </div>
          <ChevronRight
            size={14}
            className={cn(
              "shrink-0 text-on-surface-variant transition-transform duration-150",
              isProfileMenuOpen ? "rotate-90" : "",
            )}
          />
        </button>

        <AnimatePresence>
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} aria-hidden />
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={transition}
                className="ds-float-shadow absolute bottom-full left-8 z-50 mb-2 w-48 bg-surface-container-highest p-2 outline outline-1 -outline-offset-1 outline-outline-variant/15 shadow-xl"
              >
                {[
                  { label: "Switch Workspace", path: "/workspace/dashboard" },
                  { label: "Account Settings", path: "/workspace/settings" },
                  { label: "Logout", path: "/access", color: "text-error" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onNavigate(item.path);
                      setIsProfileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-surface-container-high",
                      item.color || "text-on-surface-variant hover:text-on-surface",
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
