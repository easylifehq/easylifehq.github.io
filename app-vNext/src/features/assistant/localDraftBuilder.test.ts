import { classifyAssistantIntent } from "./intentClassifier";
import { buildLocalDraftFromSuggestion } from "./localDraftBuilder";
import type { AssistantIntentType } from "./intentTypes";

type LocalDraftExample = {
  text: string;
  expectedDraftType: AssistantIntentType;
};

export const localDraftBuilderExamples: LocalDraftExample[] = [
  {
    text: "buy groceries this weekend",
    expectedDraftType: "task",
  },
  {
    text: "This launch idea should stay near the roadmap notes",
    expectedDraftType: "note",
  },
  {
    text: "Block 30 minutes tomorrow for the proposal",
    expectedDraftType: "plan",
  },
  {
    text: "Remind me to call the dentist tomorrow morning",
    expectedDraftType: "reminder",
  },
  {
    text: "Reply to Maya about Friday plans",
    expectedDraftType: "follow-up",
  },
  {
    text: "blue folder",
    expectedDraftType: "unsure",
  },
];

export const localDraftBuilderProof = localDraftBuilderExamples.map((example) => {
  const suggestion = classifyAssistantIntent(example.text);
  const draft = buildLocalDraftFromSuggestion(suggestion);
  const passed =
    draft.draftType === example.expectedDraftType &&
    draft.status === "unsaved-preview" &&
    draft.approvalState === "approved" &&
    draft.sourceSuggestionId === suggestion.id &&
    draft.warnings.some((warning) => warning.includes("Not saved")) &&
    draft.warnings.some((warning) => warning.includes("Preview only"));

  return {
    text: example.text,
    expectedDraftType: example.expectedDraftType,
    actualDraftType: draft.draftType,
    status: draft.status,
    passed,
  };
});

export const localDraftBuilderProofPassed = localDraftBuilderProof.every((example) => example.passed);
