export type MarketingGeneratorId =
  | "ad-copy"
  | "email-campaigns"
  | "social-posts"
  | "blog-outlines"
  | "product-descriptions"
  | "landing-page-copy";

export type MarketingFieldType = "text" | "textarea" | "select" | "tags";

export interface MarketingField {
  key: string;
  label: string;
  type: MarketingFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  helperText?: string;
}

export interface GeneratorPromptBlock {
  title: string;
  lines: string[];
}

export interface MarketingGeneratorDefinition {
  id: MarketingGeneratorId;
  title: string;
  shortLabel: string;
  summary: string;
  outputLabel: string;
  fields: MarketingField[];
  futureModules: string[];
  buildPromptBlocks: (values: Record<string, string>) => GeneratorPromptBlock[];
}

export interface MarketingDraftVersion {
  id: string;
  createdAt: string;
  label: string;
  content: string;
  values: Record<string, string>;
  versionNumber?: number;
  createdBy?: string;
}

export interface MarketingDraftHistoryItem {
  id: string;
  title: string;
  generatorId: MarketingGeneratorId;
  values: Record<string, string>;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  versions?: MarketingDraftVersion[];
}

export interface MarketingEconomicsHeadline {
  totalCostUsd: number;
  costPerDraftUsd: number | null;
  costPerApprovedAssetUsd: number | null;
  costPerChannelPackageUsd: number | null;
}

export interface MarketingEconomicsSummary {
  period: {
    days: number;
    since: string;
  };
  model: {
    type: string;
    providerBacked: boolean;
    notes: string;
  };
  headline: MarketingEconomicsHeadline;
  totals: {
    activityCount: number;
    draftCount: number;
    acceptedAssetCount: number;
    approvedAssetCount: number;
    channelPackageTotal: number;
    providerCalls: number;
    retries: number;
    promptTokens: number;
    outputTokens: number;
    averageLatencyMs: number;
  };
  tables: {
    byGenerator: Array<{
      generatorId: MarketingGeneratorId;
      activityCount: number;
      drafts: number;
      acceptedAssets: number;
      channelPackages: number;
      totalCostUsd: number;
      promptTokens: number;
      outputTokens: number;
      averageLatencyMs: number;
    }>;
    byTenant: Array<{
      tenantId: string | null;
      activityCount: number;
      drafts: number;
      acceptedAssets: number;
      channelPackages: number;
      totalCostUsd: number;
    }>;
    byTemplateCategory: Array<{
      templateCategory: string;
      activityCount: number;
      drafts: number;
      approvedAssets: number;
      totalCostUsd: number;
    }>;
    recentActivity: Array<{
      id: string;
      draftId?: string | null;
      tenantId?: string | null;
      generatorId: MarketingGeneratorId;
      eventType: string;
      actorEmail: string;
      providerCalls: number;
      retries: number;
      promptSizeChars: number;
      outputSizeChars: number;
      promptTokens: number;
      outputTokens: number;
      latencyMs: number;
      exportAction?: string | null;
      acceptedAsset: boolean;
      channelPackageCount: number;
      providerName?: string | null;
      modelName?: string | null;
      cacheStatus?: string | null;
      templateCategory?: string | null;
      costUsd: number;
      createdAt: string;
    }>;
  };
}

export interface MarketingGeneratorState {
  values: Record<string, string>;
  draft: string;
  versions: MarketingDraftVersion[];
  draftId?: string;
  history: MarketingDraftHistoryItem[];
  updatedAt?: string;
  loading?: boolean;
  saving?: boolean;
  message?: string;
  hydrated?: boolean;
}

export type MarketingStudioState = Record<MarketingGeneratorId, MarketingGeneratorState>;

export interface ExportActionResult {
  type: "copy" | "download-json" | "download-text";
  message: string;
}
