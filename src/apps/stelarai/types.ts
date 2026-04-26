export interface StelaraiModule {
  module_key: string;
  module_label: string;
  pathway_summary: string;
  delivery_status: string;
}

export interface ProviderLane {
  lane: "free" | "cheap" | "balanced" | "premium";
  description: string;
  providers: string[];
}

export interface StelaraiBlueprintResponse {
  product: {
    name: string;
    primary_domain: string;
    positioning: string;
  };
  modules: StelaraiModule[];
  provider_lanes: ProviderLane[];
  connected_account_policy: {
    business_and_personal_accounts_supported: boolean;
    tenant_internal_sources_supported: boolean;
    anthropic_open_access: boolean;
    cheap_or_free_model_path_required: boolean;
  };
}

export interface StelaraiWorkspace {
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  status: string;
  target_domain: string | null;
  primary_model_tier: string;
  notes: string | null;
  module_count: number;
  connected_account_count: number;
  connected_source_count: number;
  workflow_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StelaraiWorkspaceIndexResponse {
  workspaces: StelaraiWorkspace[];
  total: number;
}

export interface StelaraiConnectedAccount {
  id: string;
  workspace_id: string;
  provider_key: string;
  account_label: string;
  connection_scope: "business" | "personal" | "shared";
  status: "active" | "disabled" | "error";
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StelaraiConnectedAccountIndexResponse {
  workspace_id: string;
  accounts: StelaraiConnectedAccount[];
  total: number;
}

export interface StelaraiConnectedAccountUpdateRequest {
  account_label?: string;
  status?: "active" | "disabled" | "error";
  metadata?: Record<string, any>;
}

export interface StelaraiConnectedSource {
  id: string;
  workspace_id: string;
  source_kind: string;
  source_label: string;
  sync_mode: "manual" | "scheduled" | "webhook";
  status: "active" | "syncing" | "disabled" | "error";
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StelaraiConnectedSourceIndexResponse {
  workspace_id: string;
  sources: StelaraiConnectedSource[];
  total: number;
}

export interface StelaraiConnectedSourceUpdateRequest {
  source_label?: string;
  status?: "active" | "syncing" | "disabled" | "error";
  metadata?: Record<string, any>;
}

export interface StelaraiWorkflow {
  id: string;
  workspace_id: string;
  module_key: string;
  name: string;
  status: "draft" | "active" | "archived";
  provider_lane: "free" | "cheap" | "balanced" | "premium";
  workflow: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StelaraiWorkflowIndexResponse {
  workspace_id: string;
  workflows: StelaraiWorkflow[];
  total: number;
}

export interface StelaraiWorkflowUpdateRequest {
  name?: string;
  status?: "draft" | "active" | "archived";
  provider_lane?: "free" | "cheap" | "balanced" | "premium";
  workflow?: any;
}

export interface StelaraiWorkflowSimulateRequest {
  provider_lane_override?: "free" | "cheap" | "balanced" | "premium";
  inputs?: Record<string, any>;
}

export interface StelaraiSimulationTrace {
  node_id: string;
  node_label: string;
  status: string;
  provider_lane: string;
  duration_ms: number;
  output_preview: string;
}

export interface StelaraiSimulationResponse {
  workflow_id: string;
  status: string;
  provider_lane: string;
  cost_preview_usd: number;
  trace: StelaraiSimulationTrace[];
  simulated_at: string;
}
