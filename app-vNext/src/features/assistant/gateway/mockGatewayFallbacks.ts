import { classifyAssistantIntent } from "../intentClassifier";
import type { AssistantIntentSuggestion } from "../intentTypes";
import { buildLocalDraftFromSuggestion } from "../localDraftBuilder";
import type { AssistantLocalDraft } from "../localDraftTypes";

export const mockGatewayFallbackReasons = [
  "timeout",
  "rate-limit",
  "circuit-open",
  "ai-disabled",
  "invalid-request",
  "validation-rejected",
] as const;

export type MockGatewayFallbackReason = (typeof mockGatewayFallbackReasons)[number];

export type MockGatewayRetryPolicy = {
  automaticRetry: false;
  label: "No automatic background retry";
};

export type MockGatewayFallbackState = {
  reason: MockGatewayFallbackReason;
  label: string;
  copy: string;
  typedCaptureText: string;
  preservesTypedCapture: true;
  deterministicLocalAvailable: true;
  hiddenReads: false;
  hiddenWrites: false;
  externalActions: false;
  retryPolicy: MockGatewayRetryPolicy;
  localSuggestion: AssistantIntentSuggestion;
  localDraft: AssistantLocalDraft;
};

const fallbackCopyByReason: Record<MockGatewayFallbackReason, Pick<MockGatewayFallbackState, "label" | "copy">> = {
  timeout: {
    label: "Mock gateway timed out",
    copy: "The typed capture stays here. Use the local draft preview; nothing retries in the background.",
  },
  "rate-limit": {
    label: "Mock gateway rate limit",
    copy: "The typed capture stays here. Local rules still work, and no background retry will run.",
  },
  "circuit-open": {
    label: "Mock gateway circuit open",
    copy: "The typed capture stays here while mock AI output is paused. Local draft behavior remains available.",
  },
  "ai-disabled": {
    label: "Mock AI disabled",
    copy: "The typed capture stays here. EasyLife is using deterministic local suggestions only.",
  },
  "invalid-request": {
    label: "Mock request rejected",
    copy: "The typed capture stays here, but the mock gateway request was not allowed.",
  },
  "validation-rejected": {
    label: "Mock output rejected",
    copy: "The typed capture stays here. The mock output was blocked before it could be offered.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function extractTypedCaptureTextFromMockGatewayInput(value: unknown): string {
  if (!isRecord(value) || !isRecord(value.contextPacket) || !Array.isArray(value.contextPacket.sources)) {
    return "";
  }

  const typedCapture = value.contextPacket.sources.find(
    (source) => isRecord(source) && source.sourceType === "typed-capture" && typeof source.text === "string",
  );

  return isRecord(typedCapture) && typeof typedCapture.text === "string" ? typedCapture.text : "";
}

export function createMockGatewayFallbackState(
  reason: MockGatewayFallbackReason,
  input?: {
    typedCaptureText?: string;
    requestLike?: unknown;
  },
): MockGatewayFallbackState {
  const typedCaptureText =
    input?.typedCaptureText ?? extractTypedCaptureTextFromMockGatewayInput(input?.requestLike);
  const localSuggestion = classifyAssistantIntent(typedCaptureText);
  const localDraft = buildLocalDraftFromSuggestion(localSuggestion);
  const copy = fallbackCopyByReason[reason];

  return {
    reason,
    label: copy.label,
    copy: copy.copy,
    typedCaptureText,
    preservesTypedCapture: true,
    deterministicLocalAvailable: true,
    hiddenReads: false,
    hiddenWrites: false,
    externalActions: false,
    retryPolicy: {
      automaticRetry: false,
      label: "No automatic background retry",
    },
    localSuggestion,
    localDraft,
  };
}
