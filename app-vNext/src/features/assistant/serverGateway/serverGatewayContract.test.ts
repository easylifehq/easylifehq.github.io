import {
  createAssistantContextPacket,
  type AssistantContextSource,
} from "../modelContracts/contextPacket";
import {
  createServerGatewayFallbackEnvelope,
  createServerGatewayTypedCaptureRequest,
  serverGatewayAllowedContextPacketVersion,
  serverGatewayAllowedOutputVersion,
  serverGatewayExpectedOutputSchemaName,
  serverGatewayNetworkCallState,
  serverGatewayProviderCallState,
  serverGatewayRequestVersion,
  serverGatewayResponseVersion,
  validateServerGatewayRequest,
  type ServerGatewayResponseEnvelope,
} from "./serverGatewayTypes";

const validServerGatewayRequest = createServerGatewayTypedCaptureRequest({
  requestId: "stage-24-server-adapter-contract-proof",
  typedCaptureText: "Draft a task to follow up after the summer plan review",
  includeDemoFixture: true,
});

const unsupportedPromptRequest = {
  ...validServerGatewayRequest,
  promptId: "today-context-read",
};

const wrongSchemaRequest = {
  ...validServerGatewayRequest,
  expectedOutputSchemaName: "AssistantTodayReadOutputV1",
};

const nonInboxRouteRequest = {
  ...validServerGatewayRequest,
  contextPacket: createAssistantContextPacket({
    requestId: "stage-24-wrong-route",
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
        text: "This must stay bound to Inbox.",
        state: "draft",
      },
    ],
  }),
};

const selectedTaskContextRequest = {
  ...validServerGatewayRequest,
  contextPacket: createAssistantContextPacket({
    requestId: "stage-24-selected-task-context",
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
        text: "Draft only from this visible capture.",
        state: "draft",
      },
      {
        id: "task-1",
        sourceType: "selected-task",
        sourceLabel: "Selected task",
        title: "Too broad for the first server adapter contract.",
      },
    ],
  }),
};

const broadContextRequest = {
  ...validServerGatewayRequest,
  contextPacket: {
    version: "stage-20-context-v1",
    requestId: "stage-24-broad-context",
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
        sourceType: "database-dump",
        sourceLabel: "Everything",
        databaseDump: [{ title: "This should never reach the server adapter." }],
      },
    ],
  },
};

const emptyCaptureRequest = createServerGatewayTypedCaptureRequest({
  requestId: "stage-24-empty-capture",
  typedCaptureText: "   ",
});

const providerConfigRequest = {
  ...validServerGatewayRequest,
  providerApiKey: "not-a-real-key",
};

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
  ...validServerGatewayRequest,
  contextPacket: createAssistantContextPacket({
    requestId: "stage-24-too-many-sources",
    route: {
      routeId: "inbox",
      routeLabel: "Inbox",
      path: "/app/easylist/add",
    },
    sources: tooManySources,
  }),
};

const fallback = createServerGatewayFallbackEnvelope("ai-disabled", {
  requestLike: validServerGatewayRequest,
});

const fallbackResponse: ServerGatewayResponseEnvelope = {
  responseVersion: serverGatewayResponseVersion,
  requestId: validServerGatewayRequest.contextPacket.requestId,
  status: "fallback",
  requestValidationState: "accepted",
  outputValidationState: "rejected",
  fallback,
  errors: [],
  warnings: [],
  providerCallState: serverGatewayProviderCallState,
  networkCallState: serverGatewayNetworkCallState,
  externalActions: false,
  hiddenWrites: false,
};

export const serverGatewayContractProof = [
  {
    name: "accept bounded Inbox typed-capture request",
    validation: validateServerGatewayRequest(validServerGatewayRequest),
    expectedValid: true,
  },
  {
    name: "reject unsupported prompt id",
    validation: validateServerGatewayRequest(unsupportedPromptRequest),
    expectedValid: false,
  },
  {
    name: "reject unsupported output schema",
    validation: validateServerGatewayRequest(wrongSchemaRequest),
    expectedValid: false,
  },
  {
    name: "reject non-Inbox route",
    validation: validateServerGatewayRequest(nonInboxRouteRequest),
    expectedValid: false,
  },
  {
    name: "reject selected task context",
    validation: validateServerGatewayRequest(selectedTaskContextRequest),
    expectedValid: false,
  },
  {
    name: "reject broad context",
    validation: validateServerGatewayRequest(broadContextRequest),
    expectedValid: false,
  },
  {
    name: "reject empty typed capture",
    validation: validateServerGatewayRequest(emptyCaptureRequest),
    expectedValid: false,
  },
  {
    name: "reject provider config in request envelope",
    validation: validateServerGatewayRequest(providerConfigRequest),
    expectedValid: false,
  },
  {
    name: "reject too many sources",
    validation: validateServerGatewayRequest(tooManySourcesRequest),
    expectedValid: false,
  },
].map((example) => ({
  ...example,
  passed: example.validation.valid === example.expectedValid,
}));

export const serverGatewayContractProofPassed = serverGatewayContractProof.every((example) => example.passed);

export const serverGatewayContractAnchors = {
  requestVersion: serverGatewayRequestVersion,
  contextVersion: serverGatewayAllowedContextPacketVersion,
  outputVersion: serverGatewayAllowedOutputVersion,
  outputSchemaName: serverGatewayExpectedOutputSchemaName,
  promptId: validServerGatewayRequest.promptId,
  sourceTypes: validServerGatewayRequest.contextPacket.sources.map((source) => source.sourceType),
};

export const serverGatewayNoProviderResponseProof = {
  response: fallbackResponse,
  passed:
    fallbackResponse.providerCallState === "not-called" &&
    fallbackResponse.networkCallState === "not-called" &&
    fallbackResponse.externalActions === false &&
    fallbackResponse.hiddenWrites === false &&
    fallbackResponse.fallback?.preservesTypedCapture === true,
};
