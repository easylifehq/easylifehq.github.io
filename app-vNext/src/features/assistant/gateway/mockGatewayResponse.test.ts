import { assistantModelOutputVersion } from "../modelContracts/modelOutputTypes";
import { createMockGatewayTypedCaptureRequest } from "./mockGatewayRequest";
import {
  createMockGatewayResponse,
  mockGatewayAcceptedResponseFixtures,
  validateMockGatewaySyntheticOutput,
} from "./mockGatewayResponse";

const taskRequest = createMockGatewayTypedCaptureRequest({
  requestId: "stage-22-response-task",
  typedCaptureText: "Reply to Riley about the construction pilot",
});

const noteRequest = createMockGatewayTypedCaptureRequest({
  requestId: "stage-22-response-note",
  typedCaptureText: "Keep context that Morgan moved to Portland",
});

const followUpRequest = createMockGatewayTypedCaptureRequest({
  requestId: "stage-22-response-follow-up",
  typedCaptureText: "Follow up with Casey after the demo",
});

const unsureRequest = createMockGatewayTypedCaptureRequest({
  requestId: "stage-22-response-unsure",
  typedCaptureText: "Maybe figure out what to do with this",
});

const hiddenActionOutput = {
  ...mockGatewayAcceptedResponseFixtures.task,
  summary: "I automatically saved this task and sent a message.",
};

const externalActionOutput = {
  ...mockGatewayAcceptedResponseFixtures.followUp,
  summary: "I sent an email and scheduled a reminder for this follow-up.",
};

const actionLikeWordingOutput = {
  ...mockGatewayAcceptedResponseFixtures.task,
  summary: "This is ready to save as an Inbox task after review.",
};

const malformedOutput = {
  ...mockGatewayAcceptedResponseFixtures.task,
  version: assistantModelOutputVersion,
  confirmation: {
    required: false,
    label: "Done",
    copy: "Saved.",
  },
};

const rejectedRequestResponse = createMockGatewayResponse({
  ...taskRequest,
  promptId: "today-context-read",
});

export const mockGatewayAcceptedResponseProof = [
  {
    name: "accept synthetic task output",
    response: validateMockGatewaySyntheticOutput(mockGatewayAcceptedResponseFixtures.task, "fixture-task"),
    expectedStatus: "ok",
    expectedSafetyState: "accepted",
    expectedIntent: "task",
  },
  {
    name: "accept synthetic note output",
    response: validateMockGatewaySyntheticOutput(mockGatewayAcceptedResponseFixtures.note, "fixture-note"),
    expectedStatus: "ok",
    expectedSafetyState: "accepted",
    expectedIntent: "note",
  },
  {
    name: "accept synthetic follow-up output",
    response: validateMockGatewaySyntheticOutput(mockGatewayAcceptedResponseFixtures.followUp, "fixture-follow-up"),
    expectedStatus: "ok",
    expectedSafetyState: "accepted",
    expectedIntent: "follow-up",
  },
  {
    name: "accept synthetic unsure output",
    response: validateMockGatewaySyntheticOutput(mockGatewayAcceptedResponseFixtures.unsure, "fixture-unsure"),
    expectedStatus: "ok",
    expectedSafetyState: "accepted",
    expectedIntent: "unsure",
  },
].map((example) => ({
  ...example,
  passed:
    example.response.status === example.expectedStatus &&
    example.response.safetyState === example.expectedSafetyState &&
    example.response.output?.intent === example.expectedIntent,
}));

export const mockGatewayGeneratedResponseProof = [
  {
    name: "generate task response from typed capture",
    response: createMockGatewayResponse(taskRequest),
    expectedIntent: "task",
  },
  {
    name: "generate note response from typed capture",
    response: createMockGatewayResponse(noteRequest),
    expectedIntent: "note",
  },
  {
    name: "generate follow-up response from typed capture",
    response: createMockGatewayResponse(followUpRequest),
    expectedIntent: "follow-up",
  },
  {
    name: "generate unsure response from typed capture",
    response: createMockGatewayResponse(unsureRequest),
    expectedIntent: "unsure",
  },
].map((example) => ({
  ...example,
  passed:
    example.response.status === "ok" &&
    example.response.safetyState === "accepted" &&
    example.response.output?.intent === example.expectedIntent,
}));

export const mockGatewayRejectedResponseProof = [
  {
    name: "reject hidden autosave and message claim",
    response: validateMockGatewaySyntheticOutput(hiddenActionOutput, "fixture-hidden-action"),
  },
  {
    name: "reject external email/scheduling claim",
    response: validateMockGatewaySyntheticOutput(externalActionOutput, "fixture-external-action"),
  },
  {
    name: "reject malformed confirmation",
    response: validateMockGatewaySyntheticOutput(malformedOutput, "fixture-malformed"),
  },
  {
    name: "reject invalid request before output",
    response: rejectedRequestResponse,
  },
].map((example) => ({
  ...example,
  passed:
    example.response.status === "fallback" &&
    example.response.safetyState === "rejected" &&
    !example.response.output,
}));

export const mockGatewayDowngradedResponseProof = [
  {
    name: "downgrade action-like save wording",
    response: validateMockGatewaySyntheticOutput(actionLikeWordingOutput, "fixture-action-like"),
  },
].map((example) => ({
  ...example,
  passed:
    example.response.status === "ok" &&
    example.response.safetyState === "downgraded" &&
    example.response.output?.state === "needs-review" &&
    example.response.output.destinationLabel === "Needs review",
}));

export const mockGatewayResponseProofPassed = [
  ...mockGatewayAcceptedResponseProof,
  ...mockGatewayGeneratedResponseProof,
  ...mockGatewayRejectedResponseProof,
  ...mockGatewayDowngradedResponseProof,
].every((example) => example.passed);

export const mockGatewayInvalidOutputsSuppressed = mockGatewayRejectedResponseProof.every(
  (example) => !example.response.output,
);
