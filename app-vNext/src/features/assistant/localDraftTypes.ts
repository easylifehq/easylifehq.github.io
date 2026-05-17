import type {
  AssistantApprovalState,
  AssistantConfidence,
  AssistantIntentType,
  AssistantSuggestionField,
} from "./intentTypes";

export type AssistantLocalDraftType = AssistantIntentType;

export type AssistantLocalDraftStatus = "unsaved-preview";

export type AssistantLocalDraftField = AssistantSuggestionField & {
  draftKey: string;
};

export type AssistantLocalDraft = {
  id: string;
  sourceSuggestionId: string;
  sourceText: string;
  draftType: AssistantLocalDraftType;
  title: string;
  body: string;
  status: AssistantLocalDraftStatus;
  confidence: AssistantConfidence;
  confidenceLabel: string;
  approvalState: AssistantApprovalState;
  fields: AssistantLocalDraftField[];
  warnings: string[];
};

export type AssistantLocalDraftComparisonOption = {
  draftType: AssistantLocalDraftType;
  label: string;
  title: string;
  summary: string;
  recommended: boolean;
};

export type AssistantContextDraftAction = "keep-context" | "pin-context" | "task" | "plan" | "dismiss";

export type AssistantContextDraftActionOption = {
  action: AssistantContextDraftAction;
  label: string;
  draftType: AssistantLocalDraftType | null;
  summary: string;
};

export type AssistantTaskRowHandoffPreview = {
  id: string;
  sourceDraftId: string;
  title: string;
  itemKind: "task" | "deadline";
  category: string;
  dueDate: string;
  estimatedLength: string;
  priorityTier: number;
  notes: string;
  warnings: string[];
};

export type AssistantTaskSaveConfirmation = {
  sourcePreviewId: string;
  title: string;
  listName: string;
  itemKind: "task" | "deadline";
  dueDate: string;
  estimatedLength: string;
  notes: string;
  savedTaskId: string | null;
  status: "idle" | "saving" | "saved" | "blocked";
  message: string;
};

export type AssistantNoteHandoffPreview = {
  id: string;
  sourceDraftId: string;
  title: string;
  body: string;
  contextGroup: string;
  pinPreview: boolean;
  warnings: string[];
};

export type AssistantNoteSaveConfirmation = {
  sourcePreviewId: string;
  title: string;
  contextGroup: string;
  pinPreview: boolean;
  savedNoteId: string | null;
  status: "idle" | "saving" | "saved" | "blocked";
  receiptLabel: string;
  message: string;
};

export type AssistantPlanHandoffPreview = {
  id: string;
  sourceDraftId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  dayMode: "light" | "normal" | "push" | "recovery";
  notes: string;
  warnings: string[];
};

export type AssistantReviewHandoffPreview = {
  id: string;
  sourceDraftId: string;
  handoffType: "follow-up" | "reminder";
  title: string;
  reviewMethod: string;
  timingHint: string;
  notes: string;
  warnings: string[];
};

export const localDraftTypeLabels: Record<AssistantLocalDraftType, string> = {
  task: "Task draft",
  note: "Context draft",
  plan: "Plan draft",
  reminder: "Reminder draft",
  "follow-up": "Follow-up draft",
  unsure: "Review draft",
};

export const localDraftStatusLabels: Record<AssistantLocalDraftStatus, string> = {
  "unsaved-preview": "Draft",
};
