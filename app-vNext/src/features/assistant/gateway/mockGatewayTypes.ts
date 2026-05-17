import type {
  AssistantContextPacket,
  AssistantContextRoute,
  AssistantContextSourceType,
} from "../modelContracts/contextPacket";
import type { AssistantPromptId } from "../prompts/promptRegistry";

export const mockGatewayRequestVersion = "stage-21-gateway-request-v1" as const;

export const mockGatewayAllowedPromptId = "intake-suggestion" as const satisfies AssistantPromptId;

export const mockGatewayAllowedSurface = "inbox" as const;

export const mockGatewayAllowedRouteId = "inbox" as const satisfies AssistantContextRoute;

export const mockGatewayAllowedSourceTypes = [
  "current-route",
  "typed-capture",
  "demo-fixture",
] as const satisfies AssistantContextSourceType[];

export type MockGatewayAllowedSourceType = (typeof mockGatewayAllowedSourceTypes)[number];

export type MockGatewaySurface = typeof mockGatewayAllowedSurface;

export type MockGatewayRequestEnvelope = {
  requestVersion: typeof mockGatewayRequestVersion;
  promptId: typeof mockGatewayAllowedPromptId;
  surface: MockGatewaySurface;
  contextPacket: AssistantContextPacket;
};

export type MockGatewayRequestValidation = {
  valid: boolean;
  errors: string[];
  request?: MockGatewayRequestEnvelope;
};

export type MockGatewayTypedCaptureRequestInput = {
  requestId: string;
  typedCaptureText: string;
  includeDemoFixture?: boolean;
};
