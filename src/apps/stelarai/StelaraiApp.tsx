import React, { useEffect, useState } from "react";
import { WorkspaceShell } from "./components/layout/WorkspaceShell";
import { WorkspaceSidebar } from "./components/layout/WorkspaceSidebar";
import { DashboardView } from "./views/DashboardView";
import { CanvasBuilderView } from "./views/CanvasBuilderView";
import { WorkflowLibraryView } from "./views/WorkflowLibraryView";
import { WorkflowSuggestionsView } from "./views/WorkflowSuggestionsView";
import { ConnectedAccountsView } from "./views/ConnectedAccountsView";
import { ConnectedSourcesView } from "./views/ConnectedSourcesView";
import { PredictiveNicheView } from "./views/PredictiveNicheView";
import { SoftwareTrackerView } from "./views/SoftwareTrackerView";
import { IndustryAutomationView } from "./views/IndustryAutomationView";
import { Orbit } from "lucide-react";
import { runtimeConfig } from "../../lib/runtime";
import { fetchEndpointData } from "../../lib/platform";
import { StelaraiSectionId, stelaraiSurfaces, stelaraiSurfaceMap } from "./data/surfaces";

// Simple top bar for the workspace
const WorkspaceTopBar = ({ title, actorEmail }: { title: string, actorEmail?: string }) => (
  <div className="h-16 border-b border-outline-variant/10 flex items-center justify-between px-10 bg-surface-container-low/40 backdrop-blur-md sticky top-0 z-10">
    <div className="flex items-center gap-4">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">{title}</h2>
      <div className="h-4 w-[1px] bg-outline-variant/20" />
      <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Workspace Active</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">{actorEmail}</span>
    </div>
  </div>
);

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6">
      <Orbit size={32} />
    </div>
    <h2 className="text-xl font-display font-bold text-on-surface mb-2">{title}</h2>
    <p className="text-sm text-on-surface-variant max-w-sm">
      This module is part of the StelarAI Phase 2+ rollout. The backend contract is ready, and the UI is being scaffolded.
    </p>
  </div>
);

type RouteState = { section: StelaraiSectionId };

function parseRoute(pathname: string): RouteState {
  if (pathname.startsWith("/workspace/")) {
    const segment = pathname.split("/")[2] as StelaraiSectionId | undefined;
    if (segment && segment in stelaraiSurfaceMap) {
      return { section: segment };
    }
  }
  return { section: "dashboard" };
}

function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function StelaraiApp() {
  const [route, setRoute] = useState<RouteState>(() => parseRoute(window.location.pathname));
  const [session, setSession] = useState<{ actorEmail?: string }>({});

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    // Check session
    if (runtimeConfig.sessionProbePath) {
      fetchEndpointData(runtimeConfig.sessionProbePath).then(result => {
        if (result.state === "ready") {
          const payload = result.data as { actor_email?: string };
          setSession({ actorEmail: payload.actor_email });
        }
      });
    }
  }, []);

  let content: React.ReactNode;
  const currentSurface = stelaraiSurfaceMap[route.section];

  switch (route.section) {
    case "dashboard":
      content = <DashboardView />;
      break;
    case "connected-accounts":
      content = <ConnectedAccountsView />;
      break;
    case "connected-sources":
      content = <ConnectedSourcesView />;
      break;
    case "canvas-builder":
      content = <CanvasBuilderView />;
      break;
    case "predictive-niche":
      content = <PredictiveNicheView />;
      break;
    case "software-tracker":
      content = <SoftwareTrackerView />;
      break;
    case "industry-automation":
      content = <IndustryAutomationView />;
      break;
    case "workflow-library":
      content = <WorkflowLibraryView />;
      break;
    case "workflow-suggestions":
      content = <WorkflowSuggestionsView />;
      break;
    default:
      content = <PlaceholderView title={currentSurface.title} />;
  }

  return (
    <WorkspaceShell>
      <WorkspaceSidebar 
        activeTab={route.section} 
        items={stelaraiSurfaces} 
        onNavigate={navigate}
        workspaceName="StelarAI Primary"
      />
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <WorkspaceTopBar title={currentSurface.title} actorEmail={session.actorEmail} />
        <div className="flex-1 overflow-y-auto">{content}</div>
      </main>
    </WorkspaceShell>
  );
}
