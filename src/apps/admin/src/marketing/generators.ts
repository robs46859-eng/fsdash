import {
  GeneratorPromptBlock,
  MarketingGeneratorDefinition,
  MarketingGeneratorId,
} from "./types";

function splitTags(value?: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildAudienceToneBlocks(
  values: Record<string, string>,
  extra: string[] = [],
): GeneratorPromptBlock[] {
  const audience = values.audience || "Not specified";
  const tone = values.tone || "Direct and operator-grade";
  return [
    {
      title: "Audience and tone",
      lines: [`Audience: ${audience}`, `Tone: ${tone}`, ...extra],
    },
  ];
}

const localGeneratorDefinitions: MarketingGeneratorDefinition[] = [
  {
    id: "ad-copy",
    title: "Ad Copy",
    shortLabel: "Ad Copy",
    summary:
      "Produce paid media copy variants without turning them into CRM records or lead objects.",
    outputLabel: "Ad draft",
    fields: [
      { key: "campaignGoal", label: "Campaign goal", type: "text", required: true, placeholder: "Drive demo bookings for FullStack operators" },
      { key: "audience", label: "Audience", type: "text", required: true, placeholder: "Operations leaders at multi-tenant AI products" },
      { key: "offer", label: "Offer", type: "text", required: true, placeholder: "Operator walkthrough and architecture review" },
      { key: "channels", label: "Channels", type: "tags", placeholder: "LinkedIn, Search, Retargeting" },
      { key: "tone", label: "Tone", type: "select", options: ["Direct", "Premium", "Technical", "Urgent"], required: true },
      { key: "constraints", label: "Constraints", type: "textarea", placeholder: "Avoid hype. Keep claims auditable. Mention FullStack, not Arkham." },
    ],
    futureModules: ["vertical templates", "brand kits", "approval routing"],
    buildPromptBlocks: (values) => [
      {
        title: "Objective",
        lines: [
          `Write paid ad copy for this goal: ${values.campaignGoal || "Not specified"}`,
          `Primary offer: ${values.offer || "Not specified"}`,
          `Target channels: ${splitTags(values.channels).join(", ") || "Not specified"}`,
        ],
      },
      ...buildAudienceToneBlocks(values, [
        `Hard constraints: ${values.constraints || "None provided"}`,
      ]),
      {
        title: "Output contract",
        lines: [
          "Return 3 variants with headline, support line, CTA, and channel fit note.",
          "Do not assume CRM sync or record attachment.",
        ],
      },
    ],
  },
  {
    id: "email-campaigns",
    title: "Email Campaigns",
    shortLabel: "Email",
    summary:
      "Plan and draft outbound or lifecycle campaigns as independent marketing assets.",
    outputLabel: "Email campaign draft",
    fields: [
      { key: "campaignType", label: "Campaign type", type: "select", options: ["Launch", "Nurture", "Retention", "Re-engagement"], required: true },
      { key: "audience", label: "Audience", type: "text", required: true, placeholder: "Platform buyers evaluating governed AI operations" },
      { key: "sequenceLength", label: "Sequence length", type: "text", placeholder: "3 emails over 10 days" },
      { key: "coreMessage", label: "Core message", type: "textarea", required: true, placeholder: "Why FullStack helps operators control AI workflows" },
      { key: "cta", label: "Primary CTA", type: "text", required: true, placeholder: "Book an operator review" },
      { key: "tone", label: "Tone", type: "select", options: ["Direct", "Warm", "Executive", "Technical"], required: true },
    ],
    futureModules: ["vertical templates", "brand kits", "approval routing"],
    buildPromptBlocks: (values) => [
      {
        title: "Campaign frame",
        lines: [
          `Campaign type: ${values.campaignType || "Not specified"}`,
          `Sequence length: ${values.sequenceLength || "Not specified"}`,
          `Primary CTA: ${values.cta || "Not specified"}`,
        ],
      },
      ...buildAudienceToneBlocks(values, [
        `Core message: ${values.coreMessage || "Not specified"}`,
      ]),
      {
        title: "Output contract",
        lines: [
          "Draft the sequence with subject line, preview text, and body summary for each email.",
          "Keep this as a marketing draft only until explicitly published or attached.",
        ],
      },
    ],
  },
  {
    id: "social-posts",
    title: "Social Posts",
    shortLabel: "Social",
    summary:
      "Generate social-ready copy packages while keeping platform and CRM boundaries intact.",
    outputLabel: "Social post draft",
    fields: [
      { key: "platforms", label: "Platforms", type: "tags", required: true, placeholder: "LinkedIn, X, Threads" },
      { key: "audience", label: "Audience", type: "text", required: true, placeholder: "CTOs and operator leads" },
      { key: "announcement", label: "Announcement or theme", type: "textarea", required: true, placeholder: "FullStack now centralizes governed AI operations" },
      { key: "proofPoints", label: "Proof points", type: "textarea", placeholder: "Tenant isolation, sidecar-aware deployment, operator auditability" },
      { key: "tone", label: "Tone", type: "select", options: ["Direct", "Confident", "Technical", "Conversational"], required: true },
      { key: "hashtags", label: "Hashtags", type: "tags", placeholder: "MLOps, AIOps, PlatformEngineering" },
    ],
    futureModules: ["vertical templates", "brand kits", "approval routing"],
    buildPromptBlocks: (values) => [
      {
        title: "Distribution",
        lines: [
          `Platforms: ${splitTags(values.platforms).join(", ") || "Not specified"}`,
          `Theme: ${values.announcement || "Not specified"}`,
          `Proof points: ${values.proofPoints || "None provided"}`,
        ],
      },
      ...buildAudienceToneBlocks(values, [
        `Optional hashtags: ${splitTags(values.hashtags).join(", ") || "None provided"}`,
      ]),
      {
        title: "Output contract",
        lines: [
          "Return platform-specific variations with a hook, main body, CTA, and optional hashtags.",
          "Avoid implying the content is stored in account records.",
        ],
      },
    ],
  },
  {
    id: "blog-outlines",
    title: "Blog Outlines",
    shortLabel: "Blog",
    summary:
      "Structure editorial pieces for later drafting, review, and approval without affecting CRM state.",
    outputLabel: "Blog outline",
    fields: [
      { key: "topic", label: "Topic", type: "text", required: true, placeholder: "Governed AI operations for multi-tenant platforms" },
      { key: "audience", label: "Audience", type: "text", required: true, placeholder: "Engineering leaders and product operators" },
      { key: "angle", label: "Angle", type: "textarea", required: true, placeholder: "Why operator-grade controls matter more than generic AI dashboards" },
      { key: "seoKeywords", label: "SEO keywords", type: "tags", placeholder: "governed ai, platform operations, ai control plane" },
      { key: "tone", label: "Tone", type: "select", options: ["Editorial", "Technical", "Executive", "Explainer"], required: true },
      { key: "targetLength", label: "Target length", type: "text", placeholder: "1200 words" },
    ],
    futureModules: ["vertical templates", "brand kits", "approval routing"],
    buildPromptBlocks: (values) => [
      {
        title: "Editorial brief",
        lines: [
          `Topic: ${values.topic || "Not specified"}`,
          `Angle: ${values.angle || "Not specified"}`,
          `Target length: ${values.targetLength || "Not specified"}`,
        ],
      },
      ...buildAudienceToneBlocks(values, [
        `SEO keywords: ${splitTags(values.seoKeywords).join(", ") || "None provided"}`,
      ]),
      {
        title: "Output contract",
        lines: [
          "Return title options, thesis, section outline, and evidence or example prompts per section.",
          "Keep as editorial planning material until explicitly published or attached.",
        ],
      },
    ],
  },
  {
    id: "product-descriptions",
    title: "Product Descriptions",
    shortLabel: "Product",
    summary:
      "Draft catalog or product page descriptions as standalone marketing assets.",
    outputLabel: "Product description draft",
    fields: [
      { key: "productName", label: "Product name", type: "text", required: true, placeholder: "FullStack Operator UI" },
      { key: "productType", label: "Product type", type: "text", required: true, placeholder: "Control plane for AI-assisted platform operations" },
      { key: "audience", label: "Audience", type: "text", required: true, placeholder: "Operations leaders and technical buyers" },
      { key: "features", label: "Key features", type: "textarea", required: true, placeholder: "Tenant isolation, health probes, env-driven runtime, sidecar-aware architecture" },
      { key: "tone", label: "Tone", type: "select", options: ["Direct", "Premium", "Technical", "Commercial"], required: true },
      { key: "cta", label: "CTA", type: "text", placeholder: "Request a walkthrough" },
    ],
    futureModules: ["vertical templates", "brand kits", "approval routing"],
    buildPromptBlocks: (values) => [
      {
        title: "Product brief",
        lines: [
          `Product: ${values.productName || "Not specified"}`,
          `Type: ${values.productType || "Not specified"}`,
          `Key features: ${values.features || "Not specified"}`,
        ],
      },
      ...buildAudienceToneBlocks(values, [
        `Primary CTA: ${values.cta || "Not specified"}`,
      ]),
      {
        title: "Output contract",
        lines: [
          "Return short, medium, and long description variants plus a bullet feature summary.",
          "Do not associate the draft with any CRM account unless explicitly attached later.",
        ],
      },
    ],
  },
  {
    id: "landing-page-copy",
    title: "Landing Page Copy",
    shortLabel: "Landing",
    summary:
      "Compose messaging systems for landing pages without changing the app's CRM or pipeline records.",
    outputLabel: "Landing page draft",
    fields: [
      { key: "pageGoal", label: "Page goal", type: "text", required: true, placeholder: "Convert operator teams evaluating FullStack" },
      { key: "audience", label: "Audience", type: "text", required: true, placeholder: "Technical operators and platform buyers" },
      { key: "offer", label: "Offer", type: "text", required: true, placeholder: "Operator review and deployment architecture call" },
      { key: "proofPoints", label: "Proof points", type: "textarea", required: true, placeholder: "Deployment-ready shell, sidecar isolation, honest backend boundaries" },
      { key: "tone", label: "Tone", type: "select", options: ["Direct", "Premium", "Technical", "Executive"], required: true },
      { key: "sections", label: "Required sections", type: "tags", placeholder: "Hero, proof, workflow, FAQ, CTA" },
    ],
    futureModules: ["vertical templates", "brand kits", "approval routing"],
    buildPromptBlocks: (values) => [
      {
        title: "Page brief",
        lines: [
          `Goal: ${values.pageGoal || "Not specified"}`,
          `Offer: ${values.offer || "Not specified"}`,
          `Proof points: ${values.proofPoints || "Not specified"}`,
        ],
      },
      ...buildAudienceToneBlocks(values, [
        `Required sections: ${splitTags(values.sections).join(", ") || "Hero, proof, workflow, CTA"}`,
      ]),
      {
        title: "Output contract",
        lines: [
          "Return hero, supporting sections, CTA block, and FAQ prompts.",
          "Treat the output as standalone marketing copy until explicitly published.",
        ],
      },
    ],
  },
];

export const generatorDefinitionMap = Object.fromEntries(
  localGeneratorDefinitions.map((generator) => [generator.id, generator]),
) as Record<MarketingGeneratorId, MarketingGeneratorDefinition>;

export function mergeRemoteGeneratorDefinitions(
  remoteDefinitions: Array<
    Pick<
      MarketingGeneratorDefinition,
      "id" | "title" | "summary" | "outputLabel" | "fields" | "futureModules"
    >
  >,
): MarketingGeneratorDefinition[] {
  return remoteDefinitions.map((definition) => {
    const local = generatorDefinitionMap[definition.id];
    return {
      ...local,
      ...definition,
      shortLabel: local.shortLabel,
      buildPromptBlocks: local.buildPromptBlocks,
    };
  });
}

export const marketingGeneratorIds = localGeneratorDefinitions.map(
  (generator) => generator.id,
);
