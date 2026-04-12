import { logMarketingExportAction } from "./api";
import { ExportActionResult, MarketingGeneratorDefinition, MarketingGeneratorState } from "./types";
import { buildGeneratorPrompt } from "./promptOrchestrator";

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportMarketingDraft(
  type: ExportActionResult["type"],
  definition: MarketingGeneratorDefinition,
  state: MarketingGeneratorState,
): Promise<ExportActionResult> {
  const payload = {
    generator: definition.id,
    title: definition.title,
    values: state.values,
    draft: state.draft,
    prompt: buildGeneratorPrompt(definition, state.values),
    versions: state.versions,
  };

  if (type === "copy") {
    await navigator.clipboard.writeText(state.draft || buildGeneratorPrompt(definition, state.values));
    if (state.draftId) {
      await logMarketingExportAction({ draftId: state.draftId, action: type });
    }
    return {
      type,
      message: "Draft copied to clipboard.",
    };
  }

  if (type === "download-json") {
    downloadFile(
      `${definition.id}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
    if (state.draftId) {
      await logMarketingExportAction({ draftId: state.draftId, action: type });
    }
    return {
      type,
      message: "Generator package exported as JSON.",
    };
  }

  downloadFile(
    `${definition.id}.txt`,
    state.draft || buildGeneratorPrompt(definition, state.values),
    "text/plain",
  );
  if (state.draftId) {
    await logMarketingExportAction({ draftId: state.draftId, action: type });
  }
  return {
    type,
    message: "Draft exported as text.",
  };
}
