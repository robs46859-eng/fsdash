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
  ExternalLink,
  FileText,
  Activity,
  ShieldCheck,
  Wand2,
  Navigation,
  Home,
  ShoppingCart,
  Utensils,
  Wallet,
  Heart,
  Briefcase,
  Target,
  Edit3,
  DownloadCloud
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
    { id: "leads", label: "Leads", icon: Users, path: "/leads" },
    { id: "family", label: "Family Hub", icon: Home, path: "/family" },
    { id: "business", label: "My Family Business", icon: Briefcase, path: "/business" },
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

const SystemPulse = () => {
  const [events, setEvents] = useState([
    { id: 1, text: "Pursuit Engine initialized for Wayne Ent", time: "just now" },
    { id: 2, text: "Alignment check completed: Project Delta", time: "2m ago" },
    { id: 3, text: "Drafting Engine: 4 sections generated", time: "5m ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        text: "System: Processing background coordination...",
        time: "just now"
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 2)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8 p-4 bg-primary-accent/5 border border-primary-accent/10 rounded-xl overflow-hidden relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-primary-accent/10 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse" />
          <span className="text-[10px] font-bold text-primary-accent uppercase tracking-widest">Live Pulse</span>
        </div>
        <div className="flex-1 flex gap-8 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {events.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-xs font-medium text-on-surface-variant">{e.text}</span>
                <span className="text-[10px] font-mono text-on-surface-variant/40 uppercase">{e.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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

const LeadDetailPanel = ({ lead, onClose }: { lead: any | null, onClose: () => void }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("engines");
  const [webProject, setWebProject] = useState<any | null>(null);

  useEffect(() => {
    if (lead) {
      api.getWebProject(lead.id).then(setWebProject);
    }
  }, [lead]);

  if (!lead) return null;

  const handleTrigger = async (verticalId: string) => {
    setLoading(verticalId);
    try {
      const res = await api.triggerVertical(lead.id, verticalId);
      if (verticalId === "presence-engine") setWebProject(res);
      alert(`${verticalId} triggered successfully!`);
    } catch (err) {
      alert(`Failed to trigger ${verticalId}`);
    } finally {
      setLoading(null);
    }
  };

  const handleApprove = async () => {
    if (!webProject) return;
    setLoading("approving");
    try {
      await api.approveBranding(webProject.id);
      const updated = await api.getWebProject(lead.id);
      setWebProject(updated);
    } finally {
      setLoading(null);
    }
  };

  const verticals = [
    { id: "autopitch", name: "Pursuit Engine", icon: Wand2, desc: "Generate proposal & fee schedule" },
    { id: "cyberscribe", name: "Drafting Engine", icon: FileText, desc: "Draft technical content from notes" },
    { id: "omniscale", name: "Coordination Engine", icon: Activity, desc: "Run multi-discipline risk review" },
    { id: "ai-consistency", name: "Alignment Engine", icon: ShieldCheck, desc: "Validate cross-artifact alignment" },
    { id: "presence-engine", name: "Presence Engine", icon: ExternalLink, desc: "High-end web & branding suite" },
  ];

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
            <h2 className="text-xl font-display font-bold tracking-tight text-on-surface">{lead.company}</h2>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1 font-mono">{lead.id} • {lead.name}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-on-surface/5 rounded-xl transition-all">
            <XCircle size={22} className="text-on-surface-variant/60" />
          </button>
        </div>

        <div className="flex border-b border-outline-variant px-8">
          {[
            { id: "engines", label: "Engines", icon: Play },
            { id: "web", label: "Web Presence", icon: ExternalLink },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2",
                activeTab === tab.id ? "border-primary-accent text-primary-accent" : "border-transparent text-on-surface-variant hover:text-on-surface"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === "engines" && (
            <section>
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 font-mono">
                Professional Vertical Engines
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {verticals.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleTrigger(v.id)}
                    disabled={!!loading}
                    className="group p-6 bg-surface-container-low border border-outline-variant rounded-2xl text-left hover:border-primary-accent/40 transition-all flex items-center gap-6 relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/5 flex items-center justify-center text-primary-accent border border-primary-accent/10 group-hover:scale-110 transition-transform">
                      <v.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">{v.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{v.desc}</p>
                    </div>
                    {loading === v.id ? (
                      <Clock size={18} className="text-primary-accent animate-spin" />
                    ) : (
                      <ChevronRight size={18} className="text-on-surface-variant/20 group-hover:text-primary-accent transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === "web" && (
            <div className="space-y-8">
              {!webProject ? (
                <div className="p-12 text-center border-2 border-dashed border-outline-variant rounded-3xl">
                  <ExternalLink size={40} className="mx-auto text-on-surface-variant/20 mb-4" />
                  <h3 className="text-lg font-bold text-on-surface">No Web Project Yet</h3>
                  <p className="text-sm text-on-surface-variant mt-2 mb-6">Initialize the Presence Engine to start building.</p>
                  <button 
                    onClick={() => handleTrigger("presence-engine")}
                    className="btn-primary mx-auto flex items-center gap-2"
                  >
                    <Wand2 size={18} /> Initialize Presence Engine
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <section>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Design Narrative</label>
                    <div className="mt-3 p-6 bg-surface-container-low border border-outline-variant rounded-2xl text-sm leading-relaxed text-on-surface-variant italic">
                      "{webProject.design_narrative}"
                    </div>
                  </section>

                  <section className="p-6 bg-surface-container-low border border-outline-variant rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest">Branding Control</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter",
                        webProject.branding.approval_status === "approved" ? "bg-green/10 text-green" : "bg-primary-accent/10 text-primary-accent"
                      )}>
                        {webProject.branding.approval_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border border-outline" style={{ background: webProject.branding.primary_color }} />
                        <span className="text-xs font-mono">{webProject.branding.primary_color}</span>
                      </div>
                      <div className="text-xs font-medium text-on-surface">Tone: {webProject.branding.tone_of_voice}</div>
                    </div>
                  </section>

                  {webProject.status === "ready" ? (
                    <section className="space-y-6">
                      <div className="p-6 bg-green/5 border border-green/10 rounded-2xl">
                        <h3 className="text-sm font-bold text-green flex items-center gap-2">
                          <CheckCircle2 size={18} /> HTML Artifact Ready
                        </h3>
                        <div className="mt-4 flex gap-3">
                          <button className="btn-primary bg-green text-on-surface border-green shadow-green/20 flex-1">
                            Download index.html
                          </button>
                        </div>
                      </div>
                      <div className="p-6 bg-surface-container-low border border-outline-variant rounded-2xl">
                        <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Implementation Guide</h3>
                        <div className="text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                          {webProject.instructions}
                        </div>
                      </div>
                    </section>
                  ) : (
                    <button 
                      onClick={handleApprove}
                      disabled={loading === "approving"}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      {loading === "approving" ? <Clock className="animate-spin" /> : <ShieldCheck size={18} />}
                      Approve Branding & Generate HTML
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <section className="p-6 bg-primary-accent/5 rounded-2xl border border-primary-accent/10">
            <div className="flex items-start gap-4">
              <ShieldCheck size={20} className="text-primary-accent mt-1" />
              <div>
                <p className="text-xs font-bold text-primary-accent uppercase tracking-wider">Plan Entitlement</p>
                <p className="text-xs text-primary-accent/70 mt-1 leading-relaxed">
                  You are on the <span className="font-bold text-primary-accent">Pro Plan</span>. All vertical engines are unlocked and ready for execution.
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [queue, setQueue] = useState<ReviewItem[]>([]);
...
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
        <div id="fs-cursor" />
        <div id="fs-cursor-ring" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary-accent)_0%,_transparent_60%)] opacity-[0.03]" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full ds-panel p-12 rounded-[40px] bg-surface-container-low/60 backdrop-blur-3xl border-outline-variant/40 relative z-10"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-primary-accent rounded-2xl flex items-center justify-center text-on-primary text-3xl font-display mb-6 shadow-2xl shadow-primary-accent/20">F</div>
            <h1 className="text-3xl font-display font-bold tracking-tighter text-on-surface">PAPA<span className="text-primary-accent">BASE</span></h1>
            <p className="text-on-surface-variant text-sm mt-2 font-medium">Technical Command Center & Family Hub</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); }}>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Terminal ID (Email)</label>
              <input type="email" placeholder="name@arkhamprison.com" className="ds-input mt-2" required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Access Key</label>
              <input type="password" placeholder="••••••••" className="ds-input mt-2" required />
            </div>

            <div className="pt-4 space-y-4">
              <button type="submit" className="w-full btn-primary py-4 text-sm">Initialize Session</button>
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-outline-variant" />
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">Or</span>
                <div className="h-[1px] flex-1 bg-outline-variant" />
              </div>
              <button type="button" className="w-full btn-secondary py-4 text-sm flex items-center justify-center gap-2">
                <ShieldCheck size={18} /> Join Family Pro Plan
              </button>
            </div>
          </form>

          <p className="text-[9px] text-center text-on-surface-variant/40 uppercase tracking-widest mt-10 font-bold">
            Root Access Secured: arkhamprison.com
          </p>
        </motion.div>
      </div>
    );
  }

  return (

  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [dadAIHistory, setDadAIHistory] = useState<{role: string, text: string}[]>([]);
  const [dadAIState, setDadAIState] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("lead"); // Mock role for now
  const [chiefAIState, setChiefAIState] = useState<any>(null);
  const [chiefAIHistory, setChiefAIHistory] = useState<{role: string, text: string}[]>([]);
  const [familyInsights, setFamilyInsights] = useState<any[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempBusinessName, setTempBusinessName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    api.getDadAIState().then(setDadAIState);
    api.getChiefAIState().then(setChiefAIState);
    if (userRole === "lead") {
      api.getFamilyInsights(userRole).then(setFamilyInsights);
    }
  }, [userRole]);
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

            <SystemPulse />
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
      case "leads":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Leads & Opportunities</h1>
              <p className="text-on-surface-variant font-medium">Industry-Agnostic Pipeline: Track and trigger automated delivery packages.</p>
            </header>
            
            <SystemPulse />
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Leads", value: "24", color: "text-on-surface" },
                { label: "Active Pursuits", value: "8", color: "text-primary-accent" },
                { label: "Review Required", value: "3", color: "text-red" },
                { label: "Completed", value: "12", color: "text-green" },
              ].map((m) => (
                <div key={m.label} className="ds-panel p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{m.label}</p>
                  <p className={cn("text-2xl font-display font-bold", m.color)}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="ds-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest">
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Company</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Offer Type</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Contact</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Last Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {[
                      { id: "L-001", company: "Wayne Enterprises", offer: "Proposal Sprint", status: "qualified", name: "Bruce Wayne", time: "2h ago" },
                      { id: "L-002", company: "LexCorp", offer: "Coordination Risk Review", status: "quote", name: "Lex Luthor", time: "5h ago" },
                      { id: "L-003", company: "Stark Industries", offer: "Scope + Spec Starter", status: "lead", name: "Tony Stark", time: "1d ago" },
                    ].map((lead, idx) => (
                      <tr 
                        key={lead.id} 
                        onClick={() => setSelectedLead(lead)}
                        className={cn(
                          "group hover:bg-surface-container-highest/60 cursor-pointer transition-all",
                          idx % 2 === 0 ? "ds-zebra-even" : "ds-zebra-odd"
                        )}
                      >
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-on-surface">{lead.company}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-mono">{lead.id}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-semibold text-on-surface-variant">{lead.offer}</span>
                        </td>
                        <td className="px-8 py-6">
                          <StatusBadge status={lead.status as any} />
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-on-surface">{lead.name}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs text-on-surface-variant/60 font-mono font-bold uppercase">{lead.time}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "business":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2 group">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={tempBusinessName} 
                        onChange={(e) => setTempBusinessName(e.target.value)}
                        className="text-4xl font-display font-bold tracking-tighter bg-surface-container-high border-b-2 border-primary-accent outline-none text-on-surface"
                        autoFocus
                      />
                      <button 
                        onClick={async () => {
                          await api.updateBusinessName(tempBusinessName);
                          setChiefAIState({...chiefAIState, business_name: tempBusinessName});
                          setIsEditingName(false);
                        }}
                        className="btn-primary py-1 px-3 text-[10px]"
                      >Save</button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-4xl font-display font-bold tracking-tighter text-on-surface">
                        {chiefAIState?.business_name || "My Family Business"}
                      </h1>
                      <button 
                        onClick={() => {
                          setTempBusinessName(chiefAIState?.business_name || "My Family Business");
                          setIsEditingName(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-on-surface/5 rounded-lg"
                      >
                        <Edit3 size={16} className="text-on-surface-variant" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-on-surface-variant font-medium">Strategized by My Family Business AI: Unified Growth & Strategy.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    const leadId = prompt("Enter Lead ID to import design data from:");
                    if (leadId) {
                      await api.importWebData(leadId);
                      api.getChiefAIState().then(setChiefAIState);
                      alert("Strategy aligned with Web Design Narrative.");
                    }
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <DownloadCloud size={16} /> Sync Design Data
                </button>
                <div className="px-4 py-2 bg-primary-accent/10 rounded-xl border border-primary-accent/20 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
                  <span className="text-xs font-bold text-primary-accent uppercase tracking-widest font-mono">Pro Plan Active</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="ds-panel p-8 rounded-xl flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center text-green border border-green/10">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Projected Revenue</p>
                  <p className="text-2xl font-display font-bold text-on-surface">{chiefAIState?.revenue_metrics || "$0.00"}</p>
                </div>
              </div>
              <div className="ds-panel p-8 rounded-xl flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-accent/10 flex items-center justify-center text-secondary-accent border border-secondary-accent/10">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Lead Velocity</p>
                  <p className="text-2xl font-display font-bold text-on-surface">{chiefAIState?.lead_velocity || "0.0"} / wk</p>
                </div>
              </div>
              <div className="ds-panel p-8 rounded-xl flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-accent/10 flex items-center justify-center text-primary-accent border border-primary-accent/10">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Strategy Focus</p>
                  <p className="text-2xl font-display font-bold text-on-surface">{chiefAIState?.strategy_status || "Standard"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <div className="ds-panel rounded-3xl overflow-hidden bg-surface-container-low border-outline-variant/40 flex flex-col h-[550px]">
                  <div className="p-6 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-high/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-accent flex items-center justify-center text-on-primary font-bold text-xs uppercase">C</div>
                      <span className="text-sm font-bold text-on-surface uppercase">Chief AI Command Console</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="flex flex-col gap-2 max-w-[80%]">
                      <div className="p-4 bg-primary-accent/5 rounded-2xl rounded-tl-none border border-primary-accent/10 text-sm text-on-surface-variant leading-relaxed">
                        I am analyzing the current business metrics and lead data. All operations are stable. How should I direct our growth strategy?
                      </div>
                    </div>
                    {chiefAIHistory.map((h, i) => (
                      <div key={i} className={cn("flex flex-col gap-2", h.role === "user" ? "items-end" : "items-start")}>
                        <div className={cn(
                          "p-4 text-sm leading-relaxed max-w-[80%]",
                          h.role === "user" 
                            ? "bg-surface-container-highest rounded-2xl rounded-tr-none text-on-surface border border-outline-variant" 
                            : "bg-primary-accent/5 rounded-2xl rounded-tl-none border border-primary-accent/10 text-on-surface-variant"
                        )}>
                          {h.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-surface-container-high/40 border-t border-outline-variant/40">
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const input = (e.target as any).elements.command.value;
                        if (!input) return;
                        setChiefAIHistory(prev => [...prev, { role: "user", text: input }]);
                        (e.target as any).elements.command.value = "";
                        const res = await api.sendChiefAICommand(input);
                        setChiefAIHistory(prev => [...prev, { role: "chief", text: res.response }]);
                        if (res.state) setChiefAIState(res.state);
                      }}
                      className="relative group"
                    >
                      <input 
                        name="command"
                        type="text" 
                        placeholder="Type a command for Chief AI (e.g. 'Show revenue' or 'Next strategic move')" 
                        className="w-full pl-6 pr-16 py-4 bg-surface-container-lowest border-2 border-outline-variant rounded-2xl text-sm focus:border-primary-accent/40 outline-none transition-all font-sans"
                      />
                      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-accent rounded-xl text-on-primary shadow-lg shadow-primary-accent/20 hover:scale-105 transition-transform">
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="ds-panel p-8 rounded-3xl bg-secondary-accent/[0.03]">
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity size={16} className="text-secondary-accent" /> Business Insights
                  </h3>
                  <div className="space-y-6">
                    {chiefAIState?.business_insights?.map((insight: any, i: number) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-secondary-accent uppercase tracking-widest">{insight.title}</p>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                            insight.impact_level === "high" ? "bg-red/10 text-red" : "bg-primary-accent/10 text-primary-accent"
                          )}>{insight.impact_level}</span>
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed">{insight.summary}</p>
                        <button className="w-full btn-primary py-2 text-[10px] bg-secondary-accent border-secondary-accent shadow-secondary-accent/10">
                          {insight.action_item}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ds-panel p-8 rounded-3xl">
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase size={16} className="text-primary-accent" /> Enterprise Scale
                  </h3>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Operating more than one business? Upgrade to <span className="font-bold text-primary-accent">Enterprise</span> or open a second Pro account to manage multiple entities.
                  </p>
                  <button className="mt-4 w-full btn-secondary py-2 text-[10px]">
                    Manage Business Units
                  </button>
                </div>
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
              <p className="text-on-surface-variant font-medium">Tracking and verification of delivered artifacts and payloads.</p>
            </header>
            <div className="ds-panel rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-highest">
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Payload ID</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Vertical</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Provider</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {[
                    { id: "DEL-001", vertical: "Pursuit Engine", status: "confirmed", provider: "Artifact Storage" },
                    { id: "DEL-002", vertical: "Presence Engine", status: "confirmed", provider: "GCS Bucket" },
                    { id: "DEL-003", vertical: "Alignment Engine", status: "sent", provider: "SendGrid" },
                  ].map((d, i) => (
                    <tr key={i} className={cn("hover:bg-surface-container-highest/60 transition-all", i % 2 === 0 ? "ds-zebra-even" : "ds-zebra-odd")}>
                      <td className="px-8 py-6 text-sm font-bold text-on-surface">{d.id}</td>
                      <td className="px-8 py-6 text-xs text-on-surface-variant">{d.vertical}</td>
                      <td className="px-8 py-6"><StatusBadge status="delivered" /></td>
                      <td className="px-8 py-6 text-[10px] font-mono font-bold text-on-surface-variant uppercase">{d.provider}</td>
                      <td className="px-8 py-6"><button className="btn-minimal text-primary-accent py-1">View Receipt</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "family":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Family Hub</h1>
              <p className="text-on-surface-variant font-medium">Coordinated by Dad AI: Schedules, Meals, Budgeting, and Privacy.</p>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-12">
              <div className="ds-panel p-6 rounded-xl border-primary-accent/20">
                <Utensils size={18} className="text-primary-accent mb-3" />
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tonight's Meal</p>
                <p className="text-sm font-bold text-on-surface mt-1">{dadAIState?.meal_plan?.tonight || "TBD"}</p>
              </div>
              <div className="ds-panel p-6 rounded-xl">
                <ShoppingCart size={18} className="text-secondary-accent mb-3" />
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Grocery List</p>
                <p className="text-sm font-bold text-on-surface mt-1">{dadAIState?.grocery_list?.length || 0} Items</p>
              </div>
              <div className="ds-panel p-6 rounded-xl">
                <Wallet size={18} className="text-green mb-3" />
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Dad Fund</p>
                <p className="text-sm font-bold text-green mt-1">{dadAIState?.budget_status || "Healthy"}</p>
              </div>
              <div className="ds-panel p-6 rounded-xl">
                <Navigation size={18} className="text-accent-pink mb-3" />
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Asset Status</p>
                <p className="text-sm font-bold text-on-surface mt-1 truncate">{dadAIState?.last_known_context || "Standby"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <div className="ds-panel rounded-3xl overflow-hidden bg-surface-container-low border-outline-variant/40 flex flex-col h-[550px]">
                  <div className="p-6 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-high/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-accent flex items-center justify-center text-on-primary font-bold text-xs">D</div>
                      <span className="text-sm font-bold text-on-surface">Dad AI Command Console</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="flex flex-col gap-2 max-w-[80%]">
                      <div className="p-4 bg-primary-accent/5 rounded-2xl rounded-tl-none border border-primary-accent/10 text-sm text-on-surface-variant leading-relaxed">
                        Family Hub online. I'm managing the schedule, meal plan, and MamaNAV privacy. Ask me anything.
                      </div>
                    </div>
                    {dadAIHistory.map((h, i) => (
                      <div key={i} className={cn("flex flex-col gap-2", h.role === "user" ? "items-end" : "items-start")}>
                        <div className={cn(
                          "p-4 text-sm leading-relaxed max-w-[80%]",
                          h.role === "user" 
                            ? "bg-surface-container-highest rounded-2xl rounded-tr-none text-on-surface border border-outline-variant" 
                            : "bg-primary-accent/5 rounded-2xl rounded-tl-none border border-primary-accent/10 text-on-surface-variant"
                        )}>
                          {h.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-surface-container-high/40 border-t border-outline-variant/40">
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const input = (e.target as any).elements.command.value;
                        if (!input) return;
                        setDadAIHistory(prev => [...prev, { role: "user", text: input }]);
                        (e.target as any).elements.command.value = "";
                        const res = await api.sendDadAICommand(input);
                        setDadAIHistory(prev => [...prev, { role: "dad", text: res.response }]);
                        if (res.state) setDadAIState(res.state);
                      }}
                      className="relative group"
                    >
                      <input 
                        name="command"
                        type="text" 
                        placeholder="e.g. 'Dad, tell a joke' or 'What's the meal plan?'" 
                        className="w-full pl-6 pr-16 py-4 bg-surface-container-lowest border-2 border-outline-variant rounded-2xl text-sm focus:border-primary-accent/40 outline-none transition-all font-sans"
                      />
                      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-accent rounded-xl text-on-primary shadow-lg shadow-primary-accent/20 hover:scale-105 transition-transform">
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {userRole === "lead" && (
                  <div className="ds-panel p-8 rounded-3xl bg-secondary-accent/[0.03]">
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Target size={16} className="text-secondary-accent" /> Family Insights
                    </h3>
                    <div className="space-y-6">
                      {familyInsights.map((insight, i) => (
                        <div key={i} className="space-y-3">
                          <p className="text-[10px] font-bold text-secondary-accent uppercase tracking-widest">{insight.subject}</p>
                          <p className="text-xs text-on-surface leading-relaxed">{insight.insight}</p>
                          <div className="p-3 bg-surface-container-high rounded-lg border-l-2 border-secondary-accent">
                            <p className="text-[10px] text-on-surface-variant italic">"Dad Says: {insight.dad_advice}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ds-panel p-8 rounded-3xl">
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock size={16} className="text-primary-accent" /> Reminders
                  </h3>
                  <div className="space-y-4">
                    {dadAIState?.reminders?.length > 0 ? dadAIState.reminders.map((r: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-accent mt-1.5" />
                        <p className="text-xs text-on-surface-variant font-medium">{r.text}</p>
                      </div>
                    )) : (
                      <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest text-center py-4 italic">No active reminders</p>
                    )}
                  </div>
                </div>

                <div className="ds-panel p-8 rounded-3xl bg-primary-accent/[0.02]">
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Heart size={16} className="text-accent-pink" /> Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => api.sendDadAICommand("Tell a joke").then(res => setDadAIHistory(p => [...p, {role: 'dad', text: res.response}]))}
                      className="w-full text-left p-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary-accent transition-colors border-b border-outline-variant last:border-0"
                    >
                      Get Dad Joke
                    </button>
                    <button className="w-full text-left p-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary-accent transition-colors border-b border-outline-variant last:border-0">
                      Family Outing Idea
                    </button>
                    <button className="w-full text-left p-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary-accent transition-colors">
                      Sync to MamaNAV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "tenants":
        return (
          <div className="max-w-6xl mx-auto reveal visible">
            <header className="mb-12">
              <h1 className="text-4xl font-display font-bold tracking-tighter mb-3 text-on-surface">Tenants & Hierarchy</h1>
              <p className="text-on-surface-variant font-medium">Manage organizational isolation and family sub-accounts.</p>
            </header>
            <div className="grid grid-cols-2 gap-8">
              {[
                { name: "Acme Corp", id: "acme-corp", users: 124, status: "active", plan: "Pro" },
                { name: "Wayne Ent", id: "wayne-ent", users: 210, status: "active", plan: "Enterprise" },
              ].map((t, i) => (
                <div key={i} className="ds-panel p-8 hover:border-primary-accent/40 transition-all cursor-pointer group rounded-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-on-surface text-surface flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-105 transition-transform">
                      {t.name[0]}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={t.status as any} />
                      <span className="text-[10px] font-bold text-primary-accent uppercase tracking-widest">{t.plan} Plan</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-on-surface">{t.name}</h3>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest mb-6">/tenants/{t.id}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-outline-variant">
                    <span className="text-xs text-on-surface-variant font-medium">{t.users} Sub-Accounts</span>
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

      <LeadDetailPanel 
        lead={selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />
    </div>
  );
}

