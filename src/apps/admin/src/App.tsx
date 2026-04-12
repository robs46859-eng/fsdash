import React, { useEffect, useState } from "react";
import { AdminShell } from "./components/layout/AdminShell";
import { SidebarNav } from "./components/layout/SidebarNav";
import { TopBar } from "./components/layout/TopBar";
import { LandingPage } from "./views/LandingPage";
import { AccessView } from "./views/AccessView";
import { MarketingStudioView } from "./views/MarketingStudioView";
import { MarketingEconomicsView } from "./views/MarketingEconomicsView";
import { OverviewView } from "./views/OverviewView";
import { ResourceSurfaceView } from "./views/ResourceSurfaceView";
import { SystemHealthView } from "./views/SystemHealthView";
import { SettingsView } from "./views/SettingsView";
import {
  Activity,
  Gauge,
  KeyRound,
  Megaphone,
  ReceiptText,
  Route,
  ScrollText,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { runtimeConfig } from "../../../lib/runtime";
import { buildEndpoint, fetchEndpointData } from "../../../lib/platform";
import {
  clearOperatorBearerToken,
  setOperatorBearerToken,
} from "../../../lib/operatorAuth";
import {
  AppSectionId,
  surfaceDefinitionMap,
  surfaceDefinitions,
} from "./data/surfaces";

type RouteState =
  | { kind: "landing" }
  | { kind: "access" }
  | { kind: "app"; section: AppSectionId };

type SessionState =
  | { state: "loading"; message: string }
  | { state: "authenticated"; message: string; actorEmail?: string; authSource?: string }
  | { state: "unauthenticated"; message: string }
  | { state: "unknown"; message: string }
  | { state: "error"; message: string };

const sectionIcons = {
  overview: Activity,
  "marketing-studio": Megaphone,
  "marketing-economics": ReceiptText,
  tenants: Users,
  "api-keys": KeyRound,
  "usage-billing": Wallet,
  "providers-routing": Route,
  "cache-performance": Gauge,
  "requests-logs-traces": ScrollText,
  "security-policy-pii": Shield,
  "system-health": Activity,
  settings: Activity,
} as const;

function parseRoute(pathname: string): RouteState {
  if (pathname === "/access") {
    return { kind: "access" };
  }

  if (pathname.startsWith("/app")) {
    const segment = pathname.split("/")[2] as AppSectionId | undefined;
    if (segment && segment in surfaceDefinitionMap) {
      return { kind: "app", section: segment };
    }
    return { kind: "app", section: "overview" };
  }

  return { kind: "landing" };
}

function navigate(path: string) {
  if (window.location.pathname === path) {
    return;
  }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => parseRoute(window.location.pathname));
  const [sessionRefreshIndex, setSessionRefreshIndex] = useState(0);
  const [session, setSession] = useState<SessionState>({
    state: "loading",
    message: "Checking operator session posture.",
  });

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const sectionTitle =
      route.kind === "app"
        ? surfaceDefinitionMap[route.section].title
        : route.kind === "access"
          ? "Access"
          : "FullStack";

    document.title = `${sectionTitle} • FullStack`;
  }, [route]);

  useEffect(() => {
    let active = true;

    if (runtimeConfig.authMode === "none") {
      setSession({
        state: "authenticated",
        message: "External auth is disabled for this runtime. The operator shell is open.",
      });
      return;
    }

    if (runtimeConfig.trustUpstreamAuth && !runtimeConfig.sessionProbePath) {
      setSession({
        state: "authenticated",
        message:
          "Upstream auth is trusted for this deployment. The frontend is not probing a separate session endpoint.",
      });
      return;
    }

    if (!runtimeConfig.sessionProbePath) {
      setSession({
        state: "unknown",
        message:
          "External auth is enabled, but no session probe path is configured. Protect /app upstream or supply VITE_FULLSTACK_SESSION_PROBE_PATH.",
      });
      return;
    }

    setSession({
      state: "loading",
      message: "Checking operator session posture.",
    });

    fetchEndpointData(runtimeConfig.sessionProbePath).then((result) => {
      if (!active) {
        return;
      }

      if (result.state === "ready" || result.state === "empty") {
        const payload = (result.data ?? {}) as {
          actor_email?: string;
          source?: string;
        };
        setSession({
          state: "authenticated",
          message: "An operator session is available.",
          actorEmail: payload.actor_email,
          authSource: payload.source,
        });
        return;
      }

      if (result.state === "unauthorized") {
        setSession({
          state: "unauthenticated",
          message: result.message,
        });
        return;
      }

      setSession({
        state: result.state === "error" ? "error" : "unknown",
        message: result.message,
      });
    });

    return () => {
      active = false;
    };
  }, [sessionRefreshIndex]);

  async function handleBootstrapLogin(email: string, password: string) {
    const endpoint = buildEndpoint("/api/v1/session/bootstrap");
    if (!endpoint) {
      throw new Error("The bootstrap auth endpoint is not configured.");
    }
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json().catch(() => undefined)) as
      | { bearer_token?: string; error?: { message?: string } }
      | undefined;
    if (!response.ok) {
      throw new Error(payload?.error?.message || `Bootstrap failed with HTTP ${response.status}.`);
    }
    if (!payload?.bearer_token) {
      throw new Error("Bootstrap succeeded but no bearer token was returned.");
    }
    setOperatorBearerToken(payload.bearer_token);
    setSessionRefreshIndex((current) => current + 1);
  }

  async function handleClearOperatorSession() {
    clearOperatorBearerToken();
    setSession({
      state: "unauthenticated",
      message: "Operator bearer token cleared from this browser.",
    });
    setSessionRefreshIndex((current) => current + 1);
  }

  if (route.kind === "landing") {
    return (
      <LandingPage
        runtime={runtimeConfig}
        onOpenAccess={() => navigate("/access")}
        onOpenApp={() => navigate("/app/overview")}
      />
    );
  }

  if (route.kind === "access") {
    return (
      <AccessView
        runtime={runtimeConfig}
        sessionState={session.state}
        sessionMessage={session.message}
        actorEmail={session.state === "authenticated" ? session.actorEmail : undefined}
        authSource={session.state === "authenticated" ? session.authSource : undefined}
        onBootstrapLogin={handleBootstrapLogin}
        onClearOperatorSession={handleClearOperatorSession}
        onOpenApp={() => navigate("/app/overview")}
      />
    );
  }

  const canAccessApp = session.state === "authenticated";
  if (!canAccessApp) {
    return (
      <AccessView
        runtime={runtimeConfig}
        sessionState={session.state}
        sessionMessage={session.message}
        actorEmail={session.state === "authenticated" ? session.actorEmail : undefined}
        authSource={session.state === "authenticated" ? session.authSource : undefined}
        onBootstrapLogin={handleBootstrapLogin}
        onClearOperatorSession={handleClearOperatorSession}
        onOpenApp={() => navigate("/app/overview")}
      />
    );
  }

  const currentSurface = surfaceDefinitionMap[route.section];
  const sessionLabel =
    runtimeConfig.authMode === "none"
      ? "local operator shell"
      : session.state === "authenticated"
        ? "authenticated session"
        : "access required";

  let content: React.ReactNode;

  switch (route.section) {
    case "overview":
      content = <OverviewView runtime={runtimeConfig} surfaces={surfaceDefinitions} />;
      break;
    case "marketing-studio":
      content = <MarketingStudioView />;
      break;
    case "marketing-economics":
      content = <MarketingEconomicsView />;
      break;
    case "tenants":
      content = (
        <ResourceSurfaceView
          icon={sectionIcons["tenants"]}
          runtime={runtimeConfig}
          surface={currentSurface}
        />
      );
      break;
    case "api-keys":
      content = (
        <ResourceSurfaceView
          icon={sectionIcons["api-keys"]}
          runtime={runtimeConfig}
          surface={currentSurface}
        />
      );
      break;
    case "usage-billing":
      content = (
        <ResourceSurfaceView
          icon={sectionIcons["usage-billing"]}
          runtime={runtimeConfig}
          surface={currentSurface}
        />
      );
      break;
    case "providers-routing":
      content = (
        <ResourceSurfaceView
          icon={sectionIcons["providers-routing"]}
          runtime={runtimeConfig}
          surface={currentSurface}
        />
      );
      break;
    case "cache-performance":
      content = (
        <ResourceSurfaceView
          icon={sectionIcons["cache-performance"]}
          runtime={runtimeConfig}
          surface={currentSurface}
        />
      );
      break;
    case "requests-logs-traces":
      content = (
        <ResourceSurfaceView
          icon={sectionIcons["requests-logs-traces"]}
          runtime={runtimeConfig}
          surface={currentSurface}
        />
      );
      break;
    case "security-policy-pii":
      content = (
        <ResourceSurfaceView
          icon={sectionIcons["security-policy-pii"]}
          runtime={runtimeConfig}
          surface={currentSurface}
        />
      );
      break;
    case "system-health":
      content = <SystemHealthView runtime={runtimeConfig} />;
      break;
    case "settings":
      content = <SettingsView runtime={runtimeConfig} />;
      break;
    default:
      content = <OverviewView runtime={runtimeConfig} surfaces={surfaceDefinitions} />;
  }

  return (
    <AdminShell>
      <SidebarNav
        activeTab={route.section}
        items={surfaceDefinitions}
        onNavigate={navigate}
      />
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden bg-surface">
        <TopBar runtime={runtimeConfig} surface={currentSurface} sessionLabel={sessionLabel} />
        <div className="flex-1 overflow-y-auto bg-surface">{content}</div>
      </main>
    </AdminShell>
  );
}
