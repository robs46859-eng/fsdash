import React, { useState, useEffect } from "react";
import { Filter, MoreHorizontal, XCircle, CheckCircle2, Settings, Send, FlaskConical } from "lucide-react";
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
const panelTransition = { duration: 0.2, ease: [0, 0, 0.2, 1] as const };

const SlidePanel = ({
  item,
  onClose,
  onAction,
}: {
  item: ReviewItem | null;
  onClose: () => void;
  onAction: () => void;
}) => {
  const [activeTab, setActiveTab] = useState("preview");

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={panelTransition}
        className="ds-float-shadow fixed right-0 top-0 z-50 flex h-screen w-[550px] flex-col border-l border-outline-variant/15 bg-surface-container-highest"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/15 p-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-semibold uppercase tracking-tight text-on-surface">{item.workflowName}</h2>
              {item.metadata.dryRunFlag && (
                <div className="flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-200 outline outline-1 -outline-offset-1 outline-amber-500/20">
                  <FlaskConical size={10} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-tighter">Dry Run</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs uppercase tracking-widest text-primary">
              {item.stage} • {item.id}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2.5 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low">
            <XCircle size={22} />
          </button>
        </div>

        <div className="flex border-b border-outline-variant/15 px-8">
          {["preview", "trace", "metadata", "history"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 px-5 py-4 text-xs font-bold uppercase tracking-widest transition-colors duration-150",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface",
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Subject</label>
                <p className="mt-2 text-base font-semibold text-on-surface">{item.subject}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Message Body</label>
                <div className="mt-3 whitespace-pre-wrap border border-outline-variant/15 bg-surface-container-low p-6 text-sm leading-relaxed text-on-surface-variant">
                  {item.messageBody}
                </div>
              </div>
            </div>
          )}

          {activeTab === "trace" && <DecisionTracePanel trace={item.decisionTrace} />}

          {activeTab === "metadata" && (
            <div className="space-y-8 text-on-surface">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Tenant</label>
                  <p className="mt-1 text-sm font-semibold">{item.tenant}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Actor</label>
                  <p className="mt-1 text-sm font-semibold">{item.actor}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Priority</label>
                  <div className="mt-2">
                    <span
                      className={cn(
                        "border-l-[3px] px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
                        item.metadata.priority === "high"
                          ? "border-l-rose-400 bg-rose-500/10 text-rose-200"
                          : "border-l-outline-variant bg-surface-container-low text-on-surface-variant",
                      )}
                    >
                      {item.metadata.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Context</label>
                  <p className="mt-1 text-sm font-semibold">{item.metadata.workflowContext}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && <DeliveryHistoryPanel item={item} />}
        </div>

        <div className="border-t border-outline-variant/15 bg-surface-container-low p-8">
          <div className="flex flex-col gap-4">
            {item.status === "pending" && (
              <ApproveRejectControls onApprove={onAction} onReject={() => {}} onNeedsFix={() => {}} />
            )}

            {item.status === "approved" && (
              <ExecuteControl
                onExecute={async () => {
                  await api.execute(item.id);
                  onAction();
                }}
              />
            )}

            {item.status === "executed" && (
              <DryRunDeliverControl
                onDeliver={async () => {
                  await api.deliver(item.id, true);
                  onAction();
                }}
              />
            )}

            {item.status === "delivered" && (
              <div className="flex items-center gap-4 border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center bg-emerald-500/15">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-200">Successfully Delivered</p>
                  <p className="text-[11px] font-medium text-emerald-300/90">
                    Provider: SendGrid • {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
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
        const updated = data.find((i) => i.id === selectedItem.id);
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
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">Review Queue</h1>
          <p className="font-medium text-on-surface-variant">Manage and govern outbound execution workflows.</p>
        </header>

        <WorkflowMetricStrip items={queue} />

        <ApprovedExecutionList items={queue} onSelect={setSelectedItem} />

        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low p-5">
            <div className="flex items-center gap-6">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors duration-150 hover:bg-surface-container-high"
              >
                <Filter size={16} /> Filter
              </button>
              <div className="h-5 w-px bg-outline-variant/30" />
              <div className="flex gap-2">
                {["All", "Pending", "Approved", "Executed"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={cn(
                      "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-150",
                      f === "All"
                        ? "bg-primary-container text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="p-2.5 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high"
              >
                <MoreHorizontal size={20} />
              </button>

              <AnimatePresence>
                {isMoreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={panelTransition}
                      className="ds-float-shadow absolute right-0 top-full z-50 mt-2 w-48 border border-outline-variant/15 bg-surface-container-highest p-2 outline outline-1 -outline-offset-1 outline-outline-variant/15"
                    >
                      {[
                        { label: "Export Queue", icon: Send },
                        { label: "Batch Approve", icon: CheckCircle2 },
                        { label: "Queue Settings", icon: Settings },
                      ].map((menuItem) => (
                        <button
                          key={menuItem.label}
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high hover:text-on-surface"
                        >
                          <menuItem.icon size={14} />
                          {menuItem.label}
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

      <SlidePanel item={selectedItem} onClose={() => setSelectedItem(null)} onAction={fetchData} />
    </div>
  );
};
