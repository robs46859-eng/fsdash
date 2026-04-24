export type AuthMode = "none" | "external";

export interface RuntimeConfig {
  brandLabel: string;
  publicBaseUrl: string;
  appBaseUrl: string;
  apiBaseUrl: string;
  authMode: AuthMode;
  trustUpstreamAuth: boolean;
  sessionProbePath?: string;
  loginUrl?: string;
  signupUrl?: string;
  demoRequestUrl?: string;
  operatorAccessUrl?: string;
  deploymentDocsUrl?: string;
  api: {
    healthPath?: string;
    readinessPath?: string;
    tenantsPath?: string;
    apiKeysPath?: string;
    usageBillingPath?: string;
    providersRoutingPath?: string;
    cachePerformancePath?: string;
    requestsLogsTracesPath?: string;
    securityPolicyPath?: string;
    settingsPath?: string;
  };
  arkham: {
    label: string;
    enabled: boolean;
    baseUrl?: string;
    healthPath?: string;
  };
}

function normalizeOptional(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeUrlPath(value: string | undefined, fallback: string): string {
  return normalizeOptional(value) ?? fallback;
}

const authModeEnv = normalizeOptional(import.meta.env.VITE_FULLSTACK_AUTH_MODE);
const authMode: AuthMode =
  authModeEnv === "external" || authModeEnv === "none" ? authModeEnv : "none";

export const runtimeConfig: RuntimeConfig = {
  brandLabel: "FullStack",
  publicBaseUrl:
    normalizeOptional(import.meta.env.VITE_FULLSTACK_PUBLIC_BASE_URL) ??
    "https://fsai.pro",
  appBaseUrl: normalizeUrlPath(import.meta.env.VITE_FULLSTACK_APP_BASE_PATH, "/app"),
  apiBaseUrl: normalizeOptional(import.meta.env.VITE_FULLSTACK_API_BASE_URL) ?? "",
  authMode,
  trustUpstreamAuth: import.meta.env.VITE_FULLSTACK_TRUST_UPSTREAM_AUTH === "true",
  sessionProbePath: normalizeOptional(import.meta.env.VITE_FULLSTACK_SESSION_PROBE_PATH),
  loginUrl: normalizeOptional(import.meta.env.VITE_FULLSTACK_LOGIN_URL),
  signupUrl: normalizeOptional(import.meta.env.VITE_FULLSTACK_SIGNUP_URL),
  demoRequestUrl: normalizeOptional(import.meta.env.VITE_FULLSTACK_DEMO_REQUEST_URL),
  operatorAccessUrl: normalizeOptional(import.meta.env.VITE_FULLSTACK_OPERATOR_ACCESS_URL),
  deploymentDocsUrl: normalizeOptional(import.meta.env.VITE_FULLSTACK_DEPLOYMENT_DOCS_URL),
  api: {
    healthPath: normalizeOptional(import.meta.env.VITE_FULLSTACK_HEALTH_PATH) ?? "/health",
    readinessPath:
      normalizeOptional(import.meta.env.VITE_FULLSTACK_READINESS_PATH) ?? "/ready",
    tenantsPath: normalizeOptional(import.meta.env.VITE_FULLSTACK_TENANTS_PATH),
    apiKeysPath: normalizeOptional(import.meta.env.VITE_FULLSTACK_API_KEYS_PATH),
    usageBillingPath: normalizeOptional(import.meta.env.VITE_FULLSTACK_USAGE_BILLING_PATH),
    providersRoutingPath: normalizeOptional(
      import.meta.env.VITE_FULLSTACK_PROVIDERS_ROUTING_PATH,
    ),
    cachePerformancePath: normalizeOptional(
      import.meta.env.VITE_FULLSTACK_CACHE_PERFORMANCE_PATH,
    ),
    requestsLogsTracesPath: normalizeOptional(
      import.meta.env.VITE_FULLSTACK_REQUESTS_LOGS_TRACES_PATH,
    ),
    securityPolicyPath: normalizeOptional(import.meta.env.VITE_FULLSTACK_SECURITY_POLICY_PATH),
    settingsPath: normalizeOptional(import.meta.env.VITE_FULLSTACK_SETTINGS_PATH),
  },
  arkham: {
    label: "Arkham",
    enabled: import.meta.env.VITE_ARKHAM_SIDECAR_ENABLED !== "false",
    baseUrl: normalizeOptional(import.meta.env.VITE_ARKHAM_SIDECAR_BASE_URL),
    healthPath:
      normalizeOptional(import.meta.env.VITE_ARKHAM_SIDECAR_HEALTH_PATH) ?? "/health",
  },
};
