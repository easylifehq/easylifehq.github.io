import type { AssistantIntentSuggestion } from "./intentTypes";
import {
  localDraftStatusLabels,
  localDraftTypeLabels,
  type AssistantLocalDraft,
  type AssistantLocalDraftComparisonOption,
  type AssistantLocalDraftType,
  type AssistantMemoryDraftActionOption,
  type AssistantNoteHandoffPreview,
  type AssistantPlanHandoffPreview,
  type AssistantReviewHandoffPreview,
  type AssistantTaskRowHandoffPreview,
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
      "No saved object or external action has been created.",
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

export const memoryDraftActionOptions: AssistantMemoryDraftActionOption[] = [
  {
    action: "remember",
    label: "Keep context",
    draftType: "note",
    summary: "Hold as an unsaved context draft.",
  },
  {
    action: "pin-context",
    label: "Pin context",
    draftType: "note",
    summary: "Preview as context to keep close.",
  },
  {
    action: "task",
    label: "Turn into task",
    draftType: "task",
    summary: "Preview as an action draft.",
  },
  {
    action: "plan",
    label: "Turn into plan",
    draftType: "plan",
    summary: "Preview as a plan draft.",
  },
  {
    action: "dismiss",
    label: "Dismiss",
    draftType: null,
    summary: "Hide this local preview.",
  },
];

function buildTaskHandoffNotes(draft: AssistantLocalDraft) {
  const source = normalizeDraftText(draft.sourceText);

  if (!source || source === draft.title) {
    return "Review this local handoff before using the existing save action.";
  }

  return `Source capture: ${source}`;
}

export function buildTaskRowHandoffPreview(draft: AssistantLocalDraft): AssistantTaskRowHandoffPreview | null {
  if (draft.draftType !== "task") {
    return null;
  }

  return {
    id: `task-handoff-${draft.id}`,
    sourceDraftId: draft.id,
    title: draft.title,
    itemKind: "task",
    category: "",
    dueDate: "",
    estimatedLength: "",
    priorityTier: 5,
    notes: buildTaskHandoffNotes(draft),
    warnings: [
      "Editable local task-row preview only. This has not been saved.",
      "Use the existing task save action below only when you are ready to create a real task.",
    ],
  };
}

export function buildNoteHandoffPreview(draft: AssistantLocalDraft): AssistantNoteHandoffPreview | null {
  if (draft.draftType !== "note") {
    return null;
  }

  return {
    id: `note-handoff-${draft.id}`,
    sourceDraftId: draft.id,
    title: draft.title,
    body: draft.body,
    contextGroup: "Inbox review",
    pinPreview: false,
    warnings: [
      "Editable local note preview only. This context is not saved yet.",
      "Use the existing note creation flow only when you are ready to create a real note.",
    ],
  };
}

export function buildPlanHandoffPreview(
  draft: AssistantLocalDraft,
  defaults: Pick<AssistantPlanHandoffPreview, "date" | "startTime" | "endTime" | "dayMode">
): AssistantPlanHandoffPreview | null {
  if (draft.draftType !== "plan") {
    return null;
  }

  return {
    id: `plan-handoff-${draft.id}`,
    sourceDraftId: draft.id,
    title: draft.title,
    date: defaults.date,
    startTime: defaults.startTime,
    endTime: defaults.endTime,
    dayMode: defaults.dayMode,
    notes: `Review this local day preview before using any real planning action. Source capture: ${normalizeDraftText(draft.sourceText) || draft.title}`,
    warnings: [
      "Editable local plan preview only. This is not scheduled and not saved.",
      "Use the existing Plan controls only when you are ready to place real blocks on the day.",
    ],
  };
}

export function buildReviewHandoffPreview(draft: AssistantLocalDraft): AssistantReviewHandoffPreview | null {
  if (draft.draftType !== "follow-up" && draft.draftType !== "reminder") {
    return null;
  }

  const source = normalizeDraftText(draft.sourceText) || draft.title;
  const isFollowUp = draft.draftType === "follow-up";

  return {
    id: `review-handoff-${draft.id}`,
    sourceDraftId: draft.id,
    handoffType: draft.draftType,
    title: draft.title,
    reviewMethod: isFollowUp ? "Manual reply review" : "Manual reminder review",
    timingHint: isFollowUp ? "Before next check-in" : "No notification scheduled",
    notes: isFollowUp
      ? `Draft the follow-up language before choosing any real email, text, call, or message action. Source capture: ${source}`
      : `Review what context should stay visible before choosing any real reminder or calendar action. Source capture: ${source}`,
    warnings: isFollowUp
      ? [
          "Editable local follow-up preview only. This does not send email, text, calls, or messages.",
          "This follow-up is not saved automatically. Choose any real next action yourself.",
        ]
      : [
          "Editable local reminder preview only. This does not schedule a notification.",
          "This reminder is not saved automatically. Choose any real next action yourself.",
        ],
  };
}
