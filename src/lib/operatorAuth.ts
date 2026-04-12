const OPERATOR_BEARER_TOKEN_KEY = "fullstack.operatorBearerToken";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getOperatorBearerToken(): string | undefined {
  if (!canUseStorage()) {
    return undefined;
  }
  const token = window.localStorage.getItem(OPERATOR_BEARER_TOKEN_KEY)?.trim();
  return token ? token : undefined;
}

export function setOperatorBearerToken(token: string): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(OPERATOR_BEARER_TOKEN_KEY, token);
}

export function clearOperatorBearerToken(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(OPERATOR_BEARER_TOKEN_KEY);
}

export function getOperatorAuthHeaders(): Record<string, string> {
  const token = getOperatorBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getOperatorRequestCredentials(): RequestCredentials {
  return getOperatorBearerToken() ? "omit" : "include";
}
