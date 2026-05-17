import {
  createAssistantContextPacket,
  validateAssistantContextPacket,
  type AssistantContextPacket,
  type AssistantContextSource,
  type AssistantContextSourceType,
} from "../modelContracts/contextPacket";
import {
  assistantPromptIds,
  type AssistantPromptId,
} from "../prompts/promptRegistry";
import {
  mockGatewayAllowedPromptId,
  mockGatewayAllowedRouteId,
  mockGatewayAllowedSourceTypes,
  mockGatewayAllowedSurface,
  mockGatewayRequestVersion,
  type MockGatewayRequestEnvelope,
  type MockGatewayRequestValidation,
  type MockGatewayTypedCaptureRequestInput,
} from "./mockGatewayTypes";

const maxMockGatewaySources = 3;
const maxTypedCaptureLength = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAllowedPromptId(value: unknown): value is AssistantPromptId {
  return typeof value === "string" && assistantPromptIds.includes(value as AssistantPromptId);
}

function isAllowedMockSourceType(value: unknown): value is AssistantContextSourceType {
  return (
    typeof value === "string" &&
    mockGatewayAllowedSourceTypes.includes(value as (typeof mockGatewayAllowedSourceTypes)[number])
  );
}

function getSources(value: unknown): unknown[] {
  if (!isRecord(value)) return [];
  return Array.isArray(value.sources) ? value.sources : [];
}

function getTypedCaptureSources(sources: unknown[]) {
  return sources.filter((source) => isRecord(source) && source.sourceType === "typed-capture");
}

function typedCaptureText(source: unknown) {
  return isRecord(source) && typeof source.text === "string" ? source.text : "";
}

export function createMockGatewayTypedCaptureRequest(
  input: MockGatewayTypedCaptureRequestInput,
): MockGatewayRequestEnvelope {
  const sources: AssistantContextSource[] = [
    {
      id: `${input.requestId}-capture`,
      sourceType: "typed-capture",
      sourceLabel: "Typed capture",
      text: input.typedCaptureText,
      state: "draft",
    },
  ];

  if (input.includeDemoFixture) {
    sources.push({
      id: `${input.requestId}-fixture`,
      sourceType: "demo-fixture",
      sourceLabel: "Demo fixture",
      fixtureName: "Stage 22 mock gateway fixture",
      description: "Synthetic local proof data only.",
    });
  }

  return {
    requestVersion: mockGatewayRequestVersion,
    promptId: mockGatewayAllowedPromptId,
    surface: mockGatewayAllowedSurface,
    contextPacket: createAssistantContextPacket({
      requestId: input.requestId,
      route: {
        routeId: mockGatewayAllowedRouteId,
        routeLabel: "Inbox",
        path: "/app/easylist/add",
      },
      sources,
    }),
  };
}

export function validateMockGatewayRequest(value: unknown): MockGatewayRequestValidation {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["Mock gateway request must be an object."],
    };
  }

  if (value.requestVersion !== mockGatewayRequestVersion) {
    errors.push(`Mock gateway request version must be ${mockGatewayRequestVersion}.`);
  }

  if (!isAllowedPromptId(value.promptId)) {
    errors.push(`Mock gateway prompt id is unsupported: ${String(value.promptId)}.`);
  } else if (value.promptId !== mockGatewayAllowedPromptId) {
    errors.push(`Mock gateway allows only ${mockGatewayAllowedPromptId}.`);
  }

  if (value.surface !== mockGatewayAllowedSurface) {
    errors.push(`Mock gateway surface must be ${mockGatewayAllowedSurface}.`);
  }

  const contextPacket = value.contextPacket;
  const contextValidation = validateAssistantContextPacket(contextPacket);
  if (!contextValidation.valid) {
    errors.push(...contextValidation.errors.map((error) => `Context packet rejected: ${error}`));
  }

  if (!isRecord(contextPacket)) {
    errors.push("Mock gateway request must include a context packet.");
  } else {
    const route = isRecord(contextPacket.route) ? contextPacket.route : {};
    if (route.routeId !== mockGatewayAllowedRouteId) {
      errors.push(`Mock gateway context route must be ${mockGatewayAllowedRouteId}.`);
    }

    if (typeof route.path !== "string" || !route.path.startsWith("/app/easylist/add")) {
      errors.push("Mock gateway context path must target the Inbox typed-capture route.");
    }

    const sources = getSources(contextPacket);
    if (sources.length > maxMockGatewaySources) {
      errors.push(`Mock gateway may include at most ${maxMockGatewaySources} sources.`);
    }

    sources.forEach((source, index) => {
      if (!isRecord(source)) {
        errors.push(`Mock gateway source ${index + 1} must be an object.`);
        return;
      }

      if (!isAllowedMockSourceType(source.sourceType)) {
        errors.push(`Mock gateway source ${index + 1} has forbidden source type: ${String(source.sourceType)}.`);
      }
    });

    const hasCurrentRoute = sources.some((source) => isRecord(source) && source.sourceType === "current-route");
    if (!hasCurrentRoute) {
      errors.push("Mock gateway request must include a current-route source.");
    }

    const typedCaptures = getTypedCaptureSources(sources);
    if (typedCaptures.length !== 1) {
      errors.push("Mock gateway request must include exactly one typed-capture source.");
    }

    const captureText = typedCaptureText(typedCaptures[0]).trim();
    if (!captureText) {
      errors.push("Mock gateway typed capture must not be empty.");
    }

    if (captureText.length > maxTypedCaptureLength) {
      errors.push(`Mock gateway typed capture may include at most ${maxTypedCaptureLength} characters.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    request: errors.length === 0 ? (value as MockGatewayRequestEnvelope) : undefined,
  };
}

export function isValidMockGatewayRequest(value: unknown): value is MockGatewayRequestEnvelope {
  return validateMockGatewayRequest(value).valid;
}

export function validateMockGatewayContextPacket(value: unknown): MockGatewayRequestValidation {
  return validateMockGatewayRequest({
    requestVersion: mockGatewayRequestVersion,
    promptId: mockGatewayAllowedPromptId,
    surface: mockGatewayAllowedSurface,
    contextPacket: value as AssistantContextPacket,
  });
}
