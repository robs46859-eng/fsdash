import React, { useEffect, useState } from "react";
import { Cpu, Box, ToggleLeft, ToggleRight, Layers } from "lucide-react";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { ErrorState } from "../../admin/src/components/common/ErrorState";
import { fetchStelaraiVerticalData } from "../api";
import { StatusBadge } from "../../admin/src/components/common/StatusBadge";

interface Preview {
  name: string;
  enabled: boolean;
}

export function SoftwareTrackerView() {
  const [previews, setPreviews] = useState<Record<string, Preview>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStelaraiVerticalData<{ previews: Record<string, Preview> }>("public-beta", "features/previews")
      .then(data => setPreviews(data.previews))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-surface">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-secondary/10 text-secondary">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface">Software Tracker & Intelligence</h1>
              <p className="mt-2 text-sm text-on-surface-variant">Real-time market movement and release signal monitoring via Public Beta.</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          {Object.entries(previews).map(([id, feature]) => (
            <div key={id} className="glass-panel p-6 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                  <Box size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{feature.name}</h3>
                  <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">Feature ID: {id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  {feature.enabled ? "Live" : "In Queue"}
                </span>
                <button className="text-on-surface-variant hover:text-secondary transition-colors">
                  {feature.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <section className="glass-panel p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <Layers size={16} /> Market Watchlist
            </h3>
            <div className="space-y-4">
              {["Stripe Terminal 3.4", "AWS Lambda Node 22", "Vercel ISR v2"].map(item => (
                <div key={item} className="flex items-center justify-between p-3 bg-surface-container-low rounded border border-outline-variant/10">
                  <span className="text-xs font-medium text-on-surface">{item}</span>
                  <StatusBadge status="active" />
                </div>
              ))}
            </div>
          </section>
          
          <section className="glass-panel p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
              <Cpu size={16} /> Beta Readiness
            </h3>
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-4xl font-display font-bold text-on-surface">92%</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-2 text-center">Across 12 monitored repos</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
