const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const openAiApiKey = defineSecret("OPENAI_API_KEY");

const allowedCorsOrigins = [
  "https://easylifehq.github.io",
  "https://www.easylifehq.com",
  "https://easylifehq.com",
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

const taskRowsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    rows: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description:
              "A concise action-oriented task title, ideally 3-9 words, starting with a verb when natural. Do not include due dates, priority words, or long backstory.",
          },
          category: {
            type: "string",
            description:
              "Short category like School, Work, Gym, Personal, Social, Finance, Home, Health, or blank if unclear.",
          },
          dueDate: {
            type: ["string", "null"],
            description: "Due date in YYYY-MM-DD format, or null if there is no clear date.",
          },
          estimatedLength: {
            type: ["integer", "null"],
            description: "Estimated minutes, or null if no duration is implied.",
          },
          priorityTier: {
            type: "integer",
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            description: "1 is highest urgency and 10 is lowest urgency.",
          },
          notes: {
            type: "string",
            description:
              "Short extra context from the brain dump that should not be lost, especially names, constraints, or why the task matters.",
          },
        },
        required: ["title", "category", "dueDate", "estimatedLength", "priorityTier", "notes"],
      },
    },
  },
  required: ["rows"],
};

const projectPlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description: "A short, practical 1-2 sentence summary of the project plan.",
    },
    risks: {
      type: "array",
      maxItems: 5,
      items: { type: "string" },
      description: "Short risk, constraint, or decision notes the user should know before starting.",
    },
    sections: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description: "A clear project phase or workstream title.",
          },
          goal: {
            type: "string",
            description: "A short explanation of what this section accomplishes.",
          },
          suggestedDueDate: {
            type: ["string", "null"],
            description: "Suggested section due date in YYYY-MM-DD format, or null if no target date is available.",
          },
          tasks: {
            type: "array",
            minItems: 2,
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: {
                  type: "string",
                  description: "A concise action-oriented task title.",
                },
                notes: {
                  type: "string",
                  description: "Short context, acceptance detail, or suggestion for the task.",
                },
                dueDate: {
                  type: ["string", "null"],
                  description: "Suggested task due date in YYYY-MM-DD format, or null.",
                },
                estimatedLength: {
                  type: ["integer", "null"],
                  description: "Estimated minutes for the task, or null.",
                },
                priorityTier: {
                  type: "integer",
                  enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                  description: "1 is highest urgency and 10 is lowest urgency.",
                },
              },
              required: ["title", "notes", "dueDate", "estimatedLength", "priorityTier"],
            },
          },
        },
        required: ["title", "goal", "suggestedDueDate", "tasks"],
      },
    },
  },
  required: ["summary", "risks", "sections"],
};

const assistantIntakeSuggestionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: {
      type: "string",
      enum: ["task", "note", "plan", "reminder", "follow-up", "unsure"],
      description: "The best local assistant intent for the typed capture.",
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "needs-review"],
      description: "Use needs-review when the intent, destination, or fields are ambiguous.",
    },
    state: {
      type: "string",
      enum: ["draft", "preview", "needs-review"],
      description: "The suggestion is never saved. It is only a reviewable draft or preview.",
    },
    destinationLabel: {
      type: "string",
      enum: ["Inbox review", "Inbox task draft", "Notes context draft", "Plan preview", "Reminder preview", "Follow-up preview"],
      description: "Where the suggestion may be reviewed. This is not a saved destination.",
    },
    sources: {
      type: "array",
      minItems: 1,
      maxItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          sourceId: { type: "string" },
          sourceLabel: { type: "string" },
        },
        required: ["sourceId", "sourceLabel"],
      },
      description: "The source must be the typed capture only.",
    },
    title: {
      type: "string",
      description: "Short reviewable suggestion title. Do not claim anything was saved, sent, scheduled, synced, or remembered.",
    },
    summary: {
      type: "string",
      description: "One plain-language sentence explaining the draft suggestion. Do not include hidden action claims.",
    },
    fields: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          editable: { type: "boolean" },
        },
        required: ["label", "value", "editable"],
      },
    },
    warnings: {
      type: "array",
      maxItems: 3,
      items: { type: "string" },
      description: "Short warning labels only, such as 'Review before saving'.",
    },
    confirmation: {
      type: "object",
      additionalProperties: false,
      properties: {
        required: { type: "boolean" },
        label: { type: "string" },
        copy: { type: "string" },
      },
      required: ["required", "label", "copy"],
      description: "Explicit approval requirement. Nothing is saved or sent.",
    },
  },
  required: [
    "intent",
    "confidence",
    "state",
    "destinationLabel",
    "sources",
    "title",
    "summary",
    "fields",
    "warnings",
    "confirmation",
  ],
};

function readOutputText(responseBody) {
  if (typeof responseBody.output_text === "string") {
    return responseBody.output_text;
  }

  return (responseBody.output || [])
    .flatMap((outputItem) => outputItem.content || [])
    .map((contentItem) => contentItem.text || "")
    .filter(Boolean)
    .join("\n");
}

function normalizeRow(row) {
  return {
    title: String(row.title || "").trim(),
    category: String(row.category || "").trim(),
    dueDate: typeof row.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.dueDate) ? row.dueDate : null,
    estimatedLength:
      Number.isInteger(row.estimatedLength) && row.estimatedLength > 0 ? Math.min(row.estimatedLength, 1440) : null,
    priorityTier: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(row.priorityTier))
      ? Number(row.priorityTier)
      : 5,
    notes: String(row.notes || "").trim(),
  };
}

function normalizeProjectTask(task) {
  return {
    title: String(task.title || "").trim(),
    notes: String(task.notes || "").trim(),
    dueDate: typeof task.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) ? task.dueDate : null,
    estimatedLength:
      Number.isInteger(task.estimatedLength) && task.estimatedLength > 0
        ? Math.min(task.estimatedLength, 1440)
        : null,
    priorityTier: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(task.priorityTier))
      ? Number(task.priorityTier)
      : 5,
  };
}

function normalizeProjectSection(section) {
  const tasks = Array.isArray(section.tasks)
    ? section.tasks.map(normalizeProjectTask).filter((task) => task.title).slice(0, 8)
    : [];

  return {
    title: String(section.title || "").trim(),
    goal: String(section.goal || "").trim(),
    suggestedDueDate:
      typeof section.suggestedDueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(section.suggestedDueDate)
        ? section.suggestedDueDate
        : null,
    tasks,
  };
}

const taskExtractionInstructions = [
  "You are the EasyList task extraction editor.",
  "The user may ramble in one huge paragraph. Your job is to find the actionable tasks hiding inside it and turn them into clean editable rows.",
  "Create one row per real action the user can do. Split separate actions even if they are in the same sentence.",
  "Do not create tasks for feelings, background, explanations, or vague worries unless there is a clear action. Put useful context in notes instead.",
  "Do not over-split a single task into tiny fragments. For example, 'email Sam about the meeting' is one task, not separate email and meeting tasks.",
  "Rewrite messy phrasing into a clear task title while preserving the user's intent.",
  "If the user says they need to remember, figure out what the thing to do is and title that as the task.",
  "Infer categories from context, not just hashtags. School/work/gym/home/personal/social/finance/health are all acceptable.",
  "Infer due dates only when the text clearly implies them. Convert relative dates using the current date. If unclear, use null.",
  "Infer estimatedLength only from explicit or strongly implied durations. If unclear, use null.",
  "Use the EasyList 1-10 urgency scale: 1 should've been done yesterday/emergency, 2 hair-on-fire urgent, 3 do next, 4 very important, 5 important, 6 normal, 7 soon-ish, 8 when there's room, 9 low simmer, 10 nice to have one day.",
  "If the user mentions a clear date phrase, return the date in dueDate so the app can show it for review before anything is saved.",
  "Remove duplicates and combine repeated mentions into the clearest single row.",
  "Keep notes short. Notes should help the user remember context, not repeat the title.",
  "Return no more than 20 rows, prioritizing the most actionable or time-sensitive tasks.",
].join(" ");

const projectPlanningInstructions = [
  "You are the EasyProjects planning assistant.",
  "Create a practical, editable project plan from the user's goal, description, and optional target date.",
  "The output will be reviewed by the user before anything is created, so make it useful but not overbearing.",
  "Organize the plan into 2-6 sections or phases. Each section should have 2-8 concrete tasks.",
  "Task titles should be action-oriented and short enough to scan in a project board.",
  "Use notes for acceptance details, constraints, or helpful suggestions. Keep notes concise.",
  "If a target date is provided, spread due dates realistically between the current date and target date.",
  "If no target date is provided, use null for due dates unless the user provided a clear date.",
  "Use the EasyList 1-10 urgency scale for generated tasks: 1 emergency, 5 important, 6 normal, and 10 someday/nice-to-have.",
  "Prefer realistic sequencing: discovery, decisions, creation, review, polish, launch, and follow-up when they fit.",
  "Include risks only when they help the user start smarter. Do not manufacture scary warnings.",
  "Do not create vague filler tasks like 'work on project'. Make every task something the user can act on.",
].join(" ");

function getFirebaseBearerToken(request) {
  const authHeader = request.get("authorization") || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
}

const assistantIntakeAllowedRoute = "/app/easylist/add?demo=1";
const assistantIntakeAllowedPromptId = "intake-suggestion";
const assistantIntakeMinTypedCaptureLength = 3;
const assistantIntakeMaxTypedCaptureLength = 2000;
const assistantIntakeResponseVersion = "stage-32-assistant-intake-response-v1";
const assistantIntakeProviderEnabledEnvName = "ASSISTANT_INTAKE_PROVIDER_ENABLED";
const assistantIntakeAllowedBodyKeys = new Set([
  "route",
  "promptId",
  "typedCapture",
  "metadata",
  "liveCallRequested",
]);
const assistantIntakeAllowedMetadataKeys = new Set(["source", "captureId", "clientVersion", "reviewMode"]);
const assistantIntakeAllowedIntents = new Set(["task", "note", "plan", "reminder", "follow-up", "unsure"]);
const assistantIntakeAllowedConfidence = new Set(["low", "medium", "needs-review"]);
const assistantIntakeAllowedStates = new Set(["draft", "preview", "needs-review"]);
const assistantIntakeAllowedDestinations = new Set([
  "Inbox review",
  "Inbox task draft",
  "Notes context draft",
  "Plan preview",
  "Reminder preview",
  "Follow-up preview",
]);
const assistantIntakeAllowedSourceIds = new Set(["assistant-intake-typed-capture"]);
const assistantIntakeAllowedSourceLabels = new Set(["Typed capture"]);
const assistantIntakeHiddenWriteClaimPatterns = [
  /\b(?:i\s+)?saved\b/i,
  /\b(?:created|added|filed|stored|wrote|updated)\s+(?:the\s+)?(?:task|note|context|draft|item|record)\b/i,
  /\b(?:task|note|context|draft|item|record)\s+(?:was|is|has been)\s+(?:saved|created|added|stored|updated)\b/i,
  /\b(?:autosaved|auto-saved|automatically saved|saved automatically)\b/i,
];
const assistantIntakeExternalActionClaimPatterns = [
  /\b(?:sent|emailed|texted|messaged|called)\b/i,
  /\b(?:scheduled|booked|created)\s+(?:a\s+)?(?:reminder|notification|calendar|event|meeting)\b/i,
  /\b(?:synced|synchroni[sz]ed)\b/i,
  /\b(?:geocoded|located|used device location|used your location)\b/i,
];
const assistantIntakeRealMemoryClaimPatterns = [
  /\b(?:i\s+)?remembered\b/i,
  /\b(?:real\s+memory|assistant\s+memory|memory\s+(?:was|is|has been)\s+created)\b/i,
];
const assistantIntakeForbiddenKeyPattern =
  /(secret|token|auth|session|cookie|password|api.?key|openai|vite|note|notes|contact|contacts|calendar|event|events|address|location|latitude|longitude|geocode|gmail|email|phone|message|firestore|database|billing|payment|ssn|medical)/i;
const assistantIntakeForbiddenCapturePatterns = [
  {
    reason: "provider-key-shaped-text",
    pattern:
      /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/,
  },
  {
    reason: "vite-secret-name",
    pattern: /\bVITE_[A-Z0-9_]*(?:KEY|SECRET|TOKEN|OPENAI|PROVIDER|AUTH)[A-Z0-9_]*\b/i,
  },
  {
    reason: "secret-like-text",
    pattern: /\b(?:api[_-]?key|secret|access[_-]?token|auth[_-]?token|password)\s*[:=]/i,
  },
  {
    reason: "exact-address-like-text",
    pattern:
      /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|boulevard|blvd\.?|court|ct\.?|place|pl\.?|way)\b/i,
  },
  {
    reason: "coordinate-like-text",
    pattern: /\b(?:lat(?:itude)?|lng|long(?:itude)?)\s*[:=]\s*-?\d+(?:\.\d+)?/i,
  },
];

function buildAssistantIntakeFallback(payload = {}) {
  return {
    version: assistantIntakeResponseVersion,
    source: "assistantIntakeSuggestion",
    route: payload.route || assistantIntakeAllowedRoute,
    promptId: payload.promptId || assistantIntakeAllowedPromptId,
    status: payload.status || "fallback",
    authState: payload.authState || "verified",
    requestValidationState: payload.requestValidationState || "accepted",
    providerState: "not-called",
    providerCallAttempted: false,
    fallbackState: "local-disabled",
    sanitizerState: payload.sanitizerState || "accepted",
    validationState: "not-run",
    quarantineState: "not-run",
    outputState: "fallback",
    suggestion: null,
    destination: "Inbox review",
    confidence: "needs-review",
    nothingSavedOrSent: true,
    requiresApproval: true,
    hiddenWrites: false,
    externalActions: false,
    savesCreated: false,
    messagesSent: false,
    calendarChanged: false,
    notificationsCreated: false,
    realMemoryCreated: false,
    rejectionReason: payload.rejectionReason || null,
    message:
      payload.message ||
      "Live AI is still disabled. Keep using the local draft preview; nothing was saved or sent.",
  };
}

function buildAssistantIntakeProviderEnvelope(validation, suggestion) {
  return {
    version: assistantIntakeResponseVersion,
    source: "assistantIntakeSuggestion",
    route: validation.route,
    promptId: validation.promptId,
    status: "provider-output",
    authState: "verified",
    requestValidationState: "accepted",
    providerState: "called-by-server-executor",
    providerCallAttempted: true,
    fallbackState: "none",
    sanitizerState: "accepted",
    validationState: "accepted",
    quarantineState: "accepted",
    outputState: "preview",
    suggestion,
    destination: "Inbox review",
    confidence: suggestion.confidence || "needs-review",
    nothingSavedOrSent: true,
    requiresApproval: true,
    hiddenWrites: false,
    externalActions: false,
    savesCreated: false,
    messagesSent: false,
    calendarChanged: false,
    notificationsCreated: false,
    realMemoryCreated: false,
    rejectionReason: null,
    message:
      "Provider-backed suggestion returned for review only. Nothing was saved, sent, scheduled, synced, or remembered.",
  };
}

function buildAssistantIntakeProviderFallback(validation, payload = {}) {
  return {
    ...buildAssistantIntakeFallback({
      status: "fallback",
      authState: "verified",
      requestValidationState: "accepted",
      sanitizerState: "accepted",
      route: validation.route,
      promptId: validation.promptId,
      rejectionReason: payload.rejectionReason || "provider-fallback",
      message:
        payload.message ||
        "The provider path could not return a trusted suggestion. Local fallback stayed available.",
    }),
    providerState: payload.providerCallAttempted ? "called-by-server-executor" : "not-called",
    providerCallAttempted: Boolean(payload.providerCallAttempted),
    validationState: payload.validationState || "not-run",
    quarantineState: payload.quarantineState || "not-run",
  };
}

function findForbiddenAssistantIntakeKey(value, path = "body") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  for (const [key, nextValue] of Object.entries(value)) {
    const nextPath = `${path}.${key}`;
    if (assistantIntakeForbiddenKeyPattern.test(key)) {
      return { reason: "forbidden-context-key", path: nextPath };
    }

    const nested = findForbiddenAssistantIntakeKey(nextValue, nextPath);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function validateAssistantIntakeRequestBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, reason: "invalid-body" };
  }

  const bodyKeys = Object.keys(body);
  const unsupportedBodyKey = bodyKeys.find((key) => !assistantIntakeAllowedBodyKeys.has(key));
  if (unsupportedBodyKey) {
    return { ok: false, reason: "unsupported-body-key", path: `body.${unsupportedBodyKey}` };
  }

  const metadata = body.metadata;
  if (metadata !== undefined) {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      return { ok: false, reason: "invalid-metadata" };
    }

    const unsupportedMetadataKey = Object.keys(metadata).find(
      (key) => !assistantIntakeAllowedMetadataKeys.has(key)
    );
    if (unsupportedMetadataKey) {
      return { ok: false, reason: "unsupported-metadata-key", path: `body.metadata.${unsupportedMetadataKey}` };
    }
  }

  if (body.liveCallRequested !== undefined && typeof body.liveCallRequested !== "boolean") {
    return { ok: false, reason: "invalid-live-call-request-flag" };
  }

  const forbiddenKey = findForbiddenAssistantIntakeKey(body);
  if (forbiddenKey) {
    return forbiddenKey;
  }

  const route = String(body.route || "").trim();
  const promptId = String(body.promptId || "").trim();
  const typedCapture = String(body.typedCapture || "").trim();
  const typedCaptureLength = typedCapture.length;

  if (route !== assistantIntakeAllowedRoute) {
    return { ok: false, reason: "unsupported-route", route, promptId, typedCaptureLength };
  }

  if (promptId !== assistantIntakeAllowedPromptId) {
    return { ok: false, reason: "unsupported-prompt", route, promptId, typedCaptureLength };
  }

  if (!typedCapture) {
    return { ok: false, reason: "missing-typed-capture", route, promptId, typedCaptureLength };
  }

  if (typedCaptureLength < assistantIntakeMinTypedCaptureLength) {
    return { ok: false, reason: "typed-capture-too-short", route, promptId, typedCaptureLength };
  }

  if (typedCaptureLength > assistantIntakeMaxTypedCaptureLength) {
    return { ok: false, reason: "typed-capture-too-long", route, promptId, typedCaptureLength };
  }

  const forbiddenCapture = assistantIntakeForbiddenCapturePatterns.find((item) => item.pattern.test(typedCapture));
  if (forbiddenCapture) {
    return { ok: false, reason: forbiddenCapture.reason, route, promptId, typedCaptureLength };
  }

  return {
    ok: true,
    route,
    promptId,
    typedCapture,
    typedCaptureLength,
    liveCallRequested: body.liveCallRequested === true,
  };
}

function rejectAssistantIntakeRequest(response, validation, status, message) {
  response.status(status).json({
    ...buildAssistantIntakeFallback({
      status: "rejected",
      authState: "verified",
      requestValidationState: "rejected",
      sanitizerState: "rejected",
      rejectionReason: validation.reason || "rejected",
      message,
    }),
    error: "Assistant intake request rejected.",
  });
}

function isAssistantIntakeProviderGateEnabled() {
  return process.env[assistantIntakeProviderEnabledEnvName] === "true";
}

function truncateAssistantField(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function destinationForAssistantIntent(intent) {
  switch (intent) {
    case "task":
      return "Inbox task draft";
    case "note":
      return "Notes context draft";
    case "plan":
      return "Plan preview";
    case "reminder":
      return "Reminder preview";
    case "follow-up":
      return "Follow-up preview";
    default:
      return "Inbox review";
  }
}

function assistantIntakeTextMatchesAny(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function validateAssistantIntakeProviderClaims(parsed) {
  const serialized = JSON.stringify(parsed || {})
    .toLowerCase()
    .replace(/nothing\s+(?:is\s+)?saved\s+or\s+sent/g, "safe boundary")
    .replace(/nothing\s+(?:was\s+)?saved\s+or\s+sent/g, "safe boundary")
    .replace(/not\s+saved/g, "safe boundary")
    .replace(/not\s+sent/g, "safe boundary")
    .replace(/not\s+scheduled/g, "safe boundary")
    .replace(/not\s+synced/g, "safe boundary")
    .replace(/not\s+remembered/g, "safe boundary");

  if (assistantIntakeTextMatchesAny(serialized, assistantIntakeHiddenWriteClaimPatterns)) {
    return { ok: false, reason: "provider-output-hidden-write-claim" };
  }

  if (assistantIntakeTextMatchesAny(serialized, assistantIntakeExternalActionClaimPatterns)) {
    return { ok: false, reason: "provider-output-external-action-claim" };
  }

  if (assistantIntakeTextMatchesAny(serialized, assistantIntakeRealMemoryClaimPatterns)) {
    return { ok: false, reason: "provider-output-real-memory-claim" };
  }

  return { ok: true };
}

function quarantineAssistantIntakeProviderOutput(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "provider-output-invalid-shape" };
  }

  if (!assistantIntakeAllowedIntents.has(parsed.intent)) {
    return { ok: false, reason: "provider-output-unsupported-intent" };
  }

  if (!assistantIntakeAllowedConfidence.has(parsed.confidence)) {
    return { ok: false, reason: "provider-output-missing-confidence" };
  }

  if (!assistantIntakeAllowedStates.has(parsed.state)) {
    return { ok: false, reason: "provider-output-missing-draft-state" };
  }

  if (!assistantIntakeAllowedDestinations.has(parsed.destinationLabel)) {
    return { ok: false, reason: "provider-output-missing-destination" };
  }

  if (destinationForAssistantIntent(parsed.intent) !== parsed.destinationLabel && parsed.intent !== "unsure") {
    return { ok: false, reason: "provider-output-destination-mismatch" };
  }

  if (!Array.isArray(parsed.sources) || !parsed.sources.length) {
    return { ok: false, reason: "provider-output-missing-source" };
  }

  const hasTypedCaptureSource = parsed.sources.some(
    (source) =>
      source &&
      assistantIntakeAllowedSourceIds.has(source.sourceId) &&
      assistantIntakeAllowedSourceLabels.has(source.sourceLabel),
  );

  if (!hasTypedCaptureSource) {
    return { ok: false, reason: "provider-output-unsupported-source" };
  }

  if (!parsed.confirmation || parsed.confirmation.required !== true) {
    return { ok: false, reason: "provider-output-missing-approval-requirement" };
  }

  const claimValidation = validateAssistantIntakeProviderClaims(parsed);
  if (!claimValidation.ok) {
    return claimValidation;
  }

  return { ok: true };
}

function normalizeAssistantIntakeSuggestion(parsed, validation) {
  const quarantine = quarantineAssistantIntakeProviderOutput(parsed);
  if (!quarantine.ok) {
    return quarantine;
  }

  const intent = parsed.intent;
  const confidence = parsed.confidence;
  const state = parsed.state;
  const destinationLabel = parsed.destinationLabel;
  const fields = Array.isArray(parsed?.fields)
    ? parsed.fields
        .map((field) => ({
          label: truncateAssistantField(field?.label, 40),
          value: truncateAssistantField(field?.value, 160),
          editable: field?.editable !== false,
        }))
        .filter((field) => field.label && field.value)
        .slice(0, 4)
    : [];
  const warnings = Array.isArray(parsed?.warnings)
    ? parsed.warnings.map((warning) => truncateAssistantField(warning, 90)).filter(Boolean).slice(0, 3)
    : [];

  const normalized = {
    version: "stage-20-output-v1",
    promptId: assistantIntakeAllowedPromptId,
    outputSchemaName: "AssistantIntakeSuggestionOutputV1",
    intent,
    confidence,
    state,
    destinationLabel,
    title: truncateAssistantField(parsed?.title, 90) || "Review captured thought",
    summary:
      truncateAssistantField(parsed?.summary, 220) ||
      "Review this suggestion before choosing any save path.",
    sources: parsed.sources
      .map((source) => ({
        sourceId: truncateAssistantField(source?.sourceId, 60),
        sourceLabel: truncateAssistantField(source?.sourceLabel, 60),
      }))
      .filter(
        (source) =>
          assistantIntakeAllowedSourceIds.has(source.sourceId) &&
          assistantIntakeAllowedSourceLabels.has(source.sourceLabel),
      )
      .slice(0, 2),
    fields: fields.length
      ? fields
      : [
          {
            label: "Captured text",
            value: truncateAssistantField(validation.typedCapture, 160),
            editable: true,
          },
        ],
    confirmation: {
      required: true,
      label: truncateAssistantField(parsed.confirmation?.label, 40) || "Review only",
      copy: truncateAssistantField(parsed.confirmation?.copy, 120) || "Nothing is saved or sent.",
    },
    warnings,
  };

  const normalizedClaimValidation = validateAssistantIntakeProviderClaims(normalized);
  if (!normalizedClaimValidation.ok) {
    return normalizedClaimValidation;
  }

  return {
    ok: true,
    suggestion: normalized,
  };
}

async function runAssistantIntakeProviderExecutor(validation) {
  const apiKey = openAiApiKey.value();
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            "You are the EasyLife assistant intake suggestion engine.",
            "Return one reviewable suggestion for the typed capture only.",
            "Do not claim anything was saved, sent, scheduled, synced, remembered, geocoded, or done externally.",
            "The user must approve every save later in the app.",
            "Use conservative confidence and needs-review when ambiguous.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            `Route: ${assistantIntakeAllowedRoute}`,
            `Prompt: ${assistantIntakeAllowedPromptId}`,
            "Typed capture:",
            validation.typedCapture,
          ].join("\n\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "assistant_intake_suggestion",
          strict: true,
          schema: assistantIntakeSuggestionSchema,
        },
      },
    }),
  });

  const responseBody = await openAiResponse.json();

  if (!openAiResponse.ok) {
    logger.error("Assistant intake provider call failed", {
      status: openAiResponse.status,
      code: responseBody?.error?.code || "unknown",
      type: responseBody?.error?.type || "unknown",
    });
    return {
      ok: false,
      reason: "provider-error",
      providerCallAttempted: true,
    };
  }

  try {
    const parsed = JSON.parse(readOutputText(responseBody));
    const normalized = normalizeAssistantIntakeSuggestion(parsed, validation);
    return {
      ...normalized,
      providerCallAttempted: true,
    };
  } catch {
    return {
      ok: false,
      reason: "provider-output-parse-failed",
      providerCallAttempted: true,
    };
  }
}

async function verifyAssistantIntakeRequest(request, response) {
  const token = getFirebaseBearerToken(request);

  if (!token) {
    response.status(401).json({
      ...buildAssistantIntakeFallback({
        status: "auth-failed",
        authState: "missing",
        requestValidationState: "not-run",
        sanitizerState: "not-run",
        rejectionReason: "missing-auth-token",
        message: "Sign in before requesting an assistant intake suggestion. Nothing was saved or sent.",
      }),
      error: "Sign in before requesting an assistant intake suggestion.",
    });
    return null;
  }

  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    logger.warn("Rejected unauthenticated assistant intake suggestion request", {
      code: error?.code || "unknown",
    });
    response.status(401).json({
      ...buildAssistantIntakeFallback({
        status: "auth-failed",
        authState: "invalid",
        requestValidationState: "not-run",
        sanitizerState: "not-run",
        rejectionReason: "invalid-auth-token",
        message: "Your session could not be verified. Nothing was saved or sent.",
      }),
      error: "Your session could not be verified.",
    });
    return null;
  }
}

async function verifySignedInRequest(request, response, actionName) {
  const token = getFirebaseBearerToken(request);

  if (!token) {
    response.status(401).json({ error: `Sign in before using ${actionName}.` });
    return null;
  }

  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    logger.warn(`Rejected unauthenticated ${actionName} request`, error);
    response.status(401).json({ error: "Your session could not be verified." });
    return null;
  }
}

exports.assistantIntakeSuggestion = onRequest(
  {
    cors: allowedCorsOrigins,
    secrets: [openAiApiKey],
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (request, response) => {
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({
        error: "Use POST.",
        ...buildAssistantIntakeFallback({
          status: "rejected",
          requestValidationState: "rejected",
          sanitizerState: "rejected",
          rejectionReason: "method-not-allowed",
          message: "Use POST for assistant intake suggestions. Nothing was saved or sent.",
        }),
      });
      return;
    }

    const verifiedUser = await verifyAssistantIntakeRequest(request, response);
    if (!verifiedUser) return;

    const validation = validateAssistantIntakeRequestBody(request.body);

    if (!validation.ok) {
      logger.info("Rejected assistant intake suggestion request", {
        reason: validation.reason,
        path: validation.path || "not-provided",
        route: validation.route || "not-accepted",
        promptId: validation.promptId || "not-accepted",
        typedCaptureLength: validation.typedCaptureLength || 0,
      });

      const status = validation.reason === "typed-capture-too-long" ? 413 : 400;
      const message =
        validation.reason === "missing-typed-capture"
          ? "Add visible typed capture before requesting an assistant suggestion. Nothing was saved or sent."
          : validation.reason === "typed-capture-too-short"
            ? "Add a little more visible typed capture before requesting an assistant suggestion. Nothing was saved or sent."
            : validation.reason === "typed-capture-too-long"
              ? "Shorten the typed capture before requesting an assistant suggestion. Nothing was saved or sent."
              : "This assistant lane only accepts bounded Inbox typed capture. Nothing was saved or sent.";

      rejectAssistantIntakeRequest(response, validation, status, message);
      return;
    }

    const providerGateEnabled = isAssistantIntakeProviderGateEnabled();

    if (!validation.liveCallRequested || !providerGateEnabled) {
      logger.info("Assistant intake suggestion returned disabled fallback", {
        route: validation.route,
        promptId: validation.promptId,
        typedCaptureLength: validation.typedCaptureLength,
        liveCallRequested: validation.liveCallRequested,
        providerGateEnabled,
        providerState: "not-called",
        fallbackState: "local-disabled",
      });

      response.status(200).json(
        buildAssistantIntakeFallback({
          status: "fallback",
          authState: "verified",
          requestValidationState: "accepted",
          sanitizerState: "accepted",
          route: validation.route,
          promptId: validation.promptId,
          rejectionReason: validation.liveCallRequested ? "server-gate-disabled" : "live-call-not-requested",
          message:
            "The server gateway accepted this Inbox capture, but live AI is still disabled. Nothing was saved or sent.",
        })
      );
      return;
    }

    logger.info("Assistant intake suggestion provider executor starting", {
      route: validation.route,
      promptId: validation.promptId,
      typedCaptureLength: validation.typedCaptureLength,
      providerGateEnabled,
      providerState: "called-by-server-executor",
    });

    let providerResult;
    try {
      providerResult = await runAssistantIntakeProviderExecutor(validation);
    } catch {
      providerResult = {
        ok: false,
        reason: "provider-request-failed",
        providerCallAttempted: true,
      };
    }

    if (!providerResult.ok || !providerResult.suggestion) {
      logger.warn("Assistant intake suggestion provider executor returned fallback", {
        route: validation.route,
        promptId: validation.promptId,
        typedCaptureLength: validation.typedCaptureLength,
        reason: providerResult.reason || "provider-fallback",
        providerState: providerResult.providerCallAttempted ? "called-by-server-executor" : "not-called",
      });

      response.status(200).json(
        buildAssistantIntakeProviderFallback(validation, {
          providerCallAttempted: Boolean(providerResult.providerCallAttempted),
          rejectionReason: providerResult.reason || "provider-fallback",
          validationState:
            providerResult.reason === "provider-output-hidden-action-claim" ? "rejected" : "not-run",
          quarantineState:
            providerResult.reason === "provider-output-hidden-action-claim" ? "quarantined" : "not-run",
          message:
            "The provider path could not return a trusted suggestion. Local fallback stayed available and nothing was saved or sent.",
        })
      );
      return;
    }

    logger.info("Assistant intake suggestion provider executor returned trusted preview", {
      route: validation.route,
      promptId: validation.promptId,
      typedCaptureLength: validation.typedCaptureLength,
      intent: providerResult.suggestion.intent,
      confidence: providerResult.suggestion.confidence,
      providerState: "called-by-server-executor",
      nothingSavedOrSent: true,
    });

    response.status(200).json(buildAssistantIntakeProviderEnvelope(validation, providerResult.suggestion));
  }
);

function clampGmailMaxResults(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 15;
  return Math.max(1, Math.min(Math.floor(parsed), 25));
}

function getGmailHeader(payload, headerName) {
  const headers = Array.isArray(payload?.headers) ? payload.headers : [];
  const found = headers.find((header) => String(header.name || "").toLowerCase() === headerName.toLowerCase());
  return String(found?.value || "").trim();
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function foldEmailHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function buildGmailUrl(path, params = {}) {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
    } else if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

async function fetchGmailJson(accessToken, path, params, options = {}) {
  const gmailResponse = await fetch(buildGmailUrl(path, params), {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const body = await gmailResponse.json().catch(() => ({}));

  if (!gmailResponse.ok) {
    const error = new Error(body?.error?.message || "Gmail request failed.");
    error.status = gmailResponse.status;
    error.code = body?.error?.status || body?.error?.code || "gmail_error";
    throw error;
  }

  return body;
}

exports.analyzeTaskBrainDump = onRequest(
  {
    cors: allowedCorsOrigins,
    secrets: [openAiApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request, response) => {
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Use POST." });
      return;
    }

    const authHeader = request.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

    if (!token) {
      response.status(401).json({ error: "Sign in before using AI task analysis." });
      return;
    }

    try {
      await admin.auth().verifyIdToken(token);
    } catch (error) {
      logger.warn("Rejected unauthenticated task analysis request", error);
      response.status(401).json({ error: "Your session could not be verified." });
      return;
    }

    const brainDump = String(request.body?.brainDump || "").trim();

    if (!brainDump) {
      response.status(400).json({ error: "Brain dump text is required." });
      return;
    }

    if (brainDump.length > 8000) {
      response.status(413).json({ error: "Brain dump is too long. Keep it under 8,000 characters." });
      return;
    }

    const currentDate = String(request.body?.currentDate || new Date().toISOString().slice(0, 10));
    const apiKey = openAiApiKey.value();
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    try {
      const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "system",
              content: taskExtractionInstructions,
            },
            {
              role: "user",
              content: [
                `Current date: ${currentDate}.`,
                "Turn this messy brain dump into EasyList task rows.",
                "Prefer useful task extraction over line-by-line parsing.",
                "Brain dump:",
                brainDump,
              ].join("\n\n"),
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "easylist_task_rows",
              strict: true,
              schema: taskRowsSchema,
            },
          },
        }),
      });

      const responseBody = await openAiResponse.json();

      if (!openAiResponse.ok) {
        logger.error("OpenAI task analysis failed", {
          status: openAiResponse.status,
          code: responseBody?.error?.code || "unknown",
          type: responseBody?.error?.type || "unknown",
        });
        response.status(502).json({ error: "OpenAI could not analyze that brain dump." });
        return;
      }

      const parsed = JSON.parse(readOutputText(responseBody));
      const rows = Array.isArray(parsed.rows)
        ? parsed.rows.map(normalizeRow).filter((row) => row.title).slice(0, 20)
        : [];

      response.status(200).json({ rows });
    } catch (error) {
      logger.error("Task analysis request failed", error);
      response.status(500).json({ error: "Task analysis failed. Try again in a moment." });
    }
  }
);

exports.syncGmailTriage = onRequest(
  {
    cors: allowedCorsOrigins,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request, response) => {
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Use POST." });
      return;
    }

    const verifiedUser = await verifySignedInRequest(request, response, "Gmail sync");
    if (!verifiedUser) return;

    const accessToken = String(request.body?.accessToken || request.get("x-gmail-access-token") || "").trim();
    const query = String(request.body?.query || "in:inbox newer_than:30d -category:promotions").trim();
    const maxResults = clampGmailMaxResults(request.body?.maxResults);

    if (!accessToken) {
      response.status(400).json({ error: "Connect Gmail before syncing." });
      return;
    }

    if (query.length > 512) {
      response.status(413).json({ error: "Gmail query is too long." });
      return;
    }

    try {
      const searchResult = await fetchGmailJson(accessToken, "messages", {
        q: query,
        maxResults,
      });

      const messageIds = Array.isArray(searchResult.messages) ? searchResult.messages.slice(0, maxResults) : [];
      const messages = await Promise.all(
        messageIds.map(async (message) => {
          const gmailMessage = await fetchGmailJson(accessToken, `messages/${encodeURIComponent(message.id)}`, {
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });

          const receivedAtMs = Number(gmailMessage.internalDate);
          return {
            id: String(gmailMessage.id || message.id),
            threadId: String(gmailMessage.threadId || ""),
            from: getGmailHeader(gmailMessage.payload, "From") || "Unknown sender",
            subject: getGmailHeader(gmailMessage.payload, "Subject") || "No subject",
            receivedAt: Number.isFinite(receivedAtMs) ? new Date(receivedAtMs).toISOString() : getGmailHeader(gmailMessage.payload, "Date"),
            snippet: String(gmailMessage.snippet || "").replace(/\s+/g, " ").trim(),
            labels: Array.isArray(gmailMessage.labelIds) ? gmailMessage.labelIds.map(String) : [],
          };
        })
      );

      response.status(200).json({
        syncedAt: new Date().toISOString(),
        uid: verifiedUser.uid,
        query,
        messages,
      });
    } catch (error) {
      logger.error("Gmail sync failed", {
        status: error.status || 500,
        code: error.code || "unknown",
      });

      if (error.status === 401 || error.status === 403) {
        response.status(401).json({ error: "Reconnect Gmail and approve inbox access." });
        return;
      }

      response.status(502).json({ error: "Gmail sync failed. Try again in a moment." });
    }
  }
);

exports.createGmailDraft = onRequest(
  {
    cors: allowedCorsOrigins,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request, response) => {
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Use POST." });
      return;
    }

    const verifiedUser = await verifySignedInRequest(request, response, "Gmail draft creation");
    if (!verifiedUser) return;

    const accessToken = String(request.body?.accessToken || request.get("x-gmail-access-token") || "").trim();
    const to = foldEmailHeader(request.body?.to);
    const subject = foldEmailHeader(request.body?.subject);
    const body = String(request.body?.body || "").trim();
    const threadId = String(request.body?.threadId || "").trim();

    if (!accessToken) {
      response.status(400).json({ error: "Connect Gmail before creating a draft." });
      return;
    }

    if (!to || !subject || !body) {
      response.status(400).json({ error: "Draft recipient, subject, and body are required." });
      return;
    }

    if (to.length > 500 || subject.length > 300 || body.length > 12000) {
      response.status(413).json({ error: "Draft content is too long." });
      return;
    }

    const raw = base64UrlEncode(
      [
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        body,
      ].join("\r\n")
    );

    try {
      const draft = await fetchGmailJson(accessToken, "drafts", undefined, {
        method: "POST",
        body: {
          message: {
            raw,
            ...(threadId ? { threadId } : {}),
          },
        },
      });

      response.status(200).json({
        draftId: String(draft.id || ""),
        messageId: String(draft.message?.id || ""),
        threadId: String(draft.message?.threadId || threadId || ""),
      });
    } catch (error) {
      logger.error("Gmail draft creation failed", {
        status: error.status || 500,
        code: error.code || "unknown",
      });

      if (error.status === 401 || error.status === 403) {
        response.status(401).json({ error: "Reconnect Gmail and approve draft access." });
        return;
      }

      response.status(502).json({ error: "Gmail draft creation failed. Try again in a moment." });
    }
  }
);

exports.planProjectWithAi = onRequest(
  {
    cors: allowedCorsOrigins,
    secrets: [openAiApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request, response) => {
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Use POST." });
      return;
    }

    const authHeader = request.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

    if (!token) {
      response.status(401).json({ error: "Sign in before using AI project planning." });
      return;
    }

    try {
      await admin.auth().verifyIdToken(token);
    } catch (error) {
      logger.warn("Rejected unauthenticated project planning request", error);
      response.status(401).json({ error: "Your session could not be verified." });
      return;
    }

    const title = String(request.body?.title || "").trim();
    const description = String(request.body?.description || "").trim();
    const targetDate = String(request.body?.targetDate || "").trim();
    const currentDate = String(request.body?.currentDate || new Date().toISOString().slice(0, 10));

    if (!title && !description) {
      response.status(400).json({ error: "Add a project title or description first." });
      return;
    }

    if (`${title}\n${description}`.length > 10000) {
      response.status(413).json({ error: "Project details are too long. Keep them under 10,000 characters." });
      return;
    }

    const apiKey = openAiApiKey.value();
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    try {
      const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "system",
              content: projectPlanningInstructions,
            },
            {
              role: "user",
              content: [
                `Current date: ${currentDate}.`,
                targetDate ? `Target date: ${targetDate}.` : "Target date: not provided.",
                "Create an EasyProjects plan with sections and editable task suggestions.",
                `Project title: ${title || "Untitled project"}`,
                "Project description:",
                description || "No extra description provided.",
              ].join("\n\n"),
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "easyprojects_project_plan",
              strict: true,
              schema: projectPlanSchema,
            },
          },
        }),
      });

      const responseBody = await openAiResponse.json();

      if (!openAiResponse.ok) {
        logger.error("OpenAI project planning failed", {
          status: openAiResponse.status,
          code: responseBody?.error?.code || "unknown",
          type: responseBody?.error?.type || "unknown",
        });
        response.status(502).json({ error: "OpenAI could not plan that project." });
        return;
      }

      const parsed = JSON.parse(readOutputText(responseBody));
      const sections = Array.isArray(parsed.sections)
        ? parsed.sections.map(normalizeProjectSection).filter((section) => section.title && section.tasks.length).slice(0, 6)
        : [];

      response.status(200).json({
        summary: String(parsed.summary || "").trim(),
        risks: Array.isArray(parsed.risks)
          ? parsed.risks.map((risk) => String(risk || "").trim()).filter(Boolean).slice(0, 5)
          : [],
        sections,
      });
    } catch (error) {
      logger.error("Project planning request failed", error);
      response.status(500).json({ error: "Project planning failed. Try again in a moment." });
    }
  }
);
