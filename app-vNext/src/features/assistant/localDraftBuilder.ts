import type { AssistantIntentSuggestion } from "./intentTypes";
import {
  localDraftStatusLabels,
  localDraftTypeLabels,
  type AssistantLocalDraft,
} from "./localDraftTypes";

function normalizeDraftText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function buildDraftBody(suggestion: AssistantIntentSuggestion) {
  const normalizedSource = normalizeDraftText(suggestion.sourceText);

  if (!normalizedSource) {
    return "Review this empty capture before deciding whether it should become anything.";
  }

  if (suggestion.intent === "unsure") {
    return `Hold for review: ${normalizedSource}`;
  }

  return normalizedSource;
}

export function buildLocalDraftFromSuggestion(suggestion: AssistantIntentSuggestion): AssistantLocalDraft {
  const draftTypeLabel = localDraftTypeLabels[suggestion.intent];
  const statusLabel = localDraftStatusLabels["unsaved-preview"];

  return {
    id: `local-draft-${suggestion.id}`,
    sourceSuggestionId: suggestion.id,
    sourceText: suggestion.sourceText,
    draftType: suggestion.intent,
    title: suggestion.title,
    body: buildDraftBody(suggestion),
    status: "unsaved-preview",
    confidence: suggestion.confidence,
    confidenceLabel: suggestion.confidenceLabel,
    approvalState: "approved",
    fields: suggestion.fields.map((field) => ({
      ...field,
      draftKey: field.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "field",
    })),
    warnings: [
      `${statusLabel}. This ${draftTypeLabel.toLowerCase()} is not saved.`,
      "No task, note, plan, reminder, follow-up, email, sync, schedule, or memory has been created.",
    ],
  };
}
