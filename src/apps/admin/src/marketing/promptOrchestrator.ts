import { MarketingGeneratorDefinition } from "./types";

export function buildGeneratorPrompt(definition: MarketingGeneratorDefinition, values: Record<string, string>) {
  const blocks = definition.buildPromptBlocks(values);
  return blocks
    .map((block) => [`# ${block.title}`, ...block.lines].join("\n"))
    .join("\n\n");
}
