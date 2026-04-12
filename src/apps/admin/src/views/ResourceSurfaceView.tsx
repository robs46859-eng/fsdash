import React, { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { EndpointResult, fetchEndpointData } from "../../../../lib/platform";
import { RuntimeConfig } from "../../../../lib/runtime";
import { StatusBadge } from "../components/common/StatusBadge";
import { SurfaceDefinition } from "../data/surfaces";

interface ResourceSurfaceViewProps {
  icon: LucideIcon;
  runtime: RuntimeConfig;
  surface: SurfaceDefinition;
}

function renderScalar(value: unknown): string {
  if (value == null) {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function DataPreview({ data }: { data: unknown }) {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
          The platform returned an empty collection.
        </div>
      );
    }

    const rows = data.slice(0, 8);
    const columns = Array.from(
      new Set(
        rows.flatMap((row) =>
          row && typeof row === "object" ? Object.keys(row as Record<string, unknown>) : [],
        ),
      ),
    ).slice(0, 6);

    if (columns.length === 0) {
      return (
        <pre className="overflow-x-auto border border-outline-variant/15 bg-surface-container-low p-4 text-xs leading-6 text-on-surface-variant">
          {JSON.stringify(rows, null, 2)}
        </pre>
      );
    }

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
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-sm text-on-surface-variant">
                    {renderScalar(
                      row && typeof row === "object" ? (row as Record<string, unknown>)[column] : row,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data && typeof data === "object") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
          <div key={key} className="border border-outline-variant/15 bg-surface-container-low p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{key}</p>
            <p className="mt-2 break-words text-sm leading-6 text-on-surface">{renderScalar(value)}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
      {renderScalar(data)}
    </div>
  );
}

export function ResourceSurfaceView({
  icon: Icon,
  runtime,
  surface,
}: ResourceSurfaceViewProps) {
  const [result, setResult] = useState<EndpointResult>({
    state: "loading",
    message: "Checking platform support...",
  });

  useEffect(() => {
    let active = true;
    const routePath = surface.routeKey ? runtime.api[surface.routeKey] : undefined;

    fetchEndpointData(routePath).then((response) => {
      if (active) {
        setResult(response);
      }
    });

    return () => {
      active = false;
    };
  }, [runtime, surface]);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
              <Icon size={22} strokeWidth={1.6} />
            </div>
            <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">{surface.title}</h1>
            <p className="max-w-3xl font-medium text-on-surface-variant">{surface.description}</p>
          </div>
          <div className="border border-outline-variant/15 bg-surface-container-high px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Source route</p>
            <p className="mt-1 font-mono text-sm text-on-surface">
              {surface.routeKey ? runtime.api[surface.routeKey] ?? "Not mapped" : "Runtime shell"}
            </p>
          </div>
        </header>

        <div className="mb-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Integration state</p>
              <StatusBadge status={result.state === "ready" ? "active" : result.state} />
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">{result.message}</p>
            {result.endpoint && <p className="mt-4 break-words font-mono text-xs text-primary">{result.endpoint}</p>}
          </div>

          <div className="glass-panel p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Boundaries</p>
            <div className="space-y-3">
              {surface.notes.map((note) => (
                <div
                  key={note}
                  className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Live payload</p>
          {result.state === "loading" ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-40 bg-surface-container-high" />
              <div className="h-24 bg-surface-container-high" />
              <div className="h-24 bg-surface-container-high" />
            </div>
          ) : result.data !== undefined ? (
            <DataPreview data={result.data} />
          ) : (
            <div className="border border-dashed border-outline-variant/40 bg-surface-container-low px-5 py-8 text-sm leading-7 text-on-surface-variant">
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
