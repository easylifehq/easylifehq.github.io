import {
  createAssistantContextPacket,
  type AssistantContextSource,
} from "../modelContracts/contextPacket";
import {
  createMockGatewayTypedCaptureRequest,
  validateMockGatewayRequest,
} from "./mockGatewayRequest";

const validMockRequest = createMockGatewayTypedCaptureRequest({
  requestId: "stage-22-mock-request-proof",
  typedCaptureText: "Draft a follow-up task for a demo conversation",
  includeDemoFixture: true,
});

const unsupportedPromptRequest = {
  ...validMockRequest,
  promptId: "today-context-read",
};

const nonInboxRouteRequest = {
  ...validMockRequest,
  contextPacket: createAssistantContextPacket({
    requestId: "stage-22-wrong-route",
    route: {
      routeId: "today",
      routeLabel: "Today",
      path: "/app/hq",
    },
    sources: [
      {
        id: "capture-1",
        sourceType: "typed-capture",
        sourceLabel: "Typed capture",
        text: "This should stay in Inbox for the first mock gateway.",
        state: "draft",
      },
    ],
  }),
};

const selectedTaskContextRequest = {
  ...validMockRequest,
  contextPacket: createAssistantContextPacket({
    requestId: "stage-22-selected-task-context",
    route: {
      routeId: "inbox",
      routeLabel: "Inbox",
      path: "/app/easylist/add",
    },
    sources: [
      {
        id: "capture-1",
        sourceType: "typed-capture",
        sourceLabel: "Typed capture",
        text: "Draft a task from this only.",
        state: "draft",
      },
      {
        id: "task-1",
        sourceType: "selected-task",
        sourceLabel: "Selected task",
        title: "This source type is too broad for Stage 22 Task 1.",
      },
    ],
  }),
};

const forbiddenSourceContextRequest = {
  ...validMockRequest,
  contextPacket: {
    version: "stage-20-context-v1",
    requestId: "stage-22-forbidden-context",
    route: {
      routeId: "inbox",
      routeLabel: "Inbox",
      path: "/app/easylist/add",
    },
    readPolicy: "minimum-needed-only",
    confirmationPolicy: "suggestions-only",
    sources: [
      {
        id: "route-1",
        sourceType: "current-route",
        sourceLabel: "Current route",
        routeId: "inbox",
        routeLabel: "Inbox",
        path: "/app/easylist/add",
      },
      {
        id: "capture-1",
        sourceType: "typed-capture",
        sourceLabel: "Typed capture",
        text: "Draft safely.",
        state: "draft",
      },
      {
        id: "dump-1",
        sourceType: "full-app-export",
        sourceLabel: "Everything",
        databaseDump: [{ title: "This should never be accepted" }],
      },
    ],
  },
};

const emptyCaptureRequest = createMockGatewayTypedCaptureRequest({
  requestId: "stage-22-empty-capture",
  typedCaptureText: "   ",
});

const tooManySources: AssistantContextSource[] = [
  {
    id: "capture-1",
    sourceType: "typed-capture",
    sourceLabel: "Typed capture",
    text: "Draft a task.",
    state: "draft",
  },
  {
    id: "fixture-1",
    sourceType: "demo-fixture",
    sourceLabel: "Demo fixture",
    fixtureName: "One",
    description: "Synthetic.",
  },
  {
    id: "fixture-2",
    sourceType: "demo-fixture",
    sourceLabel: "Demo fixture",
    fixtureName: "Two",
    description: "Synthetic.",
  },
  {
    id: "fixture-3",
    sourceType: "demo-fixture",
    sourceLabel: "Demo fixture",
    fixtureName: "Three",
    description: "Synthetic.",
  },
];

const tooManySourcesRequest = {
  ...validMockRequest,
  contextPacket: createAssistantContextPacket({
    requestId: "stage-22-too-many-sources",
    route: {
      routeId: "inbox",
      routeLabel: "Inbox",
      path: "/app/easylist/add",
    },
    sources: tooManySources,
  }),
};

export const mockGatewayRequestProof = [
  {
    name: "accept bounded inbox typed-capture request",
    validation: validateMockGatewayRequest(validMockRequest),
    expectedValid: true,
  },
  {
    name: "reject unsupported prompt id",
    validation: validateMockGatewayRequest(unsupportedPromptRequest),
    expectedValid: false,
  },
  {
    name: "reject non-Inbox route",
    validation: validateMockGatewayRequest(nonInboxRouteRequest),
    expectedValid: false,
  },
  {
    name: "reject selected task context",
    validation: validateMockGatewayRequest(selectedTaskContextRequest),
    expectedValid: false,
  },
  {
    name: "reject forbidden broad context",
    validation: validateMockGatewayRequest(forbiddenSourceContextRequest),
    expectedValid: false,
  },
  {
    name: "reject empty typed capture",
    validation: validateMockGatewayRequest(emptyCaptureRequest),
    expectedValid: false,
  },
  {
    name: "reject too many sources",
    validation: validateMockGatewayRequest(tooManySourcesRequest),
    expectedValid: false,
  },
].map((example) => ({
  ...example,
  passed: example.validation.valid === example.expectedValid,
}));

export const mockGatewayRequestProofPassed = mockGatewayRequestProof.every((example) => example.passed);

export const mockGatewayRequestAcceptedSourceTypes = validMockRequest.contextPacket.sources.map(
  (source) => source.sourceType,
);
