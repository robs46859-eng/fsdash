import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Coins, Package, ReceiptText } from "lucide-react";
import { fetchMarketingEconomics } from "../marketing/api";
import { MarketingEconomicsSummary } from "../marketing/types";
import { ErrorState, LoadingState, StatusBadge } from "../components/common";

function formatUsd(value: number | null) {
  if (value == null) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(value);
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}) {
  return (
    <div className="glass-panel p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
        <Icon size={20} strokeWidth={1.7} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{title}</p>
      <p className="mt-2 break-words font-display text-2xl font-semibold tracking-tight text-on-surface">{value}</p>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{detail}</p>
    </div>
  );
}

function SimpleTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="overflow-x-auto border border-outline-variant/15 bg-surface-container-high">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-surface-container-low">
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/15">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-surface-container-low/80">
              {row.map((cell, cellIndex) => (
                <td key={`${index}-${cellIndex}`} className="px-4 py-3 text-sm text-on-surface-variant">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarketingEconomicsView() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<MarketingEconomicsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchMarketingEconomics(days)
      .then((response) => {
        if (!active) {
          return;
        }
        setData(response);
        setLoading(false);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }
        setError(
          nextError instanceof Error ? nextError.message : "Failed to load Marketing Economics.",
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [days]);

  const recentRows = useMemo(
    () =>
      data?.tables.recentActivity.map((item) => [
        item.generatorId,
        item.templateCategory ?? "—",
        item.providerName ?? "—",
        item.modelName ?? "—",
        item.cacheStatus ?? "—",
        item.eventType,
        item.exportAction ?? "—",
        item.promptTokens,
        item.outputTokens,
        `${item.latencyMs} ms`,
        formatUsd(item.costUsd),
        new Date(item.createdAt).toLocaleString(),
      ]) ?? [],
    [data],
  );

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-10">
        <div className="mx-auto max-w-7xl">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 overflow-y-auto p-10">
        <div className="mx-auto max-w-5xl">
          <ErrorState error={error || "Marketing economics is unavailable."} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                <ReceiptText size={22} strokeWidth={1.6} />
              </div>
              <StatusBadge status="active" />
            </div>
            <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
              Marketing Economics
            </h1>
            <p className="max-w-4xl font-medium text-on-surface-variant">
              Unit economics for Marketing Studio based on persisted generation, accepted-asset, and export events. These
              costs come from FullStack’s internal operational cost model, not direct provider billing.
            </p>
          </div>

          <div className="border border-outline-variant/15 bg-surface-container-high px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Window</p>
            <select
              className="ds-input mt-1 bg-surface-container-highest font-semibold text-on-surface"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Cost Per Draft"
            value={formatUsd(data.headline.costPerDraftUsd)}
            detail={`${data.totals.draftCount} generated drafts in the selected window.`}
            icon={Coins}
          />
          <MetricCard
            title="Cost Per Approved Asset"
            value={formatUsd(data.headline.costPerApprovedAssetUsd)}
            detail={`${data.totals.approvedAssetCount ?? data.totals.acceptedAssetCount} approved assets saved as server versions.`}
            icon={Package}
          />
          <MetricCard
            title="Cost Per Channel Package"
            value={formatUsd(data.headline.costPerChannelPackageUsd)}
            detail={`${data.totals.channelPackageTotal} channel packages inferred from generator distribution inputs.`}
            icon={BarChart3}
          />
          <MetricCard
            title="Total Marketing Cost"
            value={formatUsd(data.headline.totalCostUsd)}
            detail={data.model.notes}
            icon={ReceiptText}
          />
        </div>

        <div className="mb-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Usage Totals</p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Activity events", data.totals.activityCount],
                ["Provider calls", data.totals.providerCalls],
                ["Retries", data.totals.retries],
                ["Prompt tokens", data.totals.promptTokens],
                ["Output tokens", data.totals.outputTokens],
                ["Avg latency", `${data.totals.averageLatencyMs} ms`],
              ].map(([label, value]) => (
                <div key={label} className="border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Model Boundary</p>
            <div className="space-y-3">
              <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant">
                Type: {data.model.type}
              </div>
              <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant">
                Provider backed: {data.model.providerBacked ? "Yes" : "No"}
              </div>
              <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant">
                {data.model.notes}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 xl:grid-cols-2">
          <div className="glass-panel p-6">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Usage By Generator</p>
            <SimpleTable
              columns={["Generator", "Drafts", "Accepted", "Packages", "Cost", "Latency"]}
              rows={data.tables.byGenerator.map((row) => [
                row.generatorId,
                row.drafts,
                row.acceptedAssets,
                row.channelPackages,
                formatUsd(row.totalCostUsd),
                `${row.averageLatencyMs} ms`,
              ])}
            />
          </div>

          <div className="glass-panel p-6">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Cost By Template Category</p>
            <SimpleTable
              columns={["Category", "Activity", "Drafts", "Approved", "Cost"]}
              rows={data.tables.byTemplateCategory.map((row) => [
                row.templateCategory,
                row.activityCount,
                row.drafts,
                row.approvedAssets,
                formatUsd(row.totalCostUsd),
              ])}
            />
          </div>
        </div>

        <div className="glass-panel mb-8 p-6">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Usage By Tenant</p>
          <SimpleTable
            columns={["Tenant", "Activity", "Drafts", "Approved", "Packages", "Cost"]}
            rows={data.tables.byTenant.map((row) => [
              row.tenantId ?? "unassigned",
              row.activityCount,
              row.drafts,
              row.acceptedAssets,
              row.channelPackages,
              formatUsd(row.totalCostUsd),
            ])}
          />
        </div>

        <div className="glass-panel p-6">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Recent Marketing Activity</p>
          <SimpleTable
            columns={[
              "Generator",
              "Category",
              "Provider",
              "Model",
              "Cache",
              "Event",
              "Export",
              "Prompt tokens",
              "Output tokens",
              "Latency",
              "Cost",
              "Created",
            ]}
            rows={recentRows}
          />
        </div>
      </div>
    </div>
  );
}
