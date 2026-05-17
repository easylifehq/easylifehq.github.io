export const assistantAiAvailability = {
  status: "unavailable",
  label: "Live AI off",
  badge: "Local mode",
  mode: "deterministic-local",
  unavailableReason: "Stage 20 has contracts and local review behavior, but no server AI gateway yet.",
} as const;

export type AssistantAiSurface = "today" | "inbox";

export const assistantAiFallbackCopy: Record<AssistantAiSurface, string> = {
  today: "Local mode. Capture, Today review, task saves, and note saves still work.",
  inbox: "Local rules are active; saves still need your final confirmation.",
};

export function isLiveAssistantAiAvailable() {
  return false;
}

export function getAssistantAiFallbackCopy(surface: AssistantAiSurface) {
  return assistantAiFallbackCopy[surface];
}
