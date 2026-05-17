import { assistantModelOutputVersion } from "../modelContracts/modelOutputTypes";
import {
  createServerGatewayLiveDryRunTypedCaptureRequest,
  serverGatewayLiveDryRunRoutePath,
  serverGatewayLiveDryRunSecretPlaceholder,
  validateServerGatewayLiveDryRunRequest,
} from "./serverGatewayLiveDryRunTypes";
import { runServerGatewayLiveDryRun } from "./serverGatewayLiveDryRun";

const validLiveDryRunRequest = createServerGatewayLiveDryRunTypedCaptureRequest({
  requestId: "stage-26-live-dry-run-proof",
  typedCaptureText: "Draft a task to ask Sam about the summer pilot notes.",
});

const wrongRouteRequest = createServerGatewayLiveDryRunTypedCaptureRequest({
  requestId: "stage-26-live-dry-run-wrong-route",
  typedCaptureText: "Draft a task from this synthetic capture.",
});
wrongRouteRequest.contextPacket.route.path = "/app/easylist/add";
wrongRouteRequest.contextPacket.sources = wrongRouteRequest.contextPacket.sources.map((source) =>
  source.sourceType === "current-route" ? { ...source, path: "/app/easylist/add" } : source,
);

const noDemoFixtureRequest = createServerGatewayLiveDryRunTypedCaptureRequest({
  requestId: "stage-26-live-dry-run-no-fixture",
  typedCaptureText: "Draft a task from this synthetic capture.",
});
noDemoFixtureRequest.contextPacket.sources = noDemoFixtureRequest.contextPacket.sources.filter(
  (source) => source.sourceType !== "demo-fixture",
);

const providerKeyRequest = {
  ...validLiveDryRunRequest,
  providerApiKey: "not-a-real-key",
};

let browserExecutorCallCount = 0;

const browserRuntimeResponsePromise = runServerGatewayLiveDryRun(validLiveDryRunRequest, {
  config: {
    enabled: true,
    runtime: "browser",
    providerConfigured: true,
  },
  serverOnlyProviderExecutor: () => {
    browserExecutorCallCount += 1;

    return {
      version: assistantModelOutputVersion,
      promptId: "intake-suggestion",
      outputSchemaName: "AssistantIntakeSuggestionOutputV1",
      intent: "task",
      confidence: "medium",
      state: "draft",
      destinationLabel: "Inbox task draft",
      title: "Should never run in browser",
      summary: "The browser must not call a provider executor.",
      sources: [{ sourceId: "capture", sourceLabel: "Synthetic typed capture" }],
      fields: [{ label: "Task title", value: "Should never run in browser", editable: true }],
      confirmation: {
        required: true,
        label: "Review only",
        copy: "Nothing has been saved or sent.",
      },
      warnings: [],
    };
  },
});

const disabledResponsePromise = runServerGatewayLiveDryRun(validLiveDryRunRequest);

const unconfiguredResponsePromise = runServerGatewayLiveDryRun(validLiveDryRunRequest, {
  config: {
    enabled: true,
    runtime: "server",
    providerConfigured: false,
  },
});

const acceptedServerExecutorResponsePromise = runServerGatewayLiveDryRun(validLiveDryRunRequest, {
  config: {
    enabled: true,
    runtime: "server",
    providerConfigured: true,
  },
  serverOnlyProviderExecutor: () => ({
    version: assistantModelOutputVersion,
    promptId: "intake-suggestion",
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent: "task",
    confidence: "medium",
    state: "draft",
    destinationLabel: "Inbox task draft",
    title: "Ask Sam about summer pilot notes",
    summary: "Draft a task from the synthetic capture. Nothing is saved or sent.",
    sources: [{ sourceId: "stage-26-live-dry-run-proof-capture", sourceLabel: "Synthetic typed capture" }],
    fields: [{ label: "Task title", value: "Ask Sam about summer pilot notes", editable: true }],
    confirmation: {
      required: true,
      label: "Review only",
      copy: "Nothing is saved until you use an existing save action.",
    },
    warnings: [],
  }),
});

export const serverGatewayLiveDryRunRequestProof = [
  {
    name: "accepts Stage 26 synthetic demo route",
    validation: validateServerGatewayLiveDryRunRequest(validLiveDryRunRequest),
    expectedValid: true,
  },
  {
    name: "rejects non-demo Inbox route",
    validation: validateServerGatewayLiveDryRunRequest(wrongRouteRequest),
    expectedValid: false,
  },
  {
    name: "rejects missing demo fixture",
    validation: validateServerGatewayLiveDryRunRequest(noDemoFixtureRequest),
    expectedValid: false,
  },
  {
    name: "rejects provider key in request",
    validation: validateServerGatewayLiveDryRunRequest(providerKeyRequest),
    expectedValid: false,
  },
].map((example) => ({
  ...example,
  passed: example.validation.valid === example.expectedValid,
}));

export const serverGatewayLiveDryRunRequestProofPassed =
  serverGatewayLiveDryRunRequestProof.every((example) => example.passed);

export async function serverGatewayLiveDryRunRuntimeProof() {
  const disabledResponse = await disabledResponsePromise;
  const browserRuntimeResponse = await browserRuntimeResponsePromise;
  const unconfiguredResponse = await unconfiguredResponsePromise;
  const acceptedServerExecutorResponse = await acceptedServerExecutorResponsePromise;

  return [
    {
      name: "gateway is disabled by default",
      passed:
        disabledResponse.status === "fallback" &&
        disabledResponse.fallback?.reason === "ai-disabled" &&
        disabledResponse.providerCallState === "not-called" &&
        disabledResponse.metadataLog.providerCallAttempted === false,
    },
    {
      name: "browser runtime never calls provider executor",
      passed:
        browserRuntimeResponse.status === "fallback" &&
        browserRuntimeResponse.fallback?.reason === "server-only-required" &&
        browserRuntimeResponse.directBrowserProviderRequest === false &&
        browserExecutorCallCount === 0,
    },
    {
      name: "server runtime without provider config falls back",
      passed:
        unconfiguredResponse.status === "fallback" &&
        unconfiguredResponse.fallback?.reason === "provider-unconfigured" &&
        unconfiguredResponse.providerCallState === "not-called",
    },
    {
      name: "server-only executor output still passes validation before render",
      passed:
        acceptedServerExecutorResponse.status === "ok" &&
        acceptedServerExecutorResponse.outputValidationState === "accepted" &&
        acceptedServerExecutorResponse.output?.promptId === "intake-suggestion" &&
        acceptedServerExecutorResponse.providerCallState === "called-by-server-executor",
    },
    {
      name: "response never exposes frontend secrets or direct provider details",
      passed: [
        disabledResponse,
        browserRuntimeResponse,
        unconfiguredResponse,
        acceptedServerExecutorResponse,
      ].every(
        (response) =>
          response.frontendSecretExposure === false &&
          response.directBrowserProviderRequest === false &&
          response.secretPlaceholder === serverGatewayLiveDryRunSecretPlaceholder &&
          response.externalActions === false &&
          response.hiddenWrites === false,
      ),
    },
  ];
}

export const serverGatewayLiveDryRunProofAnchors = {
  route: serverGatewayLiveDryRunRoutePath,
  promptId: validLiveDryRunRequest.promptId,
  contextVersion: validLiveDryRunRequest.contextPacket.version,
  sourceTypes: validLiveDryRunRequest.contextPacket.sources.map((source) => source.sourceType),
  secretPlaceholder: serverGatewayLiveDryRunSecretPlaceholder,
};
