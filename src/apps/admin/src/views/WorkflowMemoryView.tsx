import React, { useState, useEffect } from "react";
import { Filter, MoreHorizontal, LayoutDashboard, XCircle, CheckCircle2, Settings, Send, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReviewItem } from "../../../../types";
import { api } from "../api";
import { cn } from "../components/common/StatusBadge";
import { WorkflowMetricStrip } from "../components/metrics/WorkflowMetricStrip";
import { ReviewQueueTable } from "../components/queue/ReviewQueueTable";
import { ApprovedExecutionList } from "../components/queue/ApprovedExecutionList";
import { DecisionTracePanel } from "../components/panels/DecisionTracePanel";
import { DeliveryHistoryPanel } from "../components/panels/DeliveryHistoryPanel";
import { ApproveRejectControls } from "../components/actions/ApproveRejectControls";
import { ExecuteControl } from "../components/actions/ExecuteControl";
import { DryRunDeliverControl } from "../components/actions/DryRunDeliverControl";
import { LoadingState } from "../components/common/LoadingState";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

// I'll define the SlidePanel here or as a separate component if requested, 
// but the user didn't explicitly list it in the tree, though it's part of the flow.
// I'll include it in WorkflowMemoryView for now.

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
        className="fixed right-0 top-0 h-screen w-[550px] bg-white shadow-[0_0_100px_rgba(0,0,0,0.1)] z-50 flex flex-col border-l border-slate-200"
      >
        <div className="p-8 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-display font-semibold tracking-tight text-midnight">{item.workflowName}</h2>
              {item.metadata.dryRunFlag && (
                <div className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full flex items-center gap-1 border border-amber-500/20">
                  <FlaskConical size={10} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-tighter">Dry Run</span>
                </div>
              )}
            </div>
            <p className="text-xs text-pastel-pink uppercase tracking-widest mt-1">{item.stage} • {item.id}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all">
            <XCircle size={22} className="text-slate-300" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 px-8">
          {["preview", "trace", "metadata", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === tab ? "border-pastel-purple text-pastel-purple" : "border-transparent text-slate-400 hover:text-slate-600"
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
                <label className="text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Subject</label>
                <p className="mt-2 text-base font-semibold text-midnight">{item.subject}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Message Body</label>
                <div className="mt-3 p-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap text-slate-600 shadow-sm">
                  {item.messageBody}
                </div>
              </div>
            </div>
          )}

          {activeTab === "trace" && <DecisionTracePanel trace={item.decisionTrace} />}

          {activeTab === "metadata" && (
            <div className="space-y-8 text-midnight">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Tenant</label>
                  <p className="mt-1 text-sm font-semibold">{item.tenant}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Actor</label>
                  <p className="mt-1 text-sm font-semibold">{item.actor}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Priority</label>
                  <div className="mt-2">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                      item.metadata.priority === "high" ? "bg-rose-500/10 text-rose-600" : "bg-slate-50 text-slate-400"
                    )}>
                      {item.metadata.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Context</label>
                  <p className="mt-1 text-sm font-semibold">{item.metadata.workflowContext}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && <DeliveryHistoryPanel item={item} />}
        </div>

        <div className="p-8 border-t border-slate-200 bg-slate-50/50">
          <div className="flex flex-col gap-4">
            {item.status === "pending" && (
              <ApproveRejectControls 
                onApprove={onAction} 
                onReject={() => {}} 
                onNeedsFix={() => {}} 
              />
            )}

            {item.status === "approved" && (
              <ExecuteControl onExecute={async () => {
                await api.execute(item.id);
                onAction();
              }} />
            )}

            {item.status === "executed" && (
              <DryRunDeliverControl onDeliver={async () => {
                await api.deliver(item.id, true);
                onAction();
              }} />
            )}

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

            <p className="text-[10px] text-center text-slate-400 uppercase tracking-[0.2em] font-bold mt-2">
              System Governance Protocol Active
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const WorkflowMemoryView = () => {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl font-display font-semibold tracking-tighter mb-3 text-midnight">Review Queue</h1>
          <p className="text-pastel-purple font-medium">Manage and govern outbound execution workflows.</p>
        </header>

        <WorkflowMetricStrip items={queue} />

        <ApprovedExecutionList items={queue} onSelect={setSelectedItem} />

        <div className="glass-panel overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 flex items-center justify-between bg-white/20">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-pink-400 hover:bg-pink-50 rounded-xl transition-all">
                <Filter size={16} /> Filter
              </button>
              <div className="h-5 w-[1px] bg-pink-100" />
              <div className="flex gap-3">
                {["All", "Pending", "Approved", "Executed"].map(f => (
                  <button key={f} className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all", f === "All" ? "bg-pink-600 text-white shadow-lg shadow-pink-600/10" : "text-pink-300 hover:bg-pink-50")}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="p-2.5 text-pink-300 hover:bg-pink-50 rounded-xl transition-all"
              >
                <MoreHorizontal size={20} />
              </button>
              
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl p-2 z-50 shadow-2xl"
                    >
                      {[
                        { label: "Export Queue", icon: Send },
                        { label: "Batch Approve", icon: CheckCircle2 },
                        { label: "Queue Settings", icon: Settings },
                      ].map((item) => (
                        <button
                          key={item.label}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-pink-500 hover:bg-pink-50 transition-all"
                        >
                          <item.icon size={14} />
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <ReviewQueueTable items={queue} onRowClick={setSelectedItem} loading={loading} />
        </div>
      </div>

      <SlidePanel 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onAction={fetchData}
      />
    </div>
  );
};
