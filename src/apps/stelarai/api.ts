import { buildEndpoint } from "../../lib/platform";
import {
  getOperatorAuthHeaders,
  getOperatorRequestCredentials,
} from "../../lib/operatorAuth";
import type {
  StelaraiBlueprintResponse,
  StelaraiWorkspaceIndexResponse,
} from "./types";

async function stelaraiRequest<T>(path: string): Promise<T> {
  const endpoint = buildEndpoint(path);
  if (!endpoint) {
    throw new Error(`No endpoint configured for ${path}.`);
  }
  const response = await fetch(endpoint, {
    credentials: getOperatorRequestCredentials(),
    headers: {
      Accept: "application/json",
      ...getOperatorAuthHeaders(),
    },
  });
  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message =
      (data as { error?: { message?: string } } | undefined)?.error?.message ??
      `Request failed with HTTP ${response.status}.`;
    throw new Error(message);
  }
  return data as T;
}

export function fetchStelaraiBlueprint() {
  return stelaraiRequest<StelaraiBlueprintResponse>("/api/v1/stelarai/blueprint");
}

export function fetchStelaraiWorkspaces() {
  return stelaraiRequest<StelaraiWorkspaceIndexResponse>("/api/v1/stelarai/workspaces");
}
