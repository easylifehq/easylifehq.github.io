import {
  confidenceLanguage,
  type AssistantConfidence,
  type AssistantIntentSuggestion,
  type AssistantIntentType,
} from "./intentTypes";

type IntentRule = {
  intent: AssistantIntentType;
  confidence: AssistantConfidence;
  pattern: RegExp;
  summary: string;
};

const intentRules: IntentRule[] = [
  {
    intent: "follow-up",
    confidence: "high",
    pattern: /\b(reply|respond|follow up|follow-up|call|text|message|email)\b/i,
    summary: "Looks like something to follow up on.",
  },
  {
    intent: "reminder",
    confidence: "high",
    pattern: /\b(remind me|reminder|don't forget|dont forget|remember to)\b/i,
    summary: "Looks like a reminder to review before saving.",
  },
  {
    intent: "plan",
    confidence: "medium",
    pattern: /\b(plan|schedule|block|calendar|today|tomorrow|tonight|this week|next week|meeting|appointment)\b/i,
    summary: "Looks like it may belong in Plan.",
  },
  {
    intent: "note",
    confidence: "medium",
    pattern: /\b(note|idea|thought|remember|context|save this|pin)\b/i,
    summary: "Looks like context worth keeping as memory.",
  },
  {
    intent: "task",
    confidence: "medium",
    pattern: /\b(need to|have to|should|todo|to do|finish|start|make|buy|clean|review|submit|draft)\b/i,
    summary: "Looks like an action to approve as a task.",
  },
];

function normalizeCaptureText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function buildSuggestionId(sourceText: string) {
  const normalized = normalizeCaptureText(sourceText).toLowerCase();
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }

  return `local-intent-${hash.toString(36)}`;
}

function toTitle(text: string) {
  const cleaned = normalizeCaptureText(text)
    .replace(/^\s*(?:[-*+]|[0-9]+[.)])\s*/, "")
    .replace(/^\s*(?:i\s+)?(?:really\s+|probably\s+|maybe\s+)?(?:need|have|should)\s+(?:to\s+)?/i, "")
    .trim();

  if (!cleaned) return "Review captured input";

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function buildFields(intent: AssistantIntentType, title: string) {
  const primaryLabel =
    intent === "note"
      ? "Memory title"
      : intent === "plan"
        ? "Plan item"
        : intent === "reminder"
          ? "Reminder"
          : intent === "follow-up"
            ? "Follow-up"
            : intent === "task"
              ? "Task"
              : "Capture";

  return [
    {
      label: primaryLabel,
      value: title,
      editable: true,
    },
    {
      label: "Intent",
      value: intent,
      editable: false,
    },
  ];
}

export function classifyAssistantIntent(sourceText: string): AssistantIntentSuggestion {
  const normalized = normalizeCaptureText(sourceText);

  if (!normalized) {
    return {
      id: "local-intent-empty",
      sourceText,
      intent: "unsure",
      title: "Review captured input",
      summary: "There is not enough text to classify yet.",
      confidence: "low",
      confidenceLabel: confidenceLanguage.low,
      approvalState: "needs-review",
      fields: buildFields("unsure", "Review captured input"),
      warnings: ["Nothing will be created until you approve an edited suggestion."],
    };
  }

  const matchedRule = intentRules.find((rule) => rule.pattern.test(normalized));
  const intent = matchedRule?.intent || "unsure";
  const confidence = matchedRule?.confidence || "low";
  const title = toTitle(normalized);

  return {
    id: buildSuggestionId(normalized),
    sourceText,
    intent,
    title,
    summary: matchedRule?.summary || "The assistant is not sure where this belongs yet.",
    confidence,
    confidenceLabel: confidenceLanguage[confidence],
    approvalState: confidence === "low" ? "needs-review" : "suggested",
    fields: buildFields(intent, title),
    warnings: ["Local suggestion only. Nothing is saved, sent, synced, or remembered until a later approved action exists."],
  };
}

export const assistantIntentExamples = [
  "Reply to Maya about Friday plans",
  "Remember to call the dentist tomorrow morning",
  "Block 30 minutes tomorrow for the proposal",
  "Remind me to move laundry tonight",
  "buy groceries this weekend",
  "blue folder",
] as const;
