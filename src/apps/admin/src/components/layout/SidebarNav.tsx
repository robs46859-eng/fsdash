import React, { useState } from "react";
import {
  Activity,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  ReceiptText,
  Route,
  ScrollText,
  Settings,
  Shield,
  Users,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../common/StatusBadge";
import { AppSectionId, SurfaceDefinition } from "../../data/surfaces";

const icons: Record<AppSectionId, React.ComponentType<{ size?: number; className?: string }>> = {
  overview: LayoutDashboard,
  "marketing-studio": Megaphone,
  "marketing-economics": ReceiptText,
  tenants: Users,
  "api-keys": KeyRound,
  "usage-billing": Wallet,
  "providers-routing": Route,
  "cache-performance": Gauge,
  "requests-logs-traces": ScrollText,
  "security-policy-pii": Shield,
  "system-health": Activity,
  settings: Settings,
};

interface SidebarNavProps {
  activeTab: AppSectionId;
  items: SurfaceDefinition[];
  onNavigate: (path: string) => void;
}

const transition = { duration: 0.15, ease: [0, 0, 0.2, 1] as const };

export const SidebarNav = ({ activeTab, items, onNavigate }: SidebarNavProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="z-20 flex h-screen w-64 flex-col bg-surface-container-low">
      <div className="p-8">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-surface-container-high font-display text-sm font-bold text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/15">
            F
          </div>
          <span className="font-display text-xl font-semibold uppercase tracking-tight text-on-surface">
            FullStack
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
                  "group relative flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
                  active
                    ? "border-l-[3px] border-primary bg-surface-container-high pl-[13px] text-on-surface"
                    : "border-l-[3px] border-transparent pl-[16px] text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface",
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-opacity duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
                    active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface",
                  )}
                />
                <div className="flex min-w-0 flex-col items-start">
                  <span className="truncate uppercase tracking-wide">{item.navLabel}</span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-tight text-on-surface-variant opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {item.path}
                  </span>
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
          className="flex w-full cursor-pointer items-center gap-3 bg-surface-container-high p-4 text-left outline outline-1 -outline-offset-1 outline-outline-variant/15 transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)] hover:bg-surface-container-highest"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-surface-container-low text-xs font-bold text-primary outline outline-1 -outline-offset-1 outline-primary/25">
            RS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-on-surface">FullStack Ops</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Operator shell</p>
          </div>
          <ChevronRight
            size={14}
            className={cn(
              "shrink-0 text-on-surface-variant transition-transform duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
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
                className="ds-float-shadow absolute bottom-full left-8 z-50 mb-2 w-48 bg-surface-container-highest p-2 outline outline-1 -outline-offset-1 outline-outline-variant/15"
              >
                {[
                  { label: "Public Landing", path: "/" },
                  { label: "Operator Access", path: "/access" },
                  { label: "Dashboard Overview", path: "/app/overview", color: "text-primary" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onNavigate(item.path);
                      setIsProfileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-widest transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)] hover:bg-surface-container-high",
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
