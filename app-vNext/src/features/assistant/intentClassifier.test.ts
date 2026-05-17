import { classifyAssistantIntent } from "./intentClassifier";
import type { AssistantIntentType } from "./intentTypes";

type IntentExample = {
  text: string;
  expectedIntent: AssistantIntentType;
  expectedApprovalState: "suggested" | "needs-review";
};

export const intentClassifierExamples: IntentExample[] = [
  {
    text: "Reply to Maya about Friday plans",
    expectedIntent: "follow-up",
    expectedApprovalState: "suggested",
  },
  {
    text: "Remember to call the dentist tomorrow morning",
    expectedIntent: "reminder",
    expectedApprovalState: "suggested",
  },
  {
    text: "Block 30 minutes tomorrow for the proposal",
    expectedIntent: "plan",
    expectedApprovalState: "suggested",
  },
  {
    text: "This launch idea should stay near the roadmap notes",
    expectedIntent: "note",
    expectedApprovalState: "suggested",
  },
  {
    text: "buy groceries this weekend",
    expectedIntent: "task",
    expectedApprovalState: "suggested",
  },
  {
    text: "blue folder",
    expectedIntent: "unsure",
    expectedApprovalState: "needs-review",
  },
];

export const intentClassifierProof = intentClassifierExamples.map((example) => {
  const suggestion = classifyAssistantIntent(example.text);
  const passed =
    suggestion.intent === example.expectedIntent &&
    suggestion.approvalState === example.expectedApprovalState &&
    suggestion.warnings.some((warning) => warning.includes("Draft only"));

  return {
    text: example.text,
    expectedIntent: example.expectedIntent,
    actualIntent: suggestion.intent,
    expectedApprovalState: example.expectedApprovalState,
    actualApprovalState: suggestion.approvalState,
    passed,
  };
});

export const intentClassifierProofPassed = intentClassifierProof.every((example) => example.passed);
