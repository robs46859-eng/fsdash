import { runtimeConfig } from "./runtime";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "./operatorAuth";

export type EndpointState =
  | "loading"
  | "ready"
  | "empty"
  | "unsupported"
  | "unauthorized"
  | "error";

export interface EndpointResult<T = unknown> {
  state: EndpointState;
  endpoint?: string;
  statusCode?: number;
  message: string;
  data?: T;
}

export interface HealthProbe {
  label: string;
  endpoint?: string;
  state: "live" | "degraded" | "missing" | "error";
  statusCode?: number;
  message: string;
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function buildEndpoint(pathOrUrl?: string, baseUrl?: string): string | undefined {
  if (!pathOrUrl) {
    return undefined;
  }

  if (isAbsoluteUrl(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedBase = (baseUrl ?? runtimeConfig.apiBaseUrl).trim();
  if (!normalizedBase) {
    return pathOrUrl;
  }

  const left = normalizedBase.endsWith("/") ? normalizedBase.slice(0, -1) : normalizedBase;
  const right = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${left}${right}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  if (!text.trim()) {
    return undefined;
  }
  return text;
}

export async function fetchEndpointData<T = unknown>(
  pathOrUrl?: string,
): Promise<EndpointResult<T>> {
  const endpoint = buildEndpoint(pathOrUrl);
  if (!endpoint) {
    return {
      state: "unsupported",
      message: "No backend route is mapped for this surface in the current fs-ai repo.",
    };
  }

  try {
    const response = await fetch(endpoint, {
      credentials: getOperatorRequestCredentials(),
      headers: {
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
        ...getOperatorAuthHeaders(),
      },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        state: "unauthorized",
        endpoint,
        statusCode: response.status,
        message: "The platform rejected this request. A valid operator session is required.",
      };
    }

    if (!response.ok) {
      return {
        state: "error",
        endpoint,
        statusCode: response.status,
        message: `The platform returned HTTP ${response.status}.`,
      };
    }

    const data = (await parseResponseBody(response)) as T | undefined;
    if (data == null) {
      return {
        state: "empty",
        endpoint,
        statusCode: response.status,
        message: "The endpoint responded successfully but returned no body.",
      };
    }

    if (Array.isArray(data) && data.length === 0) {
      return {
        state: "empty",
        endpoint,
        statusCode: response.status,
        message: "The endpoint responded successfully but returned an empty collection.",
        data,
      };
    }

    return {
      state: "ready",
      endpoint,
      statusCode: response.status,
      message: "Live platform data is available for this surface.",
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    return {
      state: "error",
      endpoint,
      message,
    };
  }
}

export async function probeHealthEndpoint(
  label: string,
  pathOrUrl?: string,
  baseUrl?: string,
): Promise<HealthProbe> {
  const endpoint = buildEndpoint(pathOrUrl, baseUrl);
  if (!endpoint) {
    return {
      label,
      state: "missing",
      message: "No endpoint is configured for this probe.",
    };
  }

  try {
    const response = await fetch(endpoint, {
      credentials: getOperatorRequestCredentials(),
      headers: {
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
        ...getOperatorAuthHeaders(),
      },
    });
    const state = response.ok ? "live" : "degraded";
    return {
      label,
      endpoint,
      state,
      statusCode: response.status,
      message: response.ok
        ? "Endpoint responded successfully."
        : `Endpoint responded with HTTP ${response.status}.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    return {
      label,
      endpoint,
      state: "error",
      message,
    };
  }
}
