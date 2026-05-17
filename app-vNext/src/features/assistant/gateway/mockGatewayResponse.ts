import type { AssistantIntentType } from "../intentTypes";
import {
  assistantModelOutputVersion,
  type AssistantModelDestinationLabel,
  type AssistantModelOutputField,
  type AssistantModelOutputValidationState,
  type AssistantModelSuggestionOutput,
} from "../modelContracts/modelOutputTypes";
import { validateAssistantModelOutput } from "../modelContracts/modelOutputValidator";
import type { AssistantTypedCaptureContextSource } from "../modelContracts/contextPacket";
import { validateMockGatewayRequest } from "./mockGatewayRequest";
import type { MockGatewayRequestEnvelope } from "./mockGatewayTypes";

export const mockGatewayResponseVersion = "stage-22-mock-response-v1" as const;

export type MockGatewayResponseEnvelope = {
  responseVersion: typeof mockGatewayResponseVersion;
  requestId?: string;
  status: "ok" | "fallback";
  safetyState: AssistantModelOutputValidationState;
  output?: AssistantModelSuggestionOutput;
  fallbackCopy?: string;
  errors: string[];
  warnings: string[];
};

type MockSuggestionOutputInput = {
  requestId: string;
  sourceId: string;
  sourceLabel: string;
  captureText: string;
  intent: AssistantIntentType;
  destinationLabel: AssistantModelDestinationLabel;
  title: string;
  summary: string;
  fields: AssistantModelOutputField[];
};

const mockFallbackCopy =
  "Mock assistant output was not offered. Use the local draft preview and manual save controls.";

function isTypedCaptureSource(source: unknown): source is AssistantTypedCaptureContextSource {
  return Boolean(
    source &&
      typeof source === "object" &&
      "sourceType" in source &&
      source.sourceType === "typed-capture",
  );
}

function getTypedCapture(request: MockGatewayRequestEnvelope): AssistantTypedCaptureContextSource {
  const typedCapture = request.contextPacket.sources.find(isTypedCaptureSource);

  if (!typedCapture) {
    throw new Error("Mock gateway request was validated without a typed capture source.");
  }

  return typedCapture;
}

function cleanTitle(value: string) {
  const title = value.replace(/\s+/g, " ").trim();
  return title.length > 72 ? `${title.slice(0, 69).trim()}...` : title;
}

function inferMockIntent(captureText: string): AssistantIntentType {
  const text = captureText.toLowerCase();

  if (/(follow up|follow-up|check in|reply|circle back)/.test(text)) return "follow-up";
  if (/(note|context|pin|keep|remember)/.test(text)) return "note";
  if (/(unsure|not sure|maybe|figure out|what is this)/.test(text)) return "unsure";

  return "task";
}

function destinationForIntent(intent: AssistantIntentType): AssistantModelDestinationLabel {
  if (intent === "note") return "Notes context draft";
  if (intent === "follow-up") return "Follow-up preview only";
  if (intent === "unsure") return "Needs review";
  return "Inbox task draft";
}

function summaryForIntent(intent: AssistantIntentType) {
  if (intent === "note") {
    return "Mock draft for saved context review. Nothing is added to Notes from this response.";
  }

  if (intent === "follow-up") {
    return "Mock follow-up preview for review. It stays local until the user chooses a manual path.";
  }

  if (intent === "unsure") {
    return "Mock suggestion needs review before choosing task, note, plan, reminder, or follow-up.";
  }

  return "Mock task draft for Inbox review. Nothing changes until the user confirms a task save.";
}

function fieldsForIntent(intent: AssistantIntentType, captureText: string): AssistantModelOutputField[] {
  if (intent === "note") {
    return [
      {
        label: "Context draft",
        value: cleanTitle(captureText),
        editable: true,
      },
      {
        label: "Destination",
        value: "Notes context draft",
        editable: false,
      },
    ];
  }

  if (intent === "follow-up") {
    return [
      {
        label: "Follow-up draft",
        value: cleanTitle(captureText),
        editable: true,
      },
      {
        label: "Tracking path",
        value: "Preview only",
        editable: false,
      },
    ];
  }

  if (intent === "unsure") {
    return [
      {
        label: "Needs review",
        value: cleanTitle(captureText),
        editable: true,
      },
      {
        label: "Reason",
        value: "Mock classifier could not choose a safe destination.",
        editable: false,
      },
    ];
  }

  return [
    {
      label: "Task title",
      value: cleanTitle(captureText),
      editable: true,
    },
    {
      label: "Destination",
      value: "Inbox task draft",
      editable: false,
    },
  ];
}

function makeMockSuggestionOutput(input: MockSuggestionOutputInput): AssistantModelSuggestionOutput {
  return {
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: input.intent,
    confidence: input.intent === "unsure" ? "low" : "medium",
    state: input.intent === "task" ? "draft" : "preview",
    destinationLabel: input.destinationLabel,
    title: input.title,
    summary: input.summary,
    sources: [
      {
        sourceId: input.sourceId,
        sourceLabel: input.sourceLabel,
      },
    ],
    fields: input.fields,
    confirmation: {
      required: true,
      label: input.intent === "task" ? "Final confirmation required" : "Review only",
      copy:
        input.intent === "task"
          ? "Review the task draft before using the existing task save path."
          : "Review this preview before choosing any manual path.",
    },
    warnings: [],
  };
}

export function validateMockGatewaySyntheticOutput(
  value: unknown,
  requestId?: string,
): MockGatewayResponseEnvelope {
  const validation = validateAssistantModelOutput(value);

  if (!validation.valid || !validation.output) {
    return {
      responseVersion: mockGatewayResponseVersion,
      requestId,
      status: "fallback",
      safetyState: validation.safetyState,
      fallbackCopy: mockFallbackCopy,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  return {
    responseVersion: mockGatewayResponseVersion,
    requestId,
    status: "ok",
    safetyState: validation.safetyState,
    output: validation.output,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}

export function createMockGatewaySyntheticOutput(
  request: MockGatewayRequestEnvelope,
): AssistantModelSuggestionOutput {
  const typedCapture = getTypedCapture(request);
  const intent = inferMockIntent(typedCapture.text);
  const title = cleanTitle(typedCapture.text);

  return makeMockSuggestionOutput({
    requestId: request.contextPacket.requestId,
    sourceId: typedCapture.id,
    sourceLabel: typedCapture.sourceLabel,
    captureText: typedCapture.text,
    intent,
    destinationLabel: destinationForIntent(intent),
    title: intent === "unsure" ? "Review this capture" : title,
    summary: summaryForIntent(intent),
    fields: fieldsForIntent(intent, typedCapture.text),
  });
}

export function createMockGatewayResponse(value: unknown): MockGatewayResponseEnvelope {
  const requestValidation = validateMockGatewayRequest(value);

  if (!requestValidation.valid || !requestValidation.request) {
    return {
      responseVersion: mockGatewayResponseVersion,
      status: "fallback",
      safetyState: "rejected",
      fallbackCopy: mockFallbackCopy,
      errors: requestValidation.errors,
      warnings: [],
    };
  }

  const output = createMockGatewaySyntheticOutput(requestValidation.request);
  return validateMockGatewaySyntheticOutput(output, requestValidation.request.contextPacket.requestId);
}

export const mockGatewayAcceptedResponseFixtures = {
  task: makeMockSuggestionOutput({
    requestId: "fixture-task",
    sourceId: "fixture-task-capture",
    sourceLabel: "Typed capture",
    captureText: "Reply to Jordan about the summer operating plan",
    intent: "task",
    destinationLabel: "Inbox task draft",
    title: "Reply to Jordan about the summer operating plan",
    summary: summaryForIntent("task"),
    fields: fieldsForIntent("task", "Reply to Jordan about the summer operating plan"),
  }),
  note: makeMockSuggestionOutput({
    requestId: "fixture-note",
    sourceId: "fixture-note-capture",
    sourceLabel: "Typed capture",
    captureText: "Keep context that Alex moved to Denver",
    intent: "note",
    destinationLabel: "Notes context draft",
    title: "Keep context that Alex moved to Denver",
    summary: summaryForIntent("note"),
    fields: fieldsForIntent("note", "Keep context that Alex moved to Denver"),
  }),
  followUp: makeMockSuggestionOutput({
    requestId: "fixture-follow-up",
    sourceId: "fixture-follow-up-capture",
    sourceLabel: "Typed capture",
    captureText: "Follow up with Sam after the proposal review",
    intent: "follow-up",
    destinationLabel: "Follow-up preview only",
    title: "Follow up with Sam after the proposal review",
    summary: summaryForIntent("follow-up"),
    fields: fieldsForIntent("follow-up", "Follow up with Sam after the proposal review"),
  }),
  unsure: makeMockSuggestionOutput({
    requestId: "fixture-unsure",
    sourceId: "fixture-unsure-capture",
    sourceLabel: "Typed capture",
    captureText: "Maybe figure out what this belongs to",
    intent: "unsure",
    destinationLabel: "Needs review",
    title: "Review this capture",
    summary: summaryForIntent("unsure"),
    fields: fieldsForIntent("unsure", "Maybe figure out what this belongs to"),
  }),
} as const;
