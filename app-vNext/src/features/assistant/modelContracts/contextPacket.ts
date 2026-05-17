export const assistantContextPacketVersion = "stage-20-context-v1" as const;

export const allowedAssistantContextSourceTypes = [
  "typed-capture",
  "selected-task",
  "selected-note-context",
  "selected-day-summary",
  "selected-contact-place",
  "current-route",
  "demo-fixture",
] as const;

export type AssistantContextSourceType = (typeof allowedAssistantContextSourceTypes)[number];

export type AssistantContextRoute =
  | "today"
  | "inbox"
  | "plan"
  | "notes"
  | "contacts"
  | "settings"
  | "command"
  | "unknown";

export type AssistantContextRouteSource = {
  id: string;
  sourceType: "current-route";
  sourceLabel: string;
  routeId: AssistantContextRoute;
  routeLabel: string;
  path: string;
};

export type AssistantTypedCaptureContextSource = {
  id: string;
  sourceType: "typed-capture";
  sourceLabel: string;
  text: string;
  state: "draft" | "preview";
};

export type AssistantSelectedTaskContextSource = {
  id: string;
  sourceType: "selected-task";
  sourceLabel: string;
  title: string;
  notes?: string;
  priority?: string;
  listName?: string;
  dueDate?: string;
  estimateMinutes?: number;
};

export type AssistantSelectedNoteContextSource = {
  id: string;
  sourceType: "selected-note-context";
  sourceLabel: string;
  title: string;
  excerpt: string;
  tags?: string[];
  pinned?: boolean;
  contextGroup?: string;
};

export type AssistantSelectedDaySummaryContextSource = {
  id: string;
  sourceType: "selected-day-summary";
  sourceLabel: string;
  date: string;
  dayMode: "light" | "normal" | "push" | "recovery";
  fixedCommitmentCount: number;
  openWindowCount: number;
  openMinutes: number;
  taskBlockCount: number;
};

export type AssistantSelectedContactPlaceContextSource = {
  id: string;
  sourceType: "selected-contact-place";
  sourceLabel: string;
  displayName: string;
  relationship?: string;
  currentCity?: string;
  region?: string;
  lastKnownPlace?: string;
  movedRecently?: boolean;
  visitNote?: string;
};

export type AssistantDemoFixtureContextSource = {
  id: string;
  sourceType: "demo-fixture";
  sourceLabel: string;
  fixtureName: string;
  description: string;
};

export type AssistantContextSource =
  | AssistantContextRouteSource
  | AssistantTypedCaptureContextSource
  | AssistantSelectedTaskContextSource
  | AssistantSelectedNoteContextSource
  | AssistantSelectedDaySummaryContextSource
  | AssistantSelectedContactPlaceContextSource
  | AssistantDemoFixtureContextSource;

export type AssistantContextPacketRoute = {
  routeId: AssistantContextRoute;
  routeLabel: string;
  path: string;
};

export type AssistantContextPacket = {
  version: typeof assistantContextPacketVersion;
  requestId: string;
  route: AssistantContextPacketRoute;
  readPolicy: "minimum-needed-only";
  confirmationPolicy: "suggestions-only";
  sources: AssistantContextSource[];
};

export type AssistantContextPacketValidation = {
  valid: boolean;
  errors: string[];
};

export type AssistantContextPacketInput = {
  requestId: string;
  route: AssistantContextPacketRoute;
  sources: AssistantContextSource[];
};

export const assistantContextForbiddenKeyPatterns = [
  /api[-_]?key/i,
  /auth/i,
  /billing/i,
  /cookie/i,
  /credential/i,
  /device[-_]?location/i,
  /exact[-_]?address/i,
  /firebase/i,
  /geo/i,
  /latitude/i,
  /longitude/i,
  /medical/i,
  /password/i,
  /payment/i,
  /secret/i,
  /session/i,
  /ssn/i,
  /street[-_]?address/i,
  /token/i,
];

export const assistantContextForbiddenSourceTypes = [
  "auth-session",
  "calendar-sync",
  "database-dump",
  "device-location",
  "email-inbox",
  "full-app-export",
  "map-geocoding",
  "raw-firebase-user",
  "secret",
];

const maxContextSources = 8;
const maxContextSourceJsonLength = 2400;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAllowedSourceType(value: unknown): value is AssistantContextSourceType {
  return typeof value === "string" && allowedAssistantContextSourceTypes.includes(value as AssistantContextSourceType);
}

function findForbiddenContextKeys(value: unknown, path = "packet"): string[] {
  if (!isRecord(value) && !Array.isArray(value)) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findForbiddenContextKeys(item, `${path}[${index}]`));
  }

  return Object.entries(value).flatMap(([key, entryValue]) => {
    const nextPath = `${path}.${key}`;
    const keyErrors = assistantContextForbiddenKeyPatterns.some((pattern) => pattern.test(key))
      ? [nextPath]
      : [];

    return [...keyErrors, ...findForbiddenContextKeys(entryValue, nextPath)];
  });
}

function sourceJsonLength(source: unknown) {
  try {
    return JSON.stringify(source).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function createAssistantContextPacket(input: AssistantContextPacketInput): AssistantContextPacket {
  const routeSource: AssistantContextRouteSource = {
    id: `${input.requestId}-route`,
    sourceType: "current-route",
    sourceLabel: "Current route",
    routeId: input.route.routeId,
    routeLabel: input.route.routeLabel,
    path: input.route.path,
  };
  const sourcesWithoutRoute = input.sources.filter((source) => source.sourceType !== "current-route");

  return {
    version: assistantContextPacketVersion,
    requestId: input.requestId,
    route: input.route,
    readPolicy: "minimum-needed-only",
    confirmationPolicy: "suggestions-only",
    sources: [routeSource, ...sourcesWithoutRoute],
  };
}

export function validateAssistantContextPacket(value: unknown): AssistantContextPacketValidation {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["Context packet must be an object."],
    };
  }

  if (value.version !== assistantContextPacketVersion) {
    errors.push(`Context packet version must be ${assistantContextPacketVersion}.`);
  }

  if (value.readPolicy !== "minimum-needed-only") {
    errors.push("Context packet must use minimum-needed-only read policy.");
  }

  if (value.confirmationPolicy !== "suggestions-only") {
    errors.push("Context packet must use suggestions-only confirmation policy.");
  }

  const sources = Array.isArray(value.sources) ? value.sources : [];

  if (!Array.isArray(value.sources)) {
    errors.push("Context packet sources must be an array.");
  }

  if (sources.length === 0) {
    errors.push("Context packet must include at least one source.");
  }

  if (sources.length > maxContextSources) {
    errors.push(`Context packet may include at most ${maxContextSources} sources.`);
  }

  const forbiddenKeys = findForbiddenContextKeys(value);
  if (forbiddenKeys.length) {
    errors.push(`Context packet includes forbidden key(s): ${forbiddenKeys.join(", ")}.`);
  }

  const hasRouteSource = sources.some((source) => isRecord(source) && source.sourceType === "current-route");
  if (!hasRouteSource) {
    errors.push("Context packet must include a current-route source.");
  }

  sources.forEach((source, index) => {
    if (!isRecord(source)) {
      errors.push(`Source ${index + 1} must be an object.`);
      return;
    }

    if (typeof source.id !== "string" || !source.id.trim()) {
      errors.push(`Source ${index + 1} must include a stable id.`);
    }

    if (typeof source.sourceLabel !== "string" || !source.sourceLabel.trim()) {
      errors.push(`Source ${index + 1} must include a source label.`);
    }

    if (!isAllowedSourceType(source.sourceType)) {
      errors.push(`Source ${index + 1} has unsupported source type: ${String(source.sourceType)}.`);
    }

    if (
      typeof source.sourceType === "string" &&
      assistantContextForbiddenSourceTypes.includes(source.sourceType)
    ) {
      errors.push(`Source ${index + 1} uses forbidden source type: ${source.sourceType}.`);
    }

    if (sourceJsonLength(source) > maxContextSourceJsonLength) {
      errors.push(`Source ${index + 1} is too broad for a model context packet.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
