import React, { useState, useEffect } from "react";
import { Send, Filter, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Delivery } from "../../../../types";
import { api } from "../api";
import { StatusBadge, cn } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";

export const DeliveriesView = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const data = await api.getDeliveries();
        setDeliveries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">Deliveries</h1>
          <p className="font-medium text-on-surface-variant">Tracking and verification of delivered payloads.</p>
        </header>

        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low p-5">
            <div className="flex items-center gap-6">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors duration-150 hover:bg-surface-container-high"
              >
                <Filter size={16} /> Filter
              </button>
            </div>
            <button
              type="button"
              className="p-2.5 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Delivery ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Provider</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Type</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <LoadingState />
                    </td>
                  </tr>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState message="No Deliveries Recorded" icon={Send} />
                      <p className="pb-12 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Governance logs are empty. No payloads have been dispatched.
                      </p>
                    </td>
                  </tr>
                ) : (
                  deliveries.map((delivery) => (
                    <tr key={delivery.id} className="group transition-colors duration-150 hover:bg-surface-container-low/60">
                      <td className="px-8 py-6">
                        <p className="font-mono text-sm font-bold text-on-surface">{delivery.id}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-primary">Item: {delivery.itemId}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          <span className="text-sm font-semibold text-on-surface">{delivery.provider}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={cn(
                            "border px-2 py-1 text-[10px] font-bold uppercase tracking-widest outline outline-1 -outline-offset-1",
                            delivery.dryRun
                              ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-200 outline-indigo-500/20"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 outline-emerald-500/20",
                          )}
                        >
                          {delivery.dryRun ? "Dry Run" : "Live"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={delivery.status} />
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-primary">{new Date(delivery.timestamp).toLocaleString()}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
