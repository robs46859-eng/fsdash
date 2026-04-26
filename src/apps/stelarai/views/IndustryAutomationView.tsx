import React, { useEffect, useState } from "react";
import { Zap, FileText, Send, Clock, BadgeDollarSign } from "lucide-react";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { ErrorState } from "../../admin/src/components/common/ErrorState";
import { fetchStelaraiVerticalData } from "../api";
import { StatusBadge } from "../../admin/src/components/common/StatusBadge";

export function IndustryAutomationView() {
  const [data, setData] = useState<{ proposals: string[], count: number }>({ proposals: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStelaraiVerticalData<{ proposals: string[], count: number }>("autopitch", "proposals")
      .then(resp => setData(resp))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-surface">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-tertiary/10 text-tertiary">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface">Industry Automation (AutoPitch)</h1>
              <p className="mt-2 text-sm text-on-surface-variant">Automated architectural proposal generation and fee scheduling.</p>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <FileText size={18} /> New Proposal
          </button>
        </header>

        <div className="grid gap-6">
          {data.proposals.length === 0 ? (
            <div className="glass-panel p-20 text-center flex flex-col items-center justify-center opacity-50">
              <FileText size={48} strokeWidth={1} className="mb-4 text-on-surface-variant" />
              <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">No proposals generated yet.</p>
            </div>
          ) : (
            data.proposals.map(id => (
              <div key={id} className="glass-panel p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-tertiary/10 group-hover:text-tertiary transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Architectural Proposal: {id.split('_')[1]}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">ID: {id}</p>
                      <div className="w-1 h-1 rounded-full bg-outline-variant/30" />
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> 2 days ago
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="flex items-center gap-2 mr-6 text-on-surface-variant">
                    <BadgeDollarSign size={14} />
                    <span className="text-xs font-bold">$12,400.00</span>
                  </div>
                  <button className="px-4 py-2 rounded bg-surface-container-high text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface">
                    View Draft
                  </button>
                  <button className="btn-primary p-2">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 p-6 bg-surface-container-low border border-outline-variant/10 rounded-xl flex items-start gap-4">
          <Zap size={20} className="text-tertiary shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-1">Architecture Vertical Active</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              AutoPitch is currently using the Arkham Architectural Intelligence engine to frame scopes, schedule fees, and generate client-ready PDFs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
