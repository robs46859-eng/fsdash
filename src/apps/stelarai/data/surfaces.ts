export type StelaraiSectionId =
  | "dashboard"
  | "connected-accounts"
  | "connected-sources"
  | "canvas-builder"
  | "workflow-suggestions"
  | "workflow-library"
  | "execution-simulator"
  | "predictive-niche"
  | "software-tracker"
  | "industry-automation"
  | "settings";

export interface StelaraiSurfaceDefinition {
  id: StelaraiSectionId;
  title: string;
  navLabel: string;
  path: string;
  description: string;
}

export const stelaraiSurfaces: StelaraiSurfaceDefinition[] = [
  {
    id: "dashboard",
    title: "Workspace Dashboard",
    navLabel: "Dashboard",
    path: "/workspace/dashboard",
    description: "Overview of your StelarAI workspace, active workflows, and connected resources.",
  },
  {
    id: "connected-accounts",
    title: "Connected Accounts",
    navLabel: "Accounts",
    path: "/workspace/accounts",
    description: "Manage external business and personal account connections.",
  },
  {
    id: "connected-sources",
    title: "Connected Sources",
    navLabel: "Sources",
    path: "/workspace/sources",
    description: "Manage internal and external data sources for your workflows.",
  },
  {
    id: "canvas-builder",
    title: "Canvas Builder",
    navLabel: "Canvas Builder",
    path: "/workspace/builder",
    description: "Drag-and-drop workflow authoring with multi-node execution support.",
  },
  {
    id: "workflow-suggestions",
    title: "AI Suggestions",
    navLabel: "Suggestions",
    path: "/workspace/suggestions",
    description: "Intelligent workflow optimizations and node-graph improvements.",
  },
  {
    id: "workflow-library",
    title: "Workflow Library",
    navLabel: "Library",
    path: "/workspace/workflows",
    description: "Templates and saved workflows for rapid production.",
  },
  {
    id: "execution-simulator",
    title: "Execution Simulator",
    navLabel: "Simulator",
    path: "/workspace/simulator",
    description: "Dry-run simulation of workflows with cost and provider lane previews.",
  },
  {
    id: "predictive-niche",
    title: "Digital IT Girl",
    navLabel: "Digital IT Girl",
    path: "/workspace/niche-engine",
    description: "Predictive niche engine for opportunity detection and trend scoring.",
  },
  {
    id: "software-tracker",
    title: "Public Beta",
    navLabel: "Public Beta",
    path: "/workspace/software-tracker",
    description: "Software tracker and intelligence module for automated version monitoring.",
  },
  {
    id: "industry-automation",
    title: "AutoPitch",
    navLabel: "AutoPitch",
    path: "/workspace/autopitch",
    description: "Industry automation guide for generating verticalized service pitches.",
  },
  {
    id: "settings",
    title: "Settings",
    navLabel: "Settings",
    path: "/workspace/settings",
    description: "Configure workspace identity, model preferences, and API connections.",
  },
];

export const stelaraiSurfaceMap = Object.fromEntries(
  stelaraiSurfaces.map((s) => [s.id, s]),
) as Record<StelaraiSectionId, StelaraiSurfaceDefinition>;
