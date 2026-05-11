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

export type AssistantMemoryDraftAction = "remember" | "pin-context" | "task" | "plan" | "dismiss";

export type AssistantMemoryDraftActionOption = {
  action: AssistantMemoryDraftAction;
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

export type AssistantNoteHandoffPreview = {
  id: string;
  sourceDraftId: string;
  title: string;
  body: string;
  contextGroup: string;
  pinPreview: boolean;
  warnings: string[];
};

export const localDraftTypeLabels: Record<AssistantLocalDraftType, string> = {
  task: "Task draft",
  note: "Memory draft",
  plan: "Plan draft",
  reminder: "Reminder draft",
  "follow-up": "Follow-up draft",
  unsure: "Review draft",
};

export const localDraftStatusLabels: Record<AssistantLocalDraftStatus, string> = {
  "unsaved-preview": "Unsaved local preview",
};
