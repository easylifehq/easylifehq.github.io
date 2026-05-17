import type { AssistantContextSource } from "../modelContracts/contextPacket";
import {
  createServerGatewayTypedCaptureRequest,
  type ServerGatewayRequestEnvelope,
} from "./serverGatewayTypes";
import { liveAiAllowedPromptId, liveAiAllowedRoutePath } from "./liveAiEnvironment";
import {
  providerRequestSanitizerAllowedTypedCaptureLabels,
  sanitizeProviderDryRunRequest,
} from "./providerRequestSanitizer";

type SanitizerFixture = {
  name: string;
  value: unknown;
  expectedValid: boolean;
  errorIncludes?: string;
};

function stage30Request(input?: {
  requestId?: string;
  typedCaptureText?: string;
  typedCaptureLabel?: (typeof providerRequestSanitizerAllowedTypedCaptureLabels)[number] | "Typed capture";
  includeDemoFixture?: boolean;
}): ServerGatewayRequestEnvelope {
  const request = createServerGatewayTypedCaptureRequest({
    requestId: input?.requestId ?? "stage-30-sanitizer-proof",
    typedCaptureText: input?.typedCaptureText ?? "Draft a task to review the synthetic pilot notes.",
    includeDemoFixture: input?.includeDemoFixture ?? true,
  });

  request.contextPacket.route.path = liveAiAllowedRoutePath;
  request.contextPacket.sources = request.contextPacket.sources.map((source) => {
    if (source.sourceType === "current-route") {
      return {
        ...source,
        path: liveAiAllowedRoutePath,
      };
    }

    if (source.sourceType === "typed-capture") {
      return {
        ...source,
        sourceLabel: input?.typedCaptureLabel ?? "Synthetic typed capture",
      };
    }

    return source;
  });

  return request;
}

function privateAlphaRequest() {
  return stage30Request({
    requestId: "stage-30-private-alpha-proof",
    typedCaptureText: "Draft a task to check the private alpha sample capture.",
    typedCaptureLabel: "Private alpha typed capture",
    includeDemoFixture: false,
  });
}

const unsupportedSource: AssistantContextSource = {
  id: "stage-30-contact-source",
  sourceType: "selected-contact-place",
  sourceLabel: "Contact place",
  displayName: "Fictional Person",
  currentCity: "Fictional City",
};

const broadTaskSource = {
  id: "stage-30-task-list",
  sourceType: "typed-capture",
  sourceLabel: "Synthetic typed capture",
  text: "Draft a task from this synthetic capture.",
  state: "draft",
  taskList: ["private task 1", "private task 2"],
};

const providerKeyRequest = {
  ...stage30Request(),
  providerApiKey: "sk-this-value-must-not-appear-in-errors",
};

const viteSecretRequest = {
  ...stage30Request(),
  VITE_AI_PROVIDER_API_KEY: "browser-exposed-secret-placeholder",
};

const exactAddressRequest = stage30Request({
  typedCaptureText: "Draft a task to visit 123 Main Street tomorrow.",
});

const contactDetailRequest = stage30Request({
  typedCaptureText: "Draft a task to email friend@example.com about dinner.",
});

const wrongRouteRequest = stage30Request();
wrongRouteRequest.contextPacket.route.path = "/app/easylist/add";

const wrongPromptRequest = {
  ...stage30Request(),
  promptId: "today-context-read",
};

const genericTypedCaptureRequest = stage30Request({
  typedCaptureLabel: "Typed capture",
});

const contactSourceRequest = stage30Request();
contactSourceRequest.contextPacket.sources.push(unsupportedSource);

const noteBodyRequest = {
  ...stage30Request(),
  contextPacket: {
    ...stage30Request().contextPacket,
    noteBody: "This private note body must never become provider request context.",
  },
};

const calendarContentsRequest = {
  ...stage30Request(),
  contextPacket: {
    ...stage30Request().contextPacket,
    calendarContents: [{ title: "Private appointment", startsAt: "2026-05-17T10:00:00" }],
  },
};

const broadTaskListRequest = stage30Request();
broadTaskListRequest.contextPacket.sources = broadTaskListRequest.contextPacket.sources.map((source) =>
  source.sourceType === "typed-capture" ? (broadTaskSource as AssistantContextSource) : source,
);

const fullContextPacketRequest = {
  ...stage30Request(),
  fullContextPacket: {
    tasks: ["private task"],
    notes: ["private note"],
    contacts: ["private contact"],
  },
};

export const providerRequestSanitizerFixtures: SanitizerFixture[] = [
  {
    name: "accepts synthetic demo typed capture",
    value: stage30Request(),
    expectedValid: true,
  },
  {
    name: "accepts private alpha typed capture",
    value: privateAlphaRequest(),
    expectedValid: true,
  },
  {
    name: "rejects wrong route",
    value: wrongRouteRequest,
    expectedValid: false,
    errorIncludes: liveAiAllowedRoutePath,
  },
  {
    name: "rejects unsupported prompt",
    value: wrongPromptRequest,
    expectedValid: false,
    errorIncludes: liveAiAllowedPromptId,
  },
  {
    name: "rejects generic typed capture label",
    value: genericTypedCaptureRequest,
    expectedValid: false,
    errorIncludes: "synthetic or private-alpha",
  },
  {
    name: "rejects provider key envelope",
    value: providerKeyRequest,
    expectedValid: false,
    errorIncludes: "forbidden",
  },
  {
    name: "rejects VITE provider key envelope",
    value: viteSecretRequest,
    expectedValid: false,
    errorIncludes: "forbidden",
  },
  {
    name: "rejects contact source",
    value: contactSourceRequest,
    expectedValid: false,
    errorIncludes: "forbidden source type",
  },
  {
    name: "rejects exact address capture",
    value: exactAddressRequest,
    expectedValid: false,
    errorIncludes: "exact street address",
  },
  {
    name: "rejects contact detail capture",
    value: contactDetailRequest,
    expectedValid: false,
    errorIncludes: "email address",
  },
  {
    name: "rejects note body context",
    value: noteBodyRequest,
    expectedValid: false,
    errorIncludes: "forbidden",
  },
  {
    name: "rejects calendar contents",
    value: calendarContentsRequest,
    expectedValid: false,
    errorIncludes: "forbidden",
  },
  {
    name: "rejects broad task list",
    value: broadTaskListRequest,
    expectedValid: false,
    errorIncludes: "forbidden",
  },
  {
    name: "rejects full context packet",
    value: fullContextPacketRequest,
    expectedValid: false,
    errorIncludes: "forbidden",
  },
];

export const providerRequestSanitizerProof = providerRequestSanitizerFixtures.map((fixture) => {
  const result = sanitizeProviderDryRunRequest(fixture.value);
  const serializedErrors = result.errors.join(" | ");

  return {
    ...fixture,
    result,
    passed:
      result.valid === fixture.expectedValid &&
      (!fixture.errorIncludes || serializedErrors.includes(fixture.errorIncludes)),
  };
});

const acceptedSynthetic = sanitizeProviderDryRunRequest(stage30Request());
const acceptedPrivateAlpha = sanitizeProviderDryRunRequest(privateAlphaRequest());
const providerKeyResult = sanitizeProviderDryRunRequest(providerKeyRequest);

export const providerRequestSanitizerSummaryProof = [
  {
    name: "sanitized synthetic summary preserves prompt and bounded source labels",
    passed:
      acceptedSynthetic.valid &&
      acceptedSynthetic.summary?.promptId === liveAiAllowedPromptId &&
      acceptedSynthetic.summary.sourceLabels.every((source) =>
        ["current-route", "typed-capture", "demo-fixture"].includes(source.sourceType),
      ) &&
      acceptedSynthetic.summary.inputClass === "synthetic-demo" &&
      acceptedSynthetic.summary.safeForProviderDryRun === true,
  },
  {
    name: "sanitized private alpha summary stays typed-capture only",
    passed:
      acceptedPrivateAlpha.valid &&
      acceptedPrivateAlpha.summary?.inputClass === "private-alpha-typed-capture" &&
      acceptedPrivateAlpha.summary.sourceLabels.some(
        (source) => source.sourceLabel === "Private alpha typed capture",
      ) &&
      !acceptedPrivateAlpha.summary.sourceLabels.some((source) => source.sourceType === "demo-fixture"),
  },
  {
    name: "secret-like values are not echoed in sanitizer errors",
    passed:
      !providerKeyResult.valid &&
      !providerKeyResult.errors.join(" | ").includes("sk-this-value-must-not-appear-in-errors"),
  },
];

export const providerRequestSanitizerProofPassed =
  providerRequestSanitizerProof.every((fixture) => fixture.passed) &&
  providerRequestSanitizerSummaryProof.every((fixture) => fixture.passed);

export const providerRequestSanitizerProofAnchors = {
  route: acceptedSynthetic.summary?.route,
  promptId: acceptedSynthetic.summary?.promptId,
  inputClasses: [acceptedSynthetic.summary?.inputClass, acceptedPrivateAlpha.summary?.inputClass],
  acceptedSourceLabels: acceptedSynthetic.summary?.sourceLabels.map((source) => source.sourceLabel),
  removedContext: acceptedSynthetic.summary?.removedContext,
};
