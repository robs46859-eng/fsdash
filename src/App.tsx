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
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
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
    <div className="w-64 h-screen border-r border-white/20 flex flex-col bg-white/10 backdrop-blur-3xl z-20">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-primary-accent rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-accent/20">F</div>
          <span className="text-2xl font-display font-bold tracking-tighter">FullStack</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                activeTab === item.id 
                  ? "bg-white/60 text-primary-accent shadow-sm" 
                  : "text-gray-500 hover:bg-white/30"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-primary-accent" : "text-gray-400")} />
              <div className="flex flex-col items-start">
                <span>{item.label}</span>
                <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 font-mono">{item.path}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-8">
        <div className="p-4 rounded-2xl bg-white/40 border border-white/40 flex items-center gap-3 group cursor-pointer hover:bg-white/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-secondary-accent/10 flex items-center justify-center text-secondary-accent text-xs font-bold ring-1 ring-secondary-accent/20">RS</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Rob S.</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Admin • /profile</p>
          </div>
          <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const TopBar = () => {
  return (
    <div className="h-20 border-b border-white/20 flex items-center justify-between px-10 bg-white/10 backdrop-blur-2xl sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/40 bg-white/20 cursor-pointer hover:bg-white/40 transition-all group">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Acme Corp</span>
            <span className="text-[9px] text-gray-400 font-mono">/tenants/acme-corp</span>
          </div>
          <ChevronDown size={14} className="text-gray-400 group-hover:rotate-180 transition-transform" />
        </div>
        
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live System</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-11 pr-5 py-2.5 bg-white/20 border border-white/40 rounded-xl text-sm focus:ring-4 focus:ring-primary-accent/5 focus:bg-white/40 transition-all w-72 outline-none"
          />
        </div>
        <button className="p-2.5 text-gray-500 hover:bg-white/40 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: ReviewItem["status"] }) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    needs_fix: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    executed: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    delivered: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  };

  return (
    <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", styles[status])}>
      {status.replace("_", " ")}
    </span>
  );
};

const MetricsHeader = ({ items }: { items: ReviewItem[] }) => {
  const metrics = [
    { label: "Pending", value: items.filter(i => i.status === "pending").length, color: "text-amber-500" },
    { label: "Approved", value: items.filter(i => i.status === "approved").length, color: "text-emerald-500" },
    { label: "Executed", value: items.filter(i => i.status === "executed").length, color: "text-indigo-500" },
    { label: "Delivered", value: items.filter(i => i.status === "delivered").length, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {metrics.map((m) => (
        <div key={m.label} className="glass-panel p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
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
        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-screen w-[550px] bg-white/80 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.1)] z-50 flex flex-col border-l border-white/20"
      >
        <div className="p-8 border-b border-white/20 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight">{item.workflowName}</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{item.stage} • {item.id}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-black/5 rounded-xl transition-all">
            <XCircle size={22} className="text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-white/20 px-8">
          {["preview", "trace", "metadata", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === tab ? "border-primary-accent text-primary-accent" : "border-transparent text-gray-400 hover:text-gray-600"
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                <p className="mt-2 text-base font-semibold text-gray-900">{item.subject}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Body</label>
                <div className="mt-3 p-6 bg-white/40 border border-white/60 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap text-gray-700 shadow-sm">
                  {item.messageBody}
                </div>
              </div>
            </div>
          )}

          {activeTab === "trace" && (
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision Path</label>
              <div className="p-5 bg-black/5 rounded-2xl font-mono text-[11px] text-gray-600 leading-relaxed border border-black/5">
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tenant</label>
                  <p className="mt-1 text-sm font-semibold">{item.tenant}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actor</label>
                  <p className="mt-1 text-sm font-semibold">{item.actor}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</label>
                  <div className="mt-2">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                      item.metadata.priority === "high" ? "bg-rose-500/10 text-rose-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {item.metadata.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Context</label>
                  <p className="mt-1 text-sm font-semibold">{item.metadata.workflowContext}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-8">
              {item.history.map((h, i) => (
                <div key={i} className="flex gap-6 relative">
                  {i !== item.history.length - 1 && (
                    <div className="absolute left-[13px] top-8 bottom-[-32px] w-[1px] bg-gray-200" />
                  )}
                  <div className="w-7 h-7 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize text-gray-900">{h.action}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{h.actor} • {new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/20 bg-white/20">
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
                className="btn-minimal text-rose-500 hover:bg-rose-500/10 disabled:opacity-30"
              >
                Reject
              </button>
              <button 
                disabled={item.status !== "pending"}
                className="btn-minimal text-gray-500 disabled:opacity-30"
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
                className="w-full btn-primary bg-indigo-600 shadow-indigo-600/20 flex items-center justify-center gap-2"
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
                className="w-full btn-primary bg-purple-600 shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                <Send size={18} /> Dry-Run Deliver
              </button>
            </Tooltip>

            {item.status === "delivered" && (
              <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">Successfully Delivered</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Provider: SendGrid • {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            <p className="text-[10px] text-center text-gray-400 uppercase tracking-[0.2em] font-bold mt-2">
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
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3">Review Queue</h1>
              <p className="text-gray-400 font-medium">Manage and govern outbound execution workflows.</p>
            </header>

            <MetricsHeader items={queue} />

            <div className="glass-panel overflow-hidden">
              <div className="p-5 border-b border-white/40 flex items-center justify-between bg-white/20">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-black/5 rounded-xl transition-all">
                    <Filter size={16} /> Filter
                  </button>
                  <div className="h-5 w-[1px] bg-gray-200/50" />
                  <div className="flex gap-3">
                    {["All", "Pending", "Approved", "Executed"].map(f => (
                      <button key={f} className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all", f === "All" ? "bg-gray-900 text-white shadow-lg shadow-gray-900/10" : "text-gray-400 hover:bg-black/5")}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="p-2.5 text-gray-400 hover:bg-black/5 rounded-xl transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Workflow</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Score</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Preview</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actor</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-8 py-6 h-20 bg-white/5" />
                        </tr>
                      ))
                    ) : queue.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 text-gray-300">
                            <LayoutDashboard size={48} strokeWidth={1} />
                            <p className="text-sm font-bold uppercase tracking-widest">No items in the queue</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      queue.map((item) => (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedItem(item)}
                          className="group hover:bg-white/40 cursor-pointer transition-all"
                        >
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-gray-900">{item.workflowName}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{item.stage}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full ring-4 ring-opacity-20",
                                item.score > 90 ? "bg-emerald-500 ring-emerald-500" : item.score > 80 ? "bg-amber-500 ring-amber-500" : "bg-rose-500 ring-rose-500"
                              )} />
                              <span className="text-sm font-bold">{item.score}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm text-gray-500 truncate max-w-[200px] font-medium">{item.preview}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-400">
                                {item.actor[0].toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-600 font-semibold">{item.actor.split("@")[0]}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs text-gray-400 font-bold">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3">Executions</h1>
              <p className="text-gray-400 font-medium">Real-time monitoring of outbound action execution.</p>
            </header>
            <div className="grid grid-cols-3 gap-8 mb-12">
              {[
                { label: "Active Jobs", value: "12", trend: "+2", color: "text-primary-accent" },
                { label: "Avg Execution Time", value: "1.2s", trend: "-150ms", color: "text-emerald-500" },
                { label: "Success Rate", value: "99.9%", trend: "Stable", color: "text-indigo-500" },
              ].map((m, i) => (
                <div key={i} className="glass-panel p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{m.label}</p>
                  <div className="flex items-end justify-between">
                    <p className={cn("text-3xl font-display font-bold tracking-tighter", m.color)}>{m.value}</p>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-panel p-12 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-primary-accent/5 flex items-center justify-center text-primary-accent border border-primary-accent/10">
                  <Play size={40} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Execution Engine Ready</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">All systems are operational. Outbound actions are being processed through the governance protocol.</p>
                </div>
                <button className="btn-primary">View System Logs</button>
              </div>
            </div>
          </div>
        );
      case "deliveries":
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3">Deliveries</h1>
              <p className="text-gray-400 font-medium">Tracking and verification of delivered payloads.</p>
            </header>
            <div className="glass-panel overflow-hidden">
              <div className="p-8 border-b border-white/40 bg-white/20">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Recent Deliveries</h3>
              </div>
              <div className="divide-y divide-white/20">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-8 flex items-center justify-between hover:bg-white/40 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                        <Send size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Payload ID: DEL-00{i}84</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Provider: SendGrid • Status: Confirmed</p>
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
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3">Tenants</h1>
              <p className="text-gray-400 font-medium">Manage organizational isolation and governance boundaries.</p>
            </header>
            <div className="grid grid-cols-2 gap-8">
              {[
                { name: "Acme Corp", id: "acme-corp", users: 124, status: "Active" },
                { name: "Global Tech", id: "global-tech", users: 89, status: "Active" },
                { name: "Stark Ind", id: "stark-ind", users: 45, status: "Pending" },
                { name: "Wayne Ent", id: "wayne-ent", users: 210, status: "Active" },
              ].map((t, i) => (
                <div key={i} className="glass-panel p-8 hover:border-primary-accent/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-105 transition-transform">
                      {t.name[0]}
                    </div>
                    <StatusBadge status={t.status.toLowerCase() as any} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{t.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-6">/tenants/{t.id}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/20">
                    <span className="text-xs text-gray-500 font-medium">{t.users} Active Users</span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3">Settings</h1>
              <p className="text-gray-400 font-medium">Configure system governance and security protocols.</p>
            </header>
            <div className="space-y-8">
              <div className="glass-panel p-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">System Configuration</h3>
                <div className="space-y-8">
                  {[
                    { label: "Governance Level", desc: "Strict enforcement of approval chains", value: "High" },
                    { label: "Execution Delay", desc: "Buffer time before automated delivery", value: "500ms" },
                    { label: "Audit Logging", desc: "Retention period for decision traces", value: "365 Days" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/20 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{s.label}</p>
                        <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                      </div>
                      <button className="btn-minimal text-gray-900 font-bold">{s.value}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel p-10 border-rose-500/20 bg-rose-500/[0.02]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-rose-500 mb-4">Danger Zone</h3>
                <p className="text-xs text-gray-400 mb-6">Actions here are irreversible and impact the entire governance engine.</p>
                <button className="btn-minimal text-rose-500 border-rose-500/20 hover:bg-rose-500/10">Reset System State</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative bg-[#F7F8FB]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
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

