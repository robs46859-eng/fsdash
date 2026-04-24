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
