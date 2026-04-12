import { buildEndpoint } from "../../../../lib/platform";
import {
  getOperatorAuthHeaders,
  getOperatorRequestCredentials,
} from "../../../../lib/operatorAuth";
import {
  MarketingDraftHistoryItem,
  MarketingDraftVersion,
  MarketingEconomicsSummary,
  MarketingGeneratorDefinition,
  MarketingGeneratorId,
} from "./types";
import { mergeRemoteGeneratorDefinitions } from "./generators";

interface RemoteGeneratorDefinition {
  id: MarketingGeneratorId;
  title: string;
  summary: string;
  output_label: string;
  future_modules: string[];
  fields: MarketingGeneratorDefinition["fields"];
}

interface RemoteTemplateSummary {
  generator_id: MarketingGeneratorId;
  title: string;
  summary: string;
  future_modules: string[];
}

interface RemoteDraftVersion {
  id: string;
  version_number?: number;
  label: string;
  values: Record<string, string>;
  content: string;
  created_by?: string;
  created_at: string;
}

interface RemoteDraft {
  id: string;
  title: string;
  generator_id: MarketingGeneratorId;
  values: Record<string, string>;
  content: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  versions?: RemoteDraftVersion[];
}

interface RemoteMarketingEconomics {
  period: {
    days: number;
    since: string;
  };
  model: {
    type: string;
    provider_backed: boolean;
    notes: string;
  };
  headline: {
    total_cost_usd: number;
    cost_per_draft_usd: number | null;
    cost_per_approved_asset_usd: number | null;
    cost_per_channel_package_usd: number | null;
  };
  totals: {
    activity_count: number;
    draft_count: number;
    accepted_asset_count: number;
    approved_asset_count: number;
    channel_package_total: number;
    provider_calls: number;
    retries: number;
    prompt_tokens: number;
    output_tokens: number;
    average_latency_ms: number;
  };
  tables: {
    by_generator: Array<{
      generator_id: MarketingGeneratorId;
      activity_count: number;
      drafts: number;
      accepted_assets: number;
      channel_packages: number;
      total_cost_usd: number;
      prompt_tokens: number;
      output_tokens: number;
      average_latency_ms: number;
    }>;
    by_tenant: Array<{
      tenant_id: string | null;
      activity_count: number;
      drafts: number;
      accepted_assets: number;
      channel_packages: number;
      total_cost_usd: number;
    }>;
    by_template_category: Array<{
      template_category: string;
      activity_count: number;
      drafts: number;
      approved_assets: number;
      total_cost_usd: number;
    }>;
    recent_activity: Array<{
      id: string;
      draft_id?: string | null;
      tenant_id?: string | null;
      generator_id: MarketingGeneratorId;
      event_type: string;
      actor_email: string;
      provider_calls: number;
      retries: number;
      prompt_size_chars: number;
      output_size_chars: number;
      prompt_tokens: number;
      output_tokens: number;
      latency_ms: number;
      export_action?: string | null;
      accepted_asset: boolean;
      channel_package_count: number;
      provider_name?: string | null;
      model_name?: string | null;
      cache_status?: string | null;
      template_category?: string | null;
      cost_usd: number;
      created_at: string;
    }>;
  };
}

interface ApiErrorShape {
  error?: {
    code?: string;
    message?: string;
  };
}

const MARKETING_BASE_PATH = "/api/v1/marketing";

function mapVersion(version: RemoteDraftVersion): MarketingDraftVersion {
  return {
    id: version.id,
    versionNumber: version.version_number,
    label: version.label,
    values: version.values ?? {},
    content: version.content ?? "",
    createdBy: version.created_by,
    createdAt: version.created_at,
  };
}

function mapDraft(draft: RemoteDraft): MarketingDraftHistoryItem {
  return {
    id: draft.id,
    title: draft.title,
    generatorId: draft.generator_id,
    values: draft.values ?? {},
    content: draft.content ?? "",
    createdBy: draft.created_by,
    createdAt: draft.created_at,
    updatedAt: draft.updated_at,
    versions: draft.versions?.map(mapVersion),
  };
}

async function requestMarketing<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const endpoint = buildEndpoint(path);
  if (!endpoint) {
    throw new Error("The Marketing Studio endpoint is not configured.");
  }

  const response = await fetch(endpoint, {
    credentials: getOperatorRequestCredentials(),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getOperatorAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => undefined)) as T | ApiErrorShape | undefined;
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? payload.error?.message
        : `The platform returned HTTP ${response.status}.`;
    throw new Error(message || `The platform returned HTTP ${response.status}.`);
  }

  return payload as T;
}

export async function fetchMarketingGeneratorDefinitions(): Promise<
  MarketingGeneratorDefinition[]
> {
  const [generatorsResponse, templatesResponse] = await Promise.all([
    requestMarketing<{ generators: RemoteGeneratorDefinition[] }>(
      `${MARKETING_BASE_PATH}/generators`,
    ),
    requestMarketing<{ templates: RemoteTemplateSummary[] }>(
      `${MARKETING_BASE_PATH}/templates`,
    ),
  ]);

  const templateMap = Object.fromEntries(
    templatesResponse.templates.map((template) => [template.generator_id, template]),
  ) as Record<MarketingGeneratorId, RemoteTemplateSummary | undefined>;

  return mergeRemoteGeneratorDefinitions(
    generatorsResponse.generators.map((generator) => ({
      id: generator.id,
      title: templateMap[generator.id]?.title ?? generator.title,
      summary: templateMap[generator.id]?.summary ?? generator.summary,
      outputLabel: generator.output_label,
      futureModules: templateMap[generator.id]?.future_modules ?? generator.future_modules,
      fields: generator.fields,
    })),
  );
}

export async function fetchMarketingDraftHistory(
  generatorId: MarketingGeneratorId,
): Promise<MarketingDraftHistoryItem[]> {
  const response = await requestMarketing<{ drafts: RemoteDraft[] }>(
    `${MARKETING_BASE_PATH}/drafts?generator_id=${generatorId}`,
  );
  return response.drafts.map(mapDraft);
}

export async function fetchMarketingDraft(
  draftId: string,
): Promise<MarketingDraftHistoryItem> {
  const response = await requestMarketing<RemoteDraft>(
    `${MARKETING_BASE_PATH}/drafts/${draftId}`,
  );
  return mapDraft(response);
}

export async function createMarketingDraft(input: {
  generatorId: MarketingGeneratorId;
  title: string;
  values: Record<string, string>;
}): Promise<MarketingDraftHistoryItem> {
  const response = await requestMarketing<{ draft: RemoteDraft }>(
    `${MARKETING_BASE_PATH}/generate`,
    {
      method: "POST",
      body: JSON.stringify({
        generator_id: input.generatorId,
        title: input.title,
        values: input.values,
      }),
    },
  );
  return mapDraft(response.draft);
}

export async function saveMarketingDraftVersion(input: {
  draftId: string;
  title: string;
  content: string;
  label: string;
  values: Record<string, string>;
}): Promise<MarketingDraftHistoryItem> {
  const response = await requestMarketing<RemoteDraft>(
    `${MARKETING_BASE_PATH}/drafts/${input.draftId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        title: input.title,
        content: input.content,
        label: input.label,
        values: input.values,
      }),
    },
  );
  return mapDraft(response);
}

export async function logMarketingExportAction(input: {
  draftId: string;
  action: "copy" | "download-json" | "download-text";
}): Promise<void> {
  await requestMarketing(`${MARKETING_BASE_PATH}/drafts/${input.draftId}/export`, {
    method: "POST",
    body: JSON.stringify({ action: input.action }),
  });
}

export async function fetchMarketingEconomics(
  days = 30,
): Promise<MarketingEconomicsSummary> {
  const response = await requestMarketing<RemoteMarketingEconomics>(
    `${MARKETING_BASE_PATH}/economics?days=${days}`,
  );

  return {
    period: response.period,
    model: {
      type: response.model.type,
      providerBacked: response.model.provider_backed,
      notes: response.model.notes,
    },
    headline: {
      totalCostUsd: response.headline.total_cost_usd,
      costPerDraftUsd: response.headline.cost_per_draft_usd,
      costPerApprovedAssetUsd: response.headline.cost_per_approved_asset_usd,
      costPerChannelPackageUsd: response.headline.cost_per_channel_package_usd,
    },
    totals: {
      activityCount: response.totals.activity_count,
      draftCount: response.totals.draft_count,
      acceptedAssetCount: response.totals.accepted_asset_count,
      approvedAssetCount: response.totals.approved_asset_count,
      channelPackageTotal: response.totals.channel_package_total,
      providerCalls: response.totals.provider_calls,
      retries: response.totals.retries,
      promptTokens: response.totals.prompt_tokens,
      outputTokens: response.totals.output_tokens,
      averageLatencyMs: response.totals.average_latency_ms,
    },
    tables: {
      byGenerator: response.tables.by_generator.map((row) => ({
        generatorId: row.generator_id,
        activityCount: row.activity_count,
        drafts: row.drafts,
        acceptedAssets: row.accepted_assets,
        channelPackages: row.channel_packages,
        totalCostUsd: row.total_cost_usd,
        promptTokens: row.prompt_tokens,
        outputTokens: row.output_tokens,
        averageLatencyMs: row.average_latency_ms,
      })),
      byTenant: response.tables.by_tenant.map((row) => ({
        tenantId: row.tenant_id,
        activityCount: row.activity_count,
        drafts: row.drafts,
        acceptedAssets: row.accepted_assets,
        channelPackages: row.channel_packages,
        totalCostUsd: row.total_cost_usd,
      })),
      byTemplateCategory: response.tables.by_template_category.map((row) => ({
        templateCategory: row.template_category,
        activityCount: row.activity_count,
        drafts: row.drafts,
        approvedAssets: row.approved_assets,
        totalCostUsd: row.total_cost_usd,
      })),
      recentActivity: response.tables.recent_activity.map((row) => ({
        id: row.id,
        draftId: row.draft_id,
        tenantId: row.tenant_id,
        generatorId: row.generator_id,
        eventType: row.event_type,
        actorEmail: row.actor_email,
        providerCalls: row.provider_calls,
        retries: row.retries,
        promptSizeChars: row.prompt_size_chars,
        outputSizeChars: row.output_size_chars,
        promptTokens: row.prompt_tokens,
        outputTokens: row.output_tokens,
        latencyMs: row.latency_ms,
        exportAction: row.export_action,
        acceptedAsset: row.accepted_asset,
        channelPackageCount: row.channel_package_count,
        providerName: row.provider_name,
        modelName: row.model_name,
        cacheStatus: row.cache_status,
        templateCategory: row.template_category,
        costUsd: row.cost_usd,
        createdAt: row.created_at,
      })),
    },
  };
}
