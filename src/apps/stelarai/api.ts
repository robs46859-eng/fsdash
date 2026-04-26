import { buildEndpoint } from "../../lib/platform";
import {
  getOperatorAuthHeaders,
  getOperatorRequestCredentials,
} from "../../lib/operatorAuth";
import type {
  StelaraiBlueprintResponse,
  StelaraiConnectedAccount,
  StelaraiConnectedAccountIndexResponse,
  StelaraiConnectedAccountUpdateRequest,
  StelaraiConnectedSource,
  StelaraiConnectedSourceIndexResponse,
  StelaraiConnectedSourceUpdateRequest,
  StelaraiSimulationResponse,
  StelaraiWorkflow,
  StelaraiWorkflowIndexResponse,
  StelaraiWorkflowSimulateRequest,
  StelaraiWorkflowUpdateRequest,
  StelaraiWorkspaceIndexResponse,
} from "./types";

async function stelaraiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const endpoint = buildEndpoint(path);
  if (!endpoint) {
    throw new Error(`No endpoint configured for ${path}.`);
  }
  const response = await fetch(endpoint, {
    credentials: getOperatorRequestCredentials(),
    ...options,
    headers: {
      Accept: "application/json",
      ...getOperatorAuthHeaders(),
      ...(options.headers || {}),
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

async function stelaraiMutate<T>(method: "POST" | "PATCH" | "DELETE", path: string, body?: any): Promise<T> {
  return stelaraiRequest<T>(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function fetchStelaraiBlueprint() {
  return stelaraiRequest<StelaraiBlueprintResponse>("/api/v1/stelarai/blueprint");
}

export function fetchStelaraiWorkspaces() {
  return stelaraiRequest<StelaraiWorkspaceIndexResponse>("/api/v1/stelarai/workspaces");
}

export function fetchStelaraiWorkspaceAccounts(workspaceId: string) {
  return stelaraiRequest<StelaraiConnectedAccountIndexResponse>(`/api/v1/stelarai/workspaces/${workspaceId}/accounts`);
}

export function createStelaraiWorkspaceAccount(workspaceId: string, payload: any) {
  return stelaraiMutate<StelaraiConnectedAccount>("POST", `/api/v1/stelarai/workspaces/${workspaceId}/accounts`, payload);
}

export function updateStelaraiAccount(accountId: string, payload: StelaraiConnectedAccountUpdateRequest) {
  return stelaraiMutate<StelaraiConnectedAccount>("PATCH", `/api/v1/stelarai/accounts/${accountId}`, payload);
}

export function deleteStelaraiAccount(accountId: string) {
  return stelaraiMutate<void>("DELETE", `/api/v1/stelarai/accounts/${accountId}`);
}

export function fetchStelaraiWorkspaceSources(workspaceId: string) {
  return stelaraiRequest<StelaraiConnectedSourceIndexResponse>(`/api/v1/stelarai/workspaces/${workspaceId}/sources`);
}

export function createStelaraiWorkspaceSource(workspaceId: string, payload: any) {
  return stelaraiMutate<StelaraiConnectedSource>("POST", `/api/v1/stelarai/workspaces/${workspaceId}/sources`, payload);
}

export function updateStelaraiSource(sourceId: string, payload: StelaraiConnectedSourceUpdateRequest) {
  return stelaraiMutate<StelaraiConnectedSource>("PATCH", `/api/v1/stelarai/sources/${sourceId}`, payload);
}

export function deleteStelaraiSource(sourceId: string) {
  return stelaraiMutate<void>("DELETE", `/api/v1/stelarai/sources/${sourceId}`);
}

export function syncStelaraiSource(sourceId: string) {
  return stelaraiMutate<StelaraiConnectedSource>("POST", `/api/v1/stelarai/sources/${sourceId}/sync`);
}

export function fetchStelaraiWorkflow(workflowId: string) {
  return stelaraiRequest<StelaraiWorkflow>(`/api/v1/stelarai/workflows/${workflowId}`);
}

export function fetchStelaraiWorkspaceWorkflows(workspaceId: string) {
  return stelaraiRequest<StelaraiWorkflowIndexResponse>(`/api/v1/stelarai/workspaces/${workspaceId}/workflows`);
}

export function updateStelaraiWorkflow(workflowId: string, payload: StelaraiWorkflowUpdateRequest) {
  return stelaraiMutate<StelaraiWorkflow>("PATCH", `/api/v1/stelarai/workflows/${workflowId}`, payload);
}

export function duplicateStelaraiWorkflow(workflowId: string) {
  return stelaraiMutate<StelaraiWorkflow>("POST", `/api/v1/stelarai/workflows/${workflowId}/duplicate`);
}

export function simulateStelaraiWorkflow(workflowId: string, payload: StelaraiWorkflowSimulateRequest = {}) {
  return stelaraiMutate<StelaraiSimulationResponse>("POST", `/api/v1/stelarai/workflows/${workflowId}/simulate`, payload);
}

export function fetchStelaraiVerticalData<T>(verticalId: string, path: string) {
  return stelaraiRequest<T>(`/api/v1/stelarai/verticals/${verticalId}/${path}`);
}
