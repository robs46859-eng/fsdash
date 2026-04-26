import React, { useEffect, useState } from "react";
import { TrendingUp, Activity, BarChart3, AlertCircle } from "lucide-react";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { ErrorState } from "../../admin/src/components/common/ErrorState";
import { fetchStelaraiVerticalData } from "../api";
import { StatusBadge } from "../../admin/src/components/common/StatusBadge";

interface Trend {
  name: string;
  maturity_level: string;
  impact_score: number;
}

export function PredictiveNicheView() {
  const [trends, setTrends] = useState<Record<string, Trend>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStelaraiVerticalData<{ trends: Record<string, Trend> }>("digital-it-girl", "trends")
      .then(data => setTrends(data.trends))
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
            <div className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface">Predictive Niche Engine</h1>
              <p className="mt-2 text-sm text-on-surface-variant">Audience timing and market signal clustering powered by Digital IT Girl.</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3 mb-10">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Activity size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Signal Strength</span>
            </div>
            <p className="text-3xl font-display font-semibold text-on-surface">Strong</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-2">Scanning 48 clusters</p>
          </div>
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 text-secondary mb-4">
              <BarChart3 size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Market Velocity</span>
            </div>
            <p className="text-3xl font-display font-semibold text-on-surface">+12.4%</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-2">Week-over-week avg</p>
          </div>
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 text-tertiary mb-4">
              <AlertCircle size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Opportunity Score</span>
            </div>
            <p className="text-3xl font-display font-semibold text-on-surface">8.4/10</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-2">Niche: Edge ML</p>
          </div>
        </div>

        <section className="glass-panel overflow-hidden">
          <div className="border-b border-outline-variant/10 bg-surface-container-low px-6 py-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Emerging Tech Trends</h2>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {Object.entries(trends).map(([id, trend]) => (
              <div key={id} className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_150px_150px]">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{trend.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase mt-1">Cluster ID: {id}</p>
                </div>
                <div className="flex items-center">
                  <StatusBadge status={trend.maturity_level === 'emerging' ? 'active' : 'default'} />
                  <span className="ml-2 text-xs text-on-surface-variant capitalize">{trend.maturity_level}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${trend.impact_score * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-on-surface">{(trend.impact_score * 100).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
