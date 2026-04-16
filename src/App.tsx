import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Play, 
  Send, 
  Users, 
  Settings, 
  ChevronDown, 
  Bell, 
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Filter,
  MoreHorizontal,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { api } from "./services/api";
import { ReviewItem, Delivery } from "./types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Tooltip = ({ children, text, disabled = false }: { children: React.ReactNode, text: string, disabled?: boolean }) => {
  if (disabled) return <>{children}</>;
  return (
    <div className="relative group flex-1">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-outline">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface" />
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const navItems = [
    { id: "review", label: "Review Queue", icon: LayoutDashboard, path: "/review-queue" },
    { id: "executions", label: "Executions", icon: Play, path: "/executions" },
    { id: "deliveries", label: "Deliveries", icon: Send, path: "/deliveries" },
    { id: "tenants", label: "Tenants", icon: Users, path: "/tenants" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="w-64 h-screen border-r border-outline-variant flex flex-col bg-surface-container-high/60 backdrop-blur-3xl z-20">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-primary-accent rounded-2xl flex items-center justify-center text-surface font-bold shadow-lg shadow-primary-accent/20">F</div>
          <span className="text-2xl font-display font-bold tracking-tighter text-on-surface">FullStack</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                activeTab === item.id 
                  ? "bg-primary-accent/10 text-primary-accent shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-primary-accent" : "text-on-surface-variant")} />
              <div className="flex flex-col items-start">
                <span>{item.label}</span>
                <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant/60 font-mono">{item.path}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-8">
        <div className="p-4 rounded-2xl bg-surface-container-highest/40 border border-outline-variant flex items-center gap-3 group cursor-pointer hover:bg-surface-container-highest/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-secondary-accent/10 flex items-center justify-center text-secondary-accent text-xs font-bold ring-1 ring-secondary-accent/20">RS</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-on-surface">Rob S.</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-mono">Admin • /profile</p>
          </div>
          <ChevronRight size={14} className="text-on-surface-variant/40 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const TopBar = () => {
  return (
    <div className="h-20 border-b border-outline-variant flex items-center justify-between px-10 bg-surface-container-high/40 backdrop-blur-2xl sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-highest/40 cursor-pointer hover:bg-surface-container-highest/60 transition-all group">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-on-surface">Acme Corp</span>
            <span className="text-[9px] text-on-surface-variant font-mono">/tenants/acme-corp</span>
          </div>
          <ChevronDown size={14} className="text-on-surface-variant/60 group-hover:rotate-180 transition-transform" />
        </div>
        
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-green/10 border border-green/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          <span className="text-[10px] font-bold text-green uppercase tracking-widest">Live System</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-11 pr-5 py-2.5 bg-surface-container-highest/40 border border-outline-variant rounded-xl text-sm focus:ring-4 focus:ring-primary-accent/5 focus:bg-surface-container-highest/60 transition-all w-72 outline-none text-on-surface"
          />
        </div>
        <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red rounded-full border-2 border-surface" />
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: ReviewItem["status"] }) => {
  const styles = {
    pending: "bg-primary-accent/10 text-primary-accent border-primary-accent/20",
    approved: "bg-green/10 text-green border-green/20",
    rejected: "bg-red/10 text-red border-red/20",
    needs_fix: "bg-primary-accent/10 text-primary-accent border-primary-accent/20",
    executed: "bg-red/10 text-red border-red/20",
    delivered: "bg-green/10 text-green border-green/20",
  };

  return (
    <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", styles[status])}>
      {status.replace("_", " ")}
    </span>
  );
};

const MetricsHeader = ({ items }: { items: ReviewItem[] }) => {
  const metrics = [
    { label: "Pending", value: items.filter(i => i.status === "pending").length, color: "text-primary-accent" },
    { label: "Approved", value: items.filter(i => i.status === "approved").length, color: "text-green" },
    { label: "Executed", value: items.filter(i => i.status === "executed").length, color: "text-red" },
    { label: "Delivered", value: items.filter(i => i.status === "delivered").length, color: "text-green" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {metrics.map((m) => (
        <div key={m.label} className="ds-panel p-4 rounded-xl">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">{m.label}</p>
          <p className={cn("text-2xl font-display font-bold", m.color)}>{m.value}</p>
        </div>
      ))}
    </div>
  );
};

const SlidePanel = ({ item, onClose, onAction }: { item: ReviewItem | null, onClose: () => void, onAction: () => void }) => {
  const [activeTab, setActiveTab] = useState("preview");

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-surface/20 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-screen w-[550px] bg-surface-container-highest/90 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] z-50 flex flex-col border-l border-outline-variant"
      >
        <div className="p-8 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight text-on-surface">{item.workflowName}</h2>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1 font-mono">{item.stage} • {item.id}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-on-surface/5 rounded-xl transition-all">
            <XCircle size={22} className="text-on-surface-variant/60" />
          </button>
        </div>

        <div className="flex border-b border-outline-variant px-8">
          {["preview", "trace", "metadata", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === tab ? "border-primary-accent text-primary-accent" : "border-transparent text-on-surface-variant hover:text-on-surface"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "preview" && (
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Subject</label>
                <p className="mt-2 text-base font-semibold text-on-surface">{item.subject}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Message Body</label>
                <div className="mt-3 p-6 bg-surface-container-low border border-outline-variant rounded-2xl text-sm leading-relaxed whitespace-pre-wrap text-on-surface-variant shadow-sm">
                  {item.messageBody}
                </div>
              </div>
            </div>
          )}

          {activeTab === "trace" && (
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Decision Path</label>
              <div className="p-5 bg-surface-container-low rounded-2xl font-mono text-[11px] text-on-surface-variant/80 leading-relaxed border border-outline-variant">
                {item.decisionTrace}
              </div>
              <div className="flex items-start gap-4 p-4 bg-primary-accent/5 rounded-2xl border border-primary-accent/10">
                <AlertCircle size={18} className="text-primary-accent mt-0.5" />
                <p className="text-xs text-primary-accent/80 leading-relaxed font-medium">This action was triggered based on high-intent signals from the last 24 hours.</p>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tenant</label>
                  <p className="mt-1 text-sm font-semibold text-on-surface">{item.tenant}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Actor</label>
                  <p className="mt-1 text-sm font-semibold text-on-surface">{item.actor}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Priority</label>
                  <div className="mt-2">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                      item.metadata.priority === "high" ? "bg-red/10 text-red" : "bg-surface-container-low text-on-surface-variant"
                    )}>
                      {item.metadata.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Context</label>
                  <p className="mt-1 text-sm font-semibold text-on-surface">{item.metadata.workflowContext}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-8">
              {item.history.map((h, i) => (
                <div key={i} className="flex gap-6 relative">
                  {i !== item.history.length - 1 && (
                    <div className="absolute left-[13px] top-8 bottom-[-32px] w-[1px] bg-outline-variant" />
                  )}
                  <div className="w-7 h-7 rounded-xl bg-surface border border-outline-variant shadow-sm flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize text-on-surface">{h.action}</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5 font-medium font-mono">{h.actor} • {new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-outline-variant bg-surface-container-highest/20">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Tooltip 
                text={item.status === "pending" ? "" : "Already approved"} 
                disabled={item.status === "pending"}
              >
                <button 
                  onClick={onAction}
                  disabled={item.status !== "pending"}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Approve
                </button>
              </Tooltip>
              
              <button 
                disabled={item.status !== "pending"}
                className="btn-minimal text-red hover:bg-red/10 disabled:opacity-30"
              >
                Reject
              </button>
              <button 
                disabled={item.status !== "pending"}
                className="btn-minimal text-on-surface-variant disabled:opacity-30"
              >
                Needs Fix
              </button>
            </div>

            <Tooltip 
              text={
                item.status === "pending" ? "Requires approval before execution" : 
                item.status === "executed" || item.status === "delivered" ? "Already executed" : ""
              }
              disabled={item.status === "approved"}
            >
              <button 
                onClick={async () => {
                  await api.execute(item.id);
                  onAction();
                }}
                disabled={item.status !== "approved"}
                className="w-full btn-primary bg-red text-on-surface shadow-red/20 flex items-center justify-center gap-2"
              >
                <Play size={18} /> Execute Action
              </button>
            </Tooltip>

            <Tooltip 
              text={
                item.status === "pending" || item.status === "approved" ? "Requires execution before delivery" : 
                item.status === "delivered" ? "Already delivered" : ""
              }
              disabled={item.status === "executed"}
            >
              <button 
                onClick={async () => {
                  await api.deliver(item.id, true);
                  onAction();
                }}
                disabled={item.status !== "executed"}
                className="w-full btn-primary bg-purple-500 text-on-surface shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <Send size={18} /> Dry-Run Deliver
              </button>
            </Tooltip>

            {item.status === "delivered" && (
              <div className="p-5 bg-green/5 rounded-2xl border border-green/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-green" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Successfully Delivered</p>
                  <p className="text-[11px] text-green/80 font-medium font-mono">Provider: SendGrid • {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            <p className="text-[10px] text-center text-on-surface-variant/60 uppercase tracking-[0.2em] font-bold mt-2 font-mono">
              System Governance Protocol Active
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("review");
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await api.getReviewQueue();
      setQueue(data);
      if (selectedItem) {
        const updated = data.find(i => i.id === selectedItem.id);
        if (updated) setSelectedItem(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "review":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Review Queue</h1>
              <p className="text-on-surface-variant font-medium">Manage and govern outbound execution workflows.</p>
            </header>

            <MetricsHeader items={queue} />

            <div className="ds-panel overflow-hidden rounded-xl">
              <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-high">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-on-surface/5 rounded-xl transition-all font-mono">
                    <Filter size={16} /> Filter
                  </button>
                  <div className="h-5 w-[1px] bg-outline-variant" />
                  <div className="flex gap-3">
                    {["All", "Pending", "Approved", "Executed"].map(f => (
                      <button key={f} className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all font-mono", f === "All" ? "bg-primary-accent text-surface shadow-lg shadow-primary-accent/10" : "text-on-surface-variant hover:bg-on-surface/5")}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="p-2.5 text-on-surface-variant/60 hover:bg-on-surface/5 rounded-xl transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest">
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-mono">Workflow</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-mono">Score</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-mono">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-mono">Preview</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-mono">Actor</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-mono">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-8 py-6 h-20 bg-surface-container-highest/20" />
                        </tr>
                      ))
                    ) : queue.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 text-on-surface-variant/40">
                            <LayoutDashboard size={48} strokeWidth={1} />
                            <p className="text-sm font-bold uppercase tracking-widest font-mono">No items in the queue</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      queue.map((item, idx) => (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            "group hover:bg-surface-container-highest/60 cursor-pointer transition-all",
                            idx % 2 === 0 ? "ds-zebra-even" : "ds-zebra-odd"
                          )}
                        >
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-on-surface">{item.workflowName}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-mono">{item.stage}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full ring-4 ring-opacity-20",
                                item.score > 90 ? "bg-green ring-green" : item.score > 80 ? "bg-primary-accent ring-primary-accent" : "bg-red ring-red"
                              )} />
                              <span className="text-sm font-bold text-on-surface">{item.score}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm text-on-surface-variant truncate max-w-[200px] font-medium">{item.preview}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-surface border border-outline-variant shadow-sm flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                                {item.actor[0].toUpperCase()}
                              </div>
                              <span className="text-xs text-on-surface-variant font-semibold font-mono">{item.actor.split("@")[0]}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs text-on-surface-variant/60 font-bold font-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "executions":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Executions</h1>
              <p className="text-on-surface-variant font-medium">Real-time monitoring of outbound action execution.</p>
            </header>
            <div className="grid grid-cols-3 gap-8 mb-12">
              {[
                { label: "Active Jobs", value: "12", trend: "+2", color: "text-primary-accent" },
                { label: "Avg Execution Time", value: "1.2s", trend: "-150ms", color: "text-green" },
                { label: "Success Rate", value: "99.9%", trend: "Stable", color: "text-indigo-400" },
              ].map((m, i) => (
                <div key={i} className="ds-panel p-8 rounded-xl">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-mono">{m.label}</p>
                  <div className="flex items-end justify-between">
                    <p className={cn("text-3xl font-display font-bold tracking-tighter", m.color)}>{m.value}</p>
                    <span className="text-[10px] font-bold text-green bg-green/10 px-2 py-1 rounded-lg font-mono">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ds-panel p-12 text-center rounded-xl">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-primary-accent/5 flex items-center justify-center text-primary-accent border border-primary-accent/10">
                  <Play size={40} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-on-surface">Execution Engine Ready</h3>
                  <p className="text-on-surface-variant text-sm max-w-md mx-auto">All systems are operational. Outbound actions are being processed through the governance protocol.</p>
                </div>
                <button className="btn-primary">View System Logs</button>
              </div>
            </div>
          </div>
        );
      case "deliveries":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Deliveries</h1>
              <p className="text-on-surface-variant font-medium">Tracking and verification of delivered payloads.</p>
            </header>
            <div className="ds-panel overflow-hidden rounded-xl">
              <div className="p-8 border-b border-outline-variant bg-surface-container-high">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-mono">Recent Deliveries</h3>
              </div>
              <div className="divide-y divide-outline-variant">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-8 flex items-center justify-between hover:bg-surface-container-highest/60 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-green/10 flex items-center justify-center text-green border border-green/10">
                        <Send size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">Payload ID: DEL-00{i}84</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-mono">Provider: SendGrid • Status: Confirmed</p>
                      </div>
                    </div>
                    <button className="btn-minimal text-primary-accent">View Receipt</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "tenants":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Tenants</h1>
              <p className="text-on-surface-variant font-medium">Manage organizational isolation and governance boundaries.</p>
            </header>
            <div className="grid grid-cols-2 gap-8">
              {[
                { name: "Acme Corp", id: "acme-corp", users: 124, status: "Active" },
                { name: "Global Tech", id: "global-tech", users: 89, status: "Active" },
                { name: "Stark Ind", id: "stark-ind", users: 45, status: "Pending" },
                { name: "Wayne Ent", id: "wayne-ent", users: 210, status: "Active" },
              ].map((t, i) => (
                <div key={i} className="ds-panel p-8 hover:border-primary-accent/40 transition-all cursor-pointer group rounded-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-on-surface text-surface flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-105 transition-transform">
                      {t.name[0]}
                    </div>
                    <StatusBadge status={t.status.toLowerCase() as any} />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-on-surface">{t.name}</h3>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest mb-6">/tenants/{t.id}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-outline-variant">
                    <span className="text-xs text-on-surface-variant font-medium">{t.users} Active Users</span>
                    <ChevronRight size={16} className="text-on-surface-variant/40 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Settings</h1>
              <p className="text-on-surface-variant font-medium">Configure system governance and security protocols.</p>
            </header>
            <div className="space-y-8">
              <div className="ds-panel p-10 rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-8 font-mono">System Configuration</h3>
                <div className="space-y-8">
                  {[
                    { label: "Governance Level", desc: "Strict enforcement of approval chains", value: "High" },
                    { label: "Execution Delay", desc: "Buffer time before automated delivery", value: "500ms" },
                    { label: "Audit Logging", desc: "Retention period for decision traces", value: "365 Days" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-outline-variant last:border-0">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{s.label}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{s.desc}</p>
                      </div>
                      <button className="btn-minimal text-on-surface font-bold font-mono">{s.value}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ds-panel p-10 border-red/20 bg-red/[0.02] rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-red mb-4 font-mono">Danger Zone</h3>
                <p className="text-xs text-on-surface-variant mb-6">Actions here are irreversible and impact the entire governance engine.</p>
                <button className="btn-minimal text-red border-red/20 hover:bg-red/10">Reset System State</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const cursor = document.getElementById('fs-cursor');
    const ring = document.getElementById('fs-cursor-ring');
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX; 
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    };

    document.addEventListener('mousemove', onMouseMove);

    let frameId: number;
    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      frameId = requestAnimationFrame(animRing);
    };
    frameId = requestAnimationFrame(animRing);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative bg-surface">
      {/* Custom Cursor elements expected by index.css */}
      <div id="fs-cursor" />
      <div id="fs-cursor-ring" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto p-10">
          {renderContent()}
        </div>
      </main>

      <SlidePanel 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onAction={fetchData}
      />
    </div>
  );
}

