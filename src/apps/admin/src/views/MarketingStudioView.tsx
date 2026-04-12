import React, { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Download,
  FileJson,
  History,
  Megaphone,
  PenSquare,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import {
  createMarketingDraft,
  fetchMarketingDraft,
  fetchMarketingDraftHistory,
  fetchMarketingGeneratorDefinitions,
  saveMarketingDraftVersion,
} from "../marketing/api";
import { exportMarketingDraft } from "../marketing/export";
import { generatorDefinitionMap, marketingGeneratorIds } from "../marketing/generators";
import { buildGeneratorPrompt } from "../marketing/promptOrchestrator";
import {
  ExportActionResult,
  MarketingDraftHistoryItem,
  MarketingGeneratorDefinition,
  MarketingGeneratorId,
  MarketingStudioState,
} from "../marketing/types";
import { cn, ErrorState, LoadingState, StatusBadge } from "../components/common/index";

const generatorTone: Record<MarketingGeneratorId, string> = {
  "ad-copy": "bg-primary/10 text-primary outline outline-1 -outline-offset-1 outline-primary/25",
  "email-campaigns": "bg-indigo-500/15 text-indigo-200 outline outline-1 -outline-offset-1 outline-indigo-400/30",
  "social-posts": "bg-primary-container/15 text-primary outline outline-1 -outline-offset-1 outline-primary-container/30",
  "blog-outlines": "bg-emerald-500/15 text-emerald-200 outline outline-1 -outline-offset-1 outline-emerald-400/30",
  "product-descriptions": "bg-amber-500/15 text-amber-200 outline outline-1 -outline-offset-1 outline-amber-400/30",
  "landing-page-copy": "bg-sky-500/15 text-sky-200 outline outline-1 -outline-offset-1 outline-sky-400/30",
};

function createEmptyGeneratorState() {
  return {
    values: {},
    draft: "",
    versions: [],
    history: [],
  };
}

function createInitialStudioState(): MarketingStudioState {
  return marketingGeneratorIds.reduce<MarketingStudioState>((accumulator, generatorId) => {
    accumulator[generatorId] = createEmptyGeneratorState();
    return accumulator;
  }, {} as MarketingStudioState);
}

function buildVersionLabel(generatorId: MarketingGeneratorId, count: number): string {
  const shortId = generatorId.replace(/-/g, " ");
  return `${shortId} v${count + 1}`;
}

function applyDraftToState(
  current: MarketingStudioState[MarketingGeneratorId],
  draft: MarketingDraftHistoryItem,
): MarketingStudioState[MarketingGeneratorId] {
  return {
    ...current,
    values: draft.values,
    draft: draft.content,
    draftId: draft.id,
    versions: draft.versions ?? [],
    updatedAt: draft.updatedAt,
  };
}

function replaceHistory(
  history: MarketingDraftHistoryItem[],
  draft: MarketingDraftHistoryItem,
): MarketingDraftHistoryItem[] {
  const filtered = history.filter((item) => item.id !== draft.id);
  return [draft, ...filtered].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

function FieldInput({
  definition,
  value,
  onChange,
}: {
  definition: MarketingGeneratorDefinition["fields"][number];
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const className =
    "ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest";

  if (definition.type === "textarea") {
    return (
      <textarea
        className={`${className} min-h-[108px] resize-y`}
        placeholder={definition.placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (definition.type === "select") {
    return (
      <select
        className={className}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {definition.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={className}
      placeholder={definition.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function MarketingStudioView() {
  const [activeGeneratorId, setActiveGeneratorId] = useState<MarketingGeneratorId>("ad-copy");
  const [definitions, setDefinitions] = useState<MarketingGeneratorDefinition[]>([]);
  const [studioState, setStudioState] = useState<MarketingStudioState>(() =>
    createInitialStudioState(),
  );
  const [exportFeedback, setExportFeedback] = useState<string>("");
  const [loadingDefinitions, setLoadingDefinitions] = useState(true);
  const [definitionError, setDefinitionError] = useState<string>("");

  useEffect(() => {
    let active = true;

    fetchMarketingGeneratorDefinitions()
      .then((nextDefinitions) => {
        if (!active) {
          return;
        }
        setDefinitions(nextDefinitions);
        setLoadingDefinitions(false);
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setDefinitionError(
          error instanceof Error ? error.message : "Failed to load generator metadata.",
        );
        setLoadingDefinitions(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeDefinition =
    definitions.find((definition) => definition.id === activeGeneratorId) ??
    generatorDefinitionMap[activeGeneratorId];
  const activeState = studioState[activeGeneratorId];

  const orchestratedPrompt = useMemo(
    () => buildGeneratorPrompt(activeDefinition, activeState.values),
    [activeDefinition, activeState.values],
  );

  const updateGeneratorState = (
    generatorId: MarketingGeneratorId,
    updater: (current: MarketingStudioState[MarketingGeneratorId]) => MarketingStudioState[MarketingGeneratorId],
  ) => {
    setStudioState((current) => ({
      ...current,
      [generatorId]: updater(current[generatorId]),
      }));
  };

  const restoreVersion = (versionId: string) => {
    updateGeneratorState(activeGeneratorId, (current) => {
      const version = current.versions.find((item) => item.id === versionId);
      if (!version) {
        return current;
      }

      return {
        ...current,
        values: version.values,
        draft: version.content,
        updatedAt: new Date().toISOString(),
        message: `Loaded ${version.label}. Save to persist it as a new server version.`,
      };
    });
  };

  useEffect(() => {
    let active = true;
    if (loadingDefinitions || definitionError) {
      return;
    }

    updateGeneratorState(activeGeneratorId, (current) => ({ ...current, loading: true }));

    fetchMarketingDraftHistory(activeGeneratorId)
      .then((history) => {
        if (!active) {
          return;
        }
        updateGeneratorState(activeGeneratorId, (current) => {
          const latest = history[0];
          if (!current.hydrated && latest) {
            return {
              ...applyDraftToState(current, latest),
              history,
              loading: false,
              hydrated: true,
            };
          }

          return {
            ...current,
            history,
            loading: false,
            hydrated: true,
          };
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        updateGeneratorState(activeGeneratorId, (current) => ({
          ...current,
          loading: false,
          hydrated: true,
          message:
            error instanceof Error
              ? error.message
              : "Failed to load server draft history.",
        }));
      });

    return () => {
      active = false;
    };
  }, [activeGeneratorId, loadingDefinitions, definitionError]);

  const resetGenerator = () => {
    updateGeneratorState(activeGeneratorId, (current) => ({
      ...createEmptyGeneratorState(),
      history: current.history,
      hydrated: current.hydrated,
      message: "Local working draft cleared. Server history remains available.",
    }));
  };

  const orchestrateDraft = async () => {
    updateGeneratorState(activeGeneratorId, (current) => ({
      ...current,
      saving: true,
      message: "Submitting generation request to FullStack.",
    }));

    try {
      const draft = await createMarketingDraft({
        generatorId: activeGeneratorId,
        title: activeDefinition.title,
        values: activeState.values,
      });

      updateGeneratorState(activeGeneratorId, (current) => ({
        ...applyDraftToState(current, draft),
        history: replaceHistory(current.history, draft),
        saving: false,
        hydrated: true,
        message: "Draft generated and saved server-side.",
      }));
    } catch (error) {
      updateGeneratorState(activeGeneratorId, (current) => ({
        ...current,
        saving: false,
        message:
          error instanceof Error
            ? error.message
            : "Generation failed.",
      }));
    }
  };

  const saveVersion = async () => {
    updateGeneratorState(activeGeneratorId, (current) => ({
      ...current,
      saving: true,
      message: "Saving a new server version.",
    }));

    try {
      let draft = activeState.draftId
        ? await saveMarketingDraftVersion({
            draftId: activeState.draftId,
            title: activeDefinition.title,
            content: activeState.draft,
            label: buildVersionLabel(activeGeneratorId, activeState.versions.length),
            values: activeState.values,
          })
        : await createMarketingDraft({
            generatorId: activeGeneratorId,
            title: activeDefinition.title,
            values: activeState.values,
          });

      if (!activeState.draftId && activeState.draft && activeState.draft !== draft.content) {
        draft = await saveMarketingDraftVersion({
          draftId: draft.id,
          title: activeDefinition.title,
          content: activeState.draft,
          label: buildVersionLabel(activeGeneratorId, draft.versions?.length ?? 1),
          values: activeState.values,
        });
      }

      updateGeneratorState(activeGeneratorId, (current) => ({
        ...applyDraftToState(current, draft),
        history: replaceHistory(current.history, draft),
        saving: false,
        hydrated: true,
        message: "Server version saved.",
      }));
    } catch (error) {
      updateGeneratorState(activeGeneratorId, (current) => ({
        ...current,
        saving: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to save the server version.",
      }));
    }
  };

  const loadDraftFromHistory = async (draftId: string) => {
    updateGeneratorState(activeGeneratorId, (current) => ({
      ...current,
      loading: true,
      message: "Loading draft history from FullStack.",
    }));

    try {
      const draft = await fetchMarketingDraft(draftId);
      updateGeneratorState(activeGeneratorId, (current) => ({
        ...applyDraftToState(current, draft),
        history: replaceHistory(current.history, draft),
        loading: false,
        hydrated: true,
        message: "Server draft loaded.",
      }));
    } catch (error) {
      updateGeneratorState(activeGeneratorId, (current) => ({
        ...current,
        loading: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load the selected draft.",
      }));
    }
  };

  const runExport = async (type: ExportActionResult["type"]) => {
    const result = await exportMarketingDraft(type, activeDefinition, activeState);
    setExportFeedback(result.message);
    window.setTimeout(() => setExportFeedback(""), 2500);
  };

  if (loadingDefinitions) {
    return (
      <div className="flex-1 overflow-y-auto p-10">
        <div className="mx-auto max-w-7xl">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (definitionError) {
    return (
      <div className="flex-1 overflow-y-auto p-10">
        <div className="mx-auto max-w-5xl">
          <ErrorState error={definitionError} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
              <Megaphone size={22} strokeWidth={1.6} />
            </div>
            <span className="bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
              Marketing Studio
            </span>
          </div>
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">Marketing Studio</h1>
          <p className="max-w-4xl font-medium text-on-surface-variant">
            Six standalone content generators with isolated schemas, prompt orchestration, draft state, version history, and
            export actions. Nothing here is treated as CRM data or account history unless an operator explicitly publishes
            or attaches it later.
          </p>
        </header>

        <div className="mb-8 grid gap-4 xl:grid-cols-[300px_1fr]">
          <div className="glass-panel p-5">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Generators</p>
            <div className="space-y-2">
              {definitions.map((generator) => (
                <button
                  key={generator.id}
                  type="button"
                  onClick={() => setActiveGeneratorId(generator.id)}
                  className={cn(
                    "w-full border px-4 py-4 text-left transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)] outline outline-1 -outline-offset-1",
                    activeGeneratorId === generator.id
                      ? "border-primary/40 bg-surface-container-highest outline-primary/30"
                      : "border-outline-variant/10 bg-surface-container-low hover:border-outline-variant/25 hover:bg-surface-container-high",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-on-surface">{generator.title}</span>
                    <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]", generatorTone[generator.id])}>
                      Studio
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-on-surface-variant">{generator.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold uppercase tracking-tight text-on-surface">{activeDefinition.title}</p>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{activeDefinition.summary}</p>
                  </div>
                  <StatusBadge
                    status={
                      activeState.saving
                        ? "loading"
                        : activeState.draftId
                          ? "active"
                          : "configured"
                    }
                  />
                </div>

              <div className="space-y-5">
                {activeDefinition.fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {field.label}
                      {field.required ? " *" : ""}
                    </label>
                    <FieldInput
                      definition={field}
                      value={activeState.values[field.key] ?? ""}
                      onChange={(nextValue) =>
                        updateGeneratorState(activeGeneratorId, (current) => ({
                          ...current,
                          values: {
                            ...current.values,
                            [field.key]: nextValue,
                          },
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                    {field.helperText && <p className="mt-2 text-xs text-on-surface-variant">{field.helperText}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                  onClick={orchestrateDraft}
                  disabled={activeState.saving}
                >
                  <Sparkles size={14} />
                  Generate Draft
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                  onClick={saveVersion}
                  disabled={!activeState.draft || activeState.saving}
                >
                  <PenSquare size={14} />
                  Save Version
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                  onClick={resetGenerator}
                  disabled={activeState.saving}
                >
                  <RefreshCcw size={14} />
                  Reset
                </button>
              </div>
              {activeState.message && <p className="mt-4 text-xs font-medium text-on-surface-variant">{activeState.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="glass-panel p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Prompt orchestration</p>
                  <span className="bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15">
                    generator-specific
                  </span>
                </div>
                <pre className="overflow-x-auto border border-outline-variant/15 bg-surface-container-low p-4 text-xs leading-6 text-on-surface-variant whitespace-pre-wrap">
                  {orchestratedPrompt}
                </pre>
              </div>

              <div className="glass-panel p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Draft workspace</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
                      onClick={() => void runExport("copy")}
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                    <button
                      type="button"
                      className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
                      onClick={() => void runExport("download-text")}
                    >
                      <Download size={12} />
                      Text
                    </button>
                    <button
                      type="button"
                      className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
                      onClick={() => void runExport("download-json")}
                    >
                      <FileJson size={12} />
                      JSON
                    </button>
                  </div>
                </div>
                <textarea
                  className="ds-input min-h-[260px] w-full resize-y py-4 text-sm leading-7 text-on-surface"
                  placeholder={`Compose or refine the ${activeDefinition.outputLabel.toLowerCase()} here.`}
                  value={activeState.draft}
                  onChange={(event) =>
                    updateGeneratorState(activeGeneratorId, (current) => ({
                      ...current,
                      draft: event.target.value,
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-on-surface-variant">
                    Drafts are generated, versioned, and read back from FullStack without creating CRM or pipeline records.
                  </p>
                  {exportFeedback && <p className="text-xs font-medium text-primary">{exportFeedback}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Version history</p>
            {activeState.loading ? (
              <LoadingState />
            ) : activeState.versions.length === 0 ? (
              <div className="border border-dashed border-outline-variant/40 bg-surface-container-low px-5 py-8 text-sm leading-7 text-on-surface-variant">
                No server versions yet for the selected draft. Generate a draft or save a revision to start version history.
              </div>
            ) : (
              <div className="space-y-3">
                {activeState.versions.map((version) => (
                  <div key={version.id} className="border border-outline-variant/15 bg-surface-container-low px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{version.label}</p>
                        <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
                        onClick={() => restoreVersion(version.id)}
                      >
                        Restore
                      </button>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
                      {version.content || "Empty draft snapshot"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Saved drafts</p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                <History size={12} />
                Server history
              </span>
            </div>
            {activeState.history.length === 0 ? (
              <div className="border border-dashed border-outline-variant/40 bg-surface-container-low px-5 py-8 text-sm leading-7 text-on-surface-variant">
                No server drafts yet for this generator.
              </div>
            ) : (
              <div className="space-y-3">
                {activeState.history.map((draft) => (
                  <div key={draft.id} className="border border-outline-variant/15 bg-surface-container-low px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{draft.title}</p>
                        <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
                          {new Date(draft.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
                        onClick={() => loadDraftFromHistory(draft.id)}
                      >
                        Load
                      </button>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
                      {draft.content || "Empty draft snapshot"}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Future-ready modules</p>
              <div className="space-y-3">
                {activeDefinition.futureModules.map((module) => (
                  <div
                    key={module}
                    className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant"
                  >
                    {module}
                  </div>
                ))}
              </div>
              <div className="mt-6 border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-7 text-on-surface-variant">
                Marketing Studio is intentionally separate from CRM creation and pipeline generation. Generated content is
                treated as standalone draft material until an explicit publish or attach action is implemented later.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
