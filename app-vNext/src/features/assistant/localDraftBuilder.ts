import type { AssistantIntentSuggestion } from "./intentTypes";
import {
  localDraftStatusLabels,
  localDraftTypeLabels,
  type AssistantLocalDraft,
  type AssistantLocalDraftComparisonOption,
  type AssistantLocalDraftType,
} from "./localDraftTypes";

function normalizeDraftText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function buildDraftBody(suggestion: AssistantIntentSuggestion, draftType: AssistantLocalDraftType) {
  const normalizedSource = normalizeDraftText(suggestion.sourceText);

  if (!normalizedSource) {
    return "Review this empty capture before deciding whether it should become anything.";
  }

  if (draftType === "unsure") {
    return `Hold for review: ${normalizedSource}`;
  }

  return normalizedSource;
}

function buildDraftFields(suggestion: AssistantIntentSuggestion, draftType: AssistantLocalDraftType) {
  const primaryField = suggestion.fields[0];

  return [
    {
      label: localDraftTypeLabels[draftType],
      value: primaryField?.value || suggestion.title,
      editable: true,
      draftKey: `${draftType}-draft`,
    },
    {
      label: "Source intent",
      value: suggestion.intent,
      editable: false,
      draftKey: "source-intent",
    },
  ];
}

export function buildLocalDraftFromSuggestion(
  suggestion: AssistantIntentSuggestion,
  draftType: AssistantLocalDraftType = suggestion.intent
): AssistantLocalDraft {
  const draftTypeLabel = localDraftTypeLabels[draftType];
  const statusLabel = localDraftStatusLabels["unsaved-preview"];

  return {
    id: `local-draft-${suggestion.id}-${draftType}`,
    sourceSuggestionId: suggestion.id,
    sourceText: suggestion.sourceText,
    draftType,
    title: suggestion.title,
    body: buildDraftBody(suggestion, draftType),
    status: "unsaved-preview",
    confidence: suggestion.confidence,
    confidenceLabel: suggestion.confidenceLabel,
    approvalState: "approved",
    fields: buildDraftFields(suggestion, draftType),
    warnings: [
      `${statusLabel}. This ${draftTypeLabel.toLowerCase()} is not saved.`,
      "No task, note, plan, reminder, follow-up, email, sync, schedule, or memory has been created.",
    ],
  };
}

const localDraftComparisonSummaries: Record<AssistantLocalDraftType, string> = {
  task: "Action to review",
  note: "Context to keep",
  plan: "Time block to consider",
  reminder: "Prompt to review",
  "follow-up": "Reply or reach-out",
  unsure: "Hold for review",
};

export function buildLocalDraftComparisonOptions(
  suggestion: AssistantIntentSuggestion
): AssistantLocalDraftComparisonOption[] {
  return (Object.keys(localDraftTypeLabels) as AssistantLocalDraftType[]).map((draftType) => ({
    draftType,
    label: localDraftTypeLabels[draftType],
    title: suggestion.title,
    summary: localDraftComparisonSummaries[draftType],
    recommended: draftType === suggestion.intent,
  }));
}

export function buildLocalDraftReviewHint(suggestion: AssistantIntentSuggestion) {
  const draftTypeLabel = localDraftTypeLabels[suggestion.intent].toLowerCase();

  return {
    label: "Safe next action",
    title: `Review an unsaved ${draftTypeLabel} in Inbox`,
    detail: "Nothing is saved from Today.",
  };
}
