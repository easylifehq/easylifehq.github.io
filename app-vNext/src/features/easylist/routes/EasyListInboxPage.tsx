import { assistantAiAvailability, getAssistantAiFallbackCopy } from "@/features/assistant/aiAvailability";
import { runMockGateway, type MockGatewayForcedFallbackReason } from "@/features/assistant/gateway/mockGateway";
import { createMockGatewayTypedCaptureRequest } from "@/features/assistant/gateway/mockGatewayRequest";
import { classifyAssistantIntent } from "@/features/assistant/intentClassifier";
import {
  buildLocalDraftComparisonOptions,
  buildLocalDraftFromSuggestion,
  buildReviewHandoffPreview,
  buildTaskRowHandoffPreview,
} from "@/features/assistant/localDraftBuilder";
import {
  localDraftStatusLabels,
  localDraftTypeLabels,
  type AssistantReviewHandoffPreview,
  type AssistantTaskSaveConfirmation,
  type AssistantTaskRowHandoffPreview,
  type AssistantLocalDraftType,
} from "@/features/assistant/localDraftTypes";
import { runServerGatewayMockHandler } from "@/features/assistant/serverGateway/serverGatewayMockHandler";
import { createServerGatewayTypedCaptureRequest } from "@/features/assistant/serverGateway/serverGatewayTypes";
import {
  isServerGatewayLiveDryRunResponseStale,
  runServerGatewayLiveDryRun,
} from "@/features/assistant/serverGateway/serverGatewayLiveDryRun";
import {
  createServerGatewayLiveDryRunTypedCaptureRequest,
  serverGatewayLiveDryRunAllowedRuntime,
  type ServerGatewayLiveDryRunFallbackReason,
  type ServerGatewayLiveDryRunOptions,
  type ServerGatewayLiveDryRunResponseEnvelope,
} from "@/features/assistant/serverGateway/serverGatewayLiveDryRunTypes";
import { buildTaskDraft, type TaskRowDraft } from "@/features/easylist/components/TaskComposer";
import { type AssistantApprovalState } from "@/features/assistant/intentTypes";
import {
  requestAssistantIntakeSuggestion,
  runFirstLiveProviderCallHarness,
  type AssistantIntakeSuggestionClientResult,
  type FirstLiveProviderCallResponse,
} from "@/features/assistant/serverGateway/firstLiveProviderCallHarness";
import { liveAiAllowedPromptId, liveAiAllowedRoutePath } from "@/features/assistant/serverGateway/liveAiEnvironment";
import { sanitizeProviderDryRunRequest } from "@/features/assistant/serverGateway/providerRequestSanitizer";
import { TaskComposer } from "@/features/easylist/components/TaskComposer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { auth } from "@/lib/firebase/client";
import { useEffect, useMemo, useState } from "react";

const FOLLOW_UP_PATTERN = /\b(email|reply|respond|follow up|follow-up|call|text|message)\b/i;
const APPROVAL_STATE_OPTIONS: AssistantApprovalState[] = [
  "suggested",
  "editing",
  "approved",
  "dismissed",
  "needs-review",
];
const INBOX_PREVIEW_STATE_LABELS: Record<AssistantApprovalState, string> = {
  suggested: "Draft",
  editing: "Editing",
  approved: "Preview",
  dismissed: "Dismissed",
  "needs-review": "Review",
};
const INBOX_TRUST_LABELS = ["Draft", "Preview", "Task save only", "Note save only"];
const ASSISTANT_INTAKE_SUGGESTION_ENDPOINT =
  import.meta.env.VITE_ASSISTANT_INTAKE_SUGGESTION_URL?.trim() || "";
type MockGatewayMode = "normal" | MockGatewayForcedFallbackReason;
type GatewayPreviewSource = "local-rules" | "mock-gateway" | "server-adapter-mock" | "live-provider-dry-run";
type LiveDryRunFailureMode = "disabled" | "timeout" | "rate-limit" | "validation-rejected" | "provider-error";
const MOCK_GATEWAY_MODE_OPTIONS: Array<{ value: MockGatewayMode; label: string }> = [
  { value: "normal", label: "Mock output" },
  { value: "ai-disabled", label: "AI disabled" },
  { value: "timeout", label: "Timeout" },
  { value: "rate-limit", label: "Rate limit" },
  { value: "circuit-open", label: "Circuit open" },
];
const LIVE_DRY_RUN_FAILURE_OPTIONS: Array<{
  value: LiveDryRunFailureMode;
  label: string;
  description: string;
}> = [
  { value: "disabled", label: "Disabled", description: "Provider lane stays off" },
  { value: "timeout", label: "Timeout", description: "No automatic retry" },
  { value: "rate-limit", label: "Rate limit", description: "Use local rules" },
  { value: "validation-rejected", label: "Validation blocked", description: "Unsafe output is not offered" },
  { value: "provider-error", label: "Provider error", description: "Capture is preserved" },
];
const GATEWAY_PREVIEW_SOURCE_OPTIONS: Array<{
  value: GatewayPreviewSource;
  label: string;
  description: string;
}> = [
  { value: "local-rules", label: "Local rules", description: "Deterministic draft" },
  { value: "mock-gateway", label: "Mock gateway", description: "No provider" },
  { value: "server-adapter-mock", label: "Server adapter mock", description: "No live AI" },
  { value: "live-provider-dry-run", label: "Provider test gate", description: "Disabled unless separately approved" },
];
const GATEWAY_RESULT_CLARITY: Record<
  GatewayPreviewSource,
  {
    mode: string;
    result: string;
    next: string;
  }
> = {
  "local-rules": {
    mode: "Local rules",
    result: "Deterministic preview. No provider.",
    next: "Review, edit, or use the existing save confirmation.",
  },
  "mock-gateway": {
    mode: "Mock gateway",
    result: "No-provider model-shaped preview.",
    next: "Check source, destination, then keep or discard the draft.",
  },
  "server-adapter-mock": {
    mode: "Server adapter mock",
    result: "Server-shaped fallback. No network.",
    next: "Use local rules or keep the capture for review.",
  },
  "live-provider-dry-run": {
    mode: "Provider test gate",
    result: "Disabled until approval, sanitizer, secret boundary, and quarantine all pass.",
    next: "Use synthetic/private-test capture only. Nothing saved or sent.",
  },
};
const LIVE_DRY_RUN_FALLBACK_GUIDANCE: Record<
  ServerGatewayLiveDryRunFallbackReason,
  {
    pill: string;
    title: string;
    copy: string;
    next: string;
  }
> = {
  "ai-disabled": {
    pill: "Paused",
    title: "Live lane is off",
    copy: "Typed capture stays here. Local rules can still draft a suggestion.",
    next: "Use local fallback or keep editing the capture.",
  },
  "server-only-required": {
    pill: "Server only",
    title: "Provider call blocked in browser",
    copy: "The browser cannot call a provider. Local fallback stays available.",
    next: "Keep reviewing locally until a server path is enabled.",
  },
  "provider-unconfigured": {
    pill: "Not configured",
    title: "Provider is not connected",
    copy: "No server-side provider executor is configured. Nothing was sent.",
    next: "Use the deterministic fallback.",
  },
  "invalid-request": {
    pill: "Blocked",
    title: "Request stayed inside the guardrails",
    copy: "The request was outside the synthetic Inbox typed-capture boundary.",
    next: "Use typed Inbox capture only.",
  },
  timeout: {
    pill: "Timed out",
    title: "The live lane took too long",
    copy: "Typed capture is preserved. EasyLife will not retry in the background.",
    next: "Use local fallback or try again manually later.",
  },
  "rate-limit": {
    pill: "Throttled",
    title: "The live lane is taking a breather",
    copy: "Typed capture is preserved. No data was lost or saved.",
    next: "Use local rules until the limit clears.",
  },
  "circuit-open": {
    pill: "Disabled",
    title: "Kill switch is active",
    copy: "Provider calls are disabled. Local fallback remains available.",
    next: "Keep using local rules.",
  },
  "validation-rejected": {
    pill: "Blocked",
    title: "Unsafe output was blocked",
    copy: "The output did not pass validation, so it was not shown as a suggestion.",
    next: "Use local fallback and keep the capture unchanged.",
  },
  "provider-error": {
    pill: "Fallback",
    title: "Provider lane hit an error",
    copy: "Typed capture stays here. Nothing was saved, sent, or retried.",
    next: "Use local fallback and retry manually later if needed.",
  },
};
const DESTINATION_BY_DRAFT_TYPE: Record<AssistantLocalDraftType, string> = {
  task: "Inbox task save lane",
  note: "Notes save lane",
  plan: "Plan preview only",
  reminder: "Reminder preview only",
  "follow-up": "Follow-up preview only",
  unsure: "Hold for review",
};

function normalizeAssistantMatchText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function buildCapturePairLabel(suggestionId: string) {
  return `Capture ${suggestionId.replace(/^local-intent-/, "#")}`;
}

function liveDryRunOptionsForMode(mode: LiveDryRunFailureMode): ServerGatewayLiveDryRunOptions {
  switch (mode) {
    case "timeout":
      return { config: { timeout: true } };
    case "rate-limit":
      return { config: { rateLimited: true } };
    case "validation-rejected":
      return {
        config: {
          enabled: true,
          runtime: serverGatewayLiveDryRunAllowedRuntime,
          providerConfigured: true,
        },
        serverOnlyProviderExecutor: () => ({
          unsafeInstruction: "Save this task and send a follow-up without asking.",
        }),
      };
    case "provider-error":
      return {
        config: {
          enabled: true,
          runtime: serverGatewayLiveDryRunAllowedRuntime,
          providerConfigured: true,
        },
        serverOnlyProviderExecutor: () => {
          throw new Error("Synthetic provider failure preview.");
        },
      };
    case "disabled":
    default:
      return {};
  }
}

function SourceDestinationRow({
  source,
  state,
  destination,
}: {
  source: string;
  state: string;
  destination: string;
}) {
  return (
    <dl className="assistant-source-destination-row" aria-label="Suggestion source, state, and destination">
      <div>
        <dt>Source</dt>
        <dd>{source}</dd>
      </div>
      <div>
        <dt>State</dt>
        <dd>{state}</dd>
      </div>
      <div>
        <dt>Destination</dt>
        <dd>{destination}</dd>
      </div>
    </dl>
  );
}

export function EasyListInboxPage() {
  const { tasks, isLoading, error, addTask } = useEasyList();
  const [listName, setListName] = useState("Main");
  const [assistantCaptureText, setAssistantCaptureText] = useState("Reply to Maya about Friday plans");
  const [gatewayPreviewSource, setGatewayPreviewSource] =
    useState<GatewayPreviewSource>("live-provider-dry-run");
  const [mockGatewayMode, setMockGatewayMode] = useState<MockGatewayMode>("normal");
  const [liveDryRunFailureMode, setLiveDryRunFailureMode] = useState<LiveDryRunFailureMode>("disabled");
  const [previewApprovalState, setPreviewApprovalState] = useState<AssistantApprovalState>("suggested");
  const [selectedDraftType, setSelectedDraftType] = useState<AssistantLocalDraftType>("follow-up");
  const [showTaskHandoff, setShowTaskHandoff] = useState(false);
  const [taskHandoffPreview, setTaskHandoffPreview] = useState<AssistantTaskRowHandoffPreview | null>(null);
  const [showReviewHandoff, setShowReviewHandoff] = useState(false);
  const [reviewHandoffPreview, setReviewHandoffPreview] = useState<AssistantReviewHandoffPreview | null>(null);
  const [taskSaveConfirmation, setTaskSaveConfirmation] = useState<AssistantTaskSaveConfirmation | null>(null);
  const [liveDryRunResult, setLiveDryRunResult] =
    useState<ServerGatewayLiveDryRunResponseEnvelope | null>(null);
  const [firstLiveCallResult, setFirstLiveCallResult] =
    useState<FirstLiveProviderCallResponse | null>(null);
  const [assistantIntakeClientResult, setAssistantIntakeClientResult] =
    useState<AssistantIntakeSuggestionClientResult | null>(null);
  const [providerRequestCaptureId, setProviderRequestCaptureId] = useState<string | null>(null);
  const listNames = useMemo(
    () => Array.from(new Set(["Main", ...tasks.map((task) => task.listName || "Main")])).sort(),
    [tasks]
  );
  const selectedListName = listName.trim() || "Main";
  const activeLaneItems = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !task.completed &&
          !task.deletedAt &&
          (task.listName || "Main").toLowerCase() === selectedListName.toLowerCase()
      ),
    [selectedListName, tasks]
  );
  const unresolvedCount = activeLaneItems.length;
  const nextReviewItem =
    activeLaneItems.find((task) => !task.dueDate && !task.estimatedLength) || activeLaneItems[0] || null;
  const assistantSuggestion = useMemo(
    () => classifyAssistantIntent(assistantCaptureText),
    [assistantCaptureText]
  );
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);
  const isDemoReviewMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("demo") === "1" || params.get("visualQa") === "1";
  }, []);
  const activeApprovalState =
    assistantSuggestion.approvalState === "needs-review" ? "needs-review" : previewApprovalState;
  const visibleApprovalState =
    previewApprovalState === "suggested" ? assistantSuggestion.approvalState : previewApprovalState;
  const draftComparisonOptions = useMemo(
    () => buildLocalDraftComparisonOptions(assistantSuggestion),
    [assistantSuggestion]
  );
  const activeDraftType =
    draftComparisonOptions.some((option) => option.draftType === selectedDraftType)
      ? selectedDraftType
      : assistantSuggestion.intent;
  const capturePairLabel = buildCapturePairLabel(assistantSuggestion.id);
  const suggestionSourceLabel = isDemoReviewMode ? "Typed demo capture" : "Typed capture";
  const suggestionDestination = DESTINATION_BY_DRAFT_TYPE[activeDraftType] || "Hold for review";
  const inboxAiFallbackCopy = getAssistantAiFallbackCopy("inbox");
  const mockGatewayRequest = useMemo(
    () =>
      createMockGatewayTypedCaptureRequest({
        requestId: `inbox-mock-${assistantSuggestion.id}`,
        typedCaptureText: assistantCaptureText,
        includeDemoFixture: isDemoReviewMode,
      }),
    [assistantCaptureText, assistantSuggestion.id, isDemoReviewMode]
  );
  const mockGatewayResult = useMemo(
    () =>
      runMockGateway(
        mockGatewayRequest,
        mockGatewayMode === "normal" ? {} : { forceFallbackReason: mockGatewayMode }
      ),
    [mockGatewayMode, mockGatewayRequest]
  );
  const mockGatewayOutput =
    mockGatewayResult.status === "mock-output" ? mockGatewayResult.response.output : null;
  const mockGatewaySafetyState =
    mockGatewayResult.status === "mock-output" ? mockGatewayResult.response.safetyState : null;
  const serverGatewayRequest = useMemo(
    () =>
      createServerGatewayTypedCaptureRequest({
        requestId: `inbox-server-adapter-${assistantSuggestion.id}`,
        typedCaptureText: assistantCaptureText,
        includeDemoFixture: isDemoReviewMode,
      }),
    [assistantCaptureText, assistantSuggestion.id, isDemoReviewMode]
  );
  const serverGatewayResult = useMemo(
    () =>
      runServerGatewayMockHandler(
        serverGatewayRequest,
        mockGatewayMode === "normal" ? {} : { forceFallbackReason: mockGatewayMode }
      ),
    [mockGatewayMode, serverGatewayRequest]
  );
  const serverGatewayOutput = serverGatewayResult.status === "ok" ? serverGatewayResult.output : null;
  const liveDryRunRequest = useMemo(
    () =>
      createServerGatewayLiveDryRunTypedCaptureRequest({
        requestId: `inbox-live-dry-run-${assistantSuggestion.id}`,
        typedCaptureText: assistantCaptureText || "Synthetic demo capture only.",
      }),
    [assistantCaptureText, assistantSuggestion.id]
  );
  const firstLiveCallSanitizerResult = useMemo(
    () => sanitizeProviderDryRunRequest(liveDryRunRequest),
    [liveDryRunRequest]
  );
  const providerSuggestionRequested =
    gatewayPreviewSource === "live-provider-dry-run" &&
    providerRequestCaptureId === assistantSuggestion.id;

  useEffect(() => {
    let cancelled = false;

    setLiveDryRunResult(null);
    void runServerGatewayLiveDryRun(
      liveDryRunRequest,
      liveDryRunOptionsForMode(liveDryRunFailureMode)
    ).then((result) => {
      if (!cancelled) {
        setLiveDryRunResult(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [liveDryRunFailureMode, liveDryRunRequest]);

  useEffect(() => {
    let cancelled = false;

    setFirstLiveCallResult(null);
    void runFirstLiveProviderCallHarness(
      firstLiveCallSanitizerResult.summary || firstLiveCallSanitizerResult
    ).then((result) => {
      if (!cancelled) {
        setFirstLiveCallResult(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [firstLiveCallSanitizerResult]);

  useEffect(() => {
    let cancelled = false;

    if (!providerSuggestionRequested) {
      setAssistantIntakeClientResult(null);
      return () => {
        cancelled = true;
      };
    }

    setAssistantIntakeClientResult(null);

    async function runAssistantIntakeClient() {
      let authToken: string | undefined;

      try {
        authToken =
          ASSISTANT_INTAKE_SUGGESTION_ENDPOINT && auth.currentUser
            ? await auth.currentUser.getIdToken()
            : undefined;
      } catch {
        authToken = undefined;
      }

      const result = await requestAssistantIntakeSuggestion({
        endpointUrl: ASSISTANT_INTAKE_SUGGESTION_ENDPOINT,
        authToken,
        route: liveAiAllowedRoutePath,
        promptId: liveAiAllowedPromptId,
        typedCapture: assistantCaptureText,
        metadata: {
          source: "inbox-assistant-lane",
          captureId: assistantSuggestion.id,
          clientVersion: "p4-03-disabled-contract",
          reviewMode: isDemoReviewMode ? "demo" : "private-alpha",
        },
        liveCallRequested: false,
      });

      if (!cancelled) {
        setAssistantIntakeClientResult(result);
      }
    }

    void runAssistantIntakeClient();

    return () => {
      cancelled = true;
    };
  }, [assistantCaptureText, assistantSuggestion.id, isDemoReviewMode, providerSuggestionRequested]);

  const liveDryRunResultIsStale = isServerGatewayLiveDryRunResponseStale(
    liveDryRunResult,
    liveDryRunRequest.contextPacket.requestId
  );
  const liveDryRunOutput =
    liveDryRunResult?.status === "ok" && !liveDryRunResultIsStale ? liveDryRunResult.output : null;
  const liveDryRunFallbackGuidance = liveDryRunResult?.fallback
    ? LIVE_DRY_RUN_FALLBACK_GUIDANCE[liveDryRunResult.fallback.reason]
    : null;
  const firstLiveCallApprovedTestState =
    firstLiveCallResult?.approvalVerdict === "APPROVED_FOR_ONE_SYNTHETIC_INBOX_PROVIDER_CALL" &&
    firstLiveCallResult?.status === "ok";
  const firstLiveCallSourceState =
    firstLiveCallSanitizerResult.summary?.sourceLabels
      .map((source) => source.sourceLabel)
      .join(", ") || "Typed capture";
  const firstLiveCallPromptId = firstLiveCallSanitizerResult.summary?.promptId || "intake-suggestion";
  const firstLiveCallSanitizerState = firstLiveCallSanitizerResult.valid ? "accepted" : "rejected";
  const assistantIntakeServerResponse = assistantIntakeClientResult?.response || null;
  const assistantIntakeEndpointState = ASSISTANT_INTAKE_SUGGESTION_ENDPOINT ? "endpoint configured" : "endpoint missing";
  const assistantIntakeCallState = assistantIntakeClientResult?.callState || assistantIntakeEndpointState;
  const firstLiveCallValidationState =
    assistantIntakeServerResponse?.quarantineState ||
    assistantIntakeServerResponse?.validationState ||
    firstLiveCallResult?.quarantineState ||
    firstLiveCallResult?.outputValidationState ||
    "not run";
  const firstLiveCallFallbackState =
    assistantIntakeServerResponse?.fallbackState || firstLiveCallResult?.fallback?.reason || "none";
  const firstLiveCallProviderState =
    assistantIntakeServerResponse?.providerState || firstLiveCallResult?.providerCallState || "not-called";
  const firstLiveCallLaneState = firstLiveCallApprovedTestState ? "approved test" : "disabled gate";
  const unguardedGatewayOutput =
    gatewayPreviewSource === "server-adapter-mock"
      ? serverGatewayOutput
      : gatewayPreviewSource === "mock-gateway"
        ? mockGatewayOutput
        : gatewayPreviewSource === "live-provider-dry-run"
          ? liveDryRunOutput || null
          : null;
  const duplicateCandidateTitle = normalizeAssistantMatchText(
    unguardedGatewayOutput?.title || assistantSuggestion.title
  );
  const duplicateExistingTask = activeLaneItems.find(
    (task) => normalizeAssistantMatchText(task.title) === duplicateCandidateTitle
  );
  const duplicateGuardActive = Boolean(
    unguardedGatewayOutput && duplicateExistingTask && gatewayPreviewSource !== "local-rules"
  );
  const activeGatewayOutput = duplicateGuardActive ? null : unguardedGatewayOutput;
  const activeGatewayLabel =
    GATEWAY_PREVIEW_SOURCE_OPTIONS.find((option) => option.value === gatewayPreviewSource)?.label ||
    "Local rules";
  const activeGatewayState =
    gatewayPreviewSource === "server-adapter-mock"
      ? serverGatewayResult.outputValidationState || serverGatewayResult.requestValidationState
      : gatewayPreviewSource === "mock-gateway"
        ? mockGatewaySafetyState || mockGatewayResult.status
        : gatewayPreviewSource === "live-provider-dry-run"
          ? liveDryRunResultIsStale
            ? "stale"
            : liveDryRunResult?.outputValidationState ||
              liveDryRunResult?.fallback?.reason ||
              liveDryRunResult?.metadataLog.validationResult ||
              "loading"
        : "deterministic";
  const activeGatewayTopline =
    gatewayPreviewSource === "live-provider-dry-run"
      ? [
          "Provider test gate",
          liveDryRunResultIsStale
            ? "Stale cleared"
            : !providerSuggestionRequested
              ? "Request needed"
            : assistantIntakeClientResult?.callState === "request-sent"
              ? "Function fallback received"
            : duplicateGuardActive
              ? "Duplicate held"
              : firstLiveCallApprovedTestState
                ? "Approved test lane"
                : "Disabled gate",
          capturePairLabel,
          `Prompt ${firstLiveCallPromptId}`,
          assistantIntakeEndpointState,
          "Nothing saved or sent",
        ]
      : [activeGatewayLabel, capturePairLabel, "No provider", "No live AI", activeGatewayState];
  const activeGatewayClarity =
    duplicateGuardActive
      ? {
          mode: activeGatewayLabel,
          result: "Possible duplicate held for review.",
          next: "Check the existing task before saving anything new.",
        }
      : gatewayPreviewSource === "live-provider-dry-run" && !providerSuggestionRequested
        ? {
            mode: "Provider test gate",
            result: "No server request has been made for this capture.",
            next: "Choose Request gated suggestion to ask for one disabled, review-only fallback.",
          }
      : liveDryRunResultIsStale
        ? {
            mode: "Provider test gate",
            result: "Previous result cleared after capture changed.",
            next: "Current capture will use local fallback until validation finishes.",
          }
        : gatewayPreviewSource === "live-provider-dry-run" && liveDryRunFallbackGuidance
        ? {
            mode: "Provider test gate",
            result:
              assistantIntakeServerResponse?.message ||
              firstLiveCallResult?.fallback?.copy ||
              liveDryRunFallbackGuidance.copy,
            next: firstLiveCallApprovedTestState
              ? "Approved test only. Still suggestion-only."
              : "Disabled until explicit approval and server-only secret setup.",
            }
          : GATEWAY_RESULT_CLARITY[gatewayPreviewSource];
  const approvedLocalDraft = useMemo(
    () =>
      visibleApprovalState === "approved"
        ? buildLocalDraftFromSuggestion(assistantSuggestion, activeDraftType)
        : null,
    [activeDraftType, assistantSuggestion, visibleApprovalState]
  );
  const canPreviewTaskHandoff = approvedLocalDraft?.draftType === "task";
  const canPreviewReviewHandoff =
    approvedLocalDraft?.draftType === "follow-up" || approvedLocalDraft?.draftType === "reminder";
  const assistantQueue = useMemo(
    () => [
      {
        label: "Approve",
        count: activeLaneItems.filter((task) => !task.dueDate && !task.estimatedLength).length,
        detail: "Needs a yes, date, estimate, or release.",
      },
      {
        label: "Plan",
        count: activeLaneItems.filter((task) => task.dueDate || task.estimatedLength).length,
        detail: "Already has time context for Today.",
      },
      {
        label: "Context",
        count: activeLaneItems.filter((task) => task.notes || task.category).length,
        detail: "Has notes or saved context.",
      },
      {
        label: "Follow up",
        count: activeLaneItems.filter((task) =>
          FOLLOW_UP_PATTERN.test(`${task.title} ${task.notes} ${task.category} ${task.listName}`)
        ).length,
        detail: "Looks like a reply, call, text, or message.",
      },
    ],
    [activeLaneItems]
  );

  function clearTaskSaveConfirmation() {
    setTaskSaveConfirmation(null);
  }

  function buildTaskRowFromHandoff(preview: AssistantTaskRowHandoffPreview): TaskRowDraft {
    return {
      id: preview.id,
      itemKind: preview.itemKind,
      title: preview.title,
      category: preview.category,
      dueDate: preview.dueDate,
      estimatedLength: preview.estimatedLength,
      priorityTier: preview.priorityTier as TaskRowDraft["priorityTier"],
      notes: preview.notes,
    };
  }

  function keepTaskSaveCopyNarrow(preview: AssistantTaskRowHandoffPreview): AssistantTaskRowHandoffPreview {
    return {
      ...preview,
      notes: preview.notes.replace(
        "Review this local handoff before using the existing save action.",
        "Review this local task row before using the existing save action."
      ),
    };
  }

  async function handleConfirmTaskSave() {
    if (!taskHandoffPreview || taskSaveConfirmation?.status === "saving") return;

    const draft = buildTaskDraft(buildTaskRowFromHandoff(taskHandoffPreview), selectedListName);
    if (!draft) {
      setTaskSaveConfirmation({
        sourcePreviewId: taskHandoffPreview.id,
        title: taskHandoffPreview.title,
        listName: selectedListName,
        itemKind: taskHandoffPreview.itemKind,
        dueDate: taskHandoffPreview.dueDate,
        estimatedLength: taskHandoffPreview.estimatedLength,
        notes: taskHandoffPreview.notes,
        savedTaskId: null,
        status: "blocked",
        message: "Add a task name first.",
      });
      return;
    }

    setTaskSaveConfirmation({
      sourcePreviewId: taskHandoffPreview.id,
      title: draft.title,
      listName: selectedListName,
      itemKind: draft.itemKind || taskHandoffPreview.itemKind,
      dueDate: taskHandoffPreview.dueDate,
      estimatedLength: taskHandoffPreview.estimatedLength,
      notes: taskHandoffPreview.notes,
      savedTaskId: null,
      status: "saving",
      message: "Saving this task only...",
    });

    if (isDemoReviewMode) {
      setTaskSaveConfirmation({
        sourcePreviewId: taskHandoffPreview.id,
        title: draft.title,
        listName: selectedListName,
        itemKind: draft.itemKind || taskHandoffPreview.itemKind,
        dueDate: taskHandoffPreview.dueDate,
        estimatedLength: taskHandoffPreview.estimatedLength,
        notes: taskHandoffPreview.notes,
        savedTaskId: null,
        status: "blocked",
        message: "Demo: no task saved. Outside demo, this would save one task only.",
      });
      return;
    }

    const taskId = await addTask(draft);

    setTaskSaveConfirmation({
      sourcePreviewId: taskHandoffPreview.id,
      title: draft.title,
      listName: selectedListName,
      itemKind: draft.itemKind || taskHandoffPreview.itemKind,
      dueDate: taskHandoffPreview.dueDate,
      estimatedLength: taskHandoffPreview.estimatedLength,
      notes: taskHandoffPreview.notes,
      savedTaskId: taskId || null,
      status: taskId ? "saved" : "blocked",
      message: taskId ? "Saved one task only." : "No task saved in this preview session.",
    });
  }

  return (
    <>
      <section className="panel-section easylist-inbox-surface" aria-labelledby="easylist-inbox-title">
        <header className="panel-header easylist-inbox-header">
          <p className="eyebrow">Inbox</p>
          <h2 id="easylist-inbox-title">Review the intake queue</h2>
          <p className="page-section-description">
            Draft first. Tasks save here after final confirmation. Notes save in Notes. Plans, reminders, and follow-ups stay preview-only.
          </p>
          {isLoading && !isDemoReviewMode ? <p className="helper-copy" role="status">Opening Inbox...</p> : null}
        </header>

        <div className="easylist-inbox-command" aria-label="Next inbox review action">
          <div>
            <span>Next review</span>
            <strong>{nextReviewItem?.title || "No unresolved input is waiting."}</strong>
            <p>
              {nextReviewItem
                ? "Approve it, add time context, keep the detail, or release it."
                : "Use the command row below when a new thought needs somewhere safe to land."}
            </p>
          </div>
          <small>{unresolvedCount} unresolved</small>
        </div>

        <div className="easylist-inbox-strip" aria-label="Assistant inbox queue">
          {assistantQueue.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="easylist-inbox-controls">
          <label className="field-stack">
            <span>Queue scope</span>
            <input
              list="easylist-list-options"
              value={listName}
              onChange={(event) => setListName(event.target.value || "Main")}
              placeholder="Main"
            />
            <datalist id="easylist-list-options">
              {listNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <p>Keep scope quiet. Review one lane at a time.</p>
        </div>

        <section className="assistant-intent-preview" aria-labelledby="assistant-intent-preview-title">
          <div className="assistant-intent-input">
            <label className="field-stack">
              <span>Assistant intake preview</span>
              <input
                type="text"
                value={assistantCaptureText}
                onChange={(event) => {
                  setAssistantCaptureText(event.target.value);
                  setPreviewApprovalState("suggested");
                  setSelectedDraftType(classifyAssistantIntent(event.target.value).intent);
                  setShowTaskHandoff(false);
                  setTaskHandoffPreview(null);
                  setShowReviewHandoff(false);
                  setReviewHandoffPreview(null);
                  setProviderRequestCaptureId(null);
                  clearTaskSaveConfirmation();
                }}
                placeholder="Paste one messy thought to classify locally"
              />
            </label>
            <div className="assistant-trust-chip-row" aria-label="Assistant save boundaries">
              {[
                ...INBOX_TRUST_LABELS,
                "Mock gateway",
                "Server adapter mock",
                "Provider test gated",
                ASSISTANT_INTAKE_SUGGESTION_ENDPOINT ? "Function endpoint configured" : "Function endpoint missing",
                "No provider",
                assistantAiAvailability.badge,
                ...(isDemoReviewMode ? ["Demo"] : []),
              ].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <label className="field-stack assistant-mock-mode-field">
              <span>Mock gateway state</span>
              <select
                value={mockGatewayMode}
                onChange={(event) => setMockGatewayMode(event.target.value as MockGatewayMode)}
              >
                {MOCK_GATEWAY_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {gatewayPreviewSource === "live-provider-dry-run" ? (
              <label className="field-stack assistant-mock-mode-field">
                <span>Live fallback preview</span>
                <select
                  value={liveDryRunFailureMode}
                  onChange={(event) => setLiveDryRunFailureMode(event.target.value as LiveDryRunFailureMode)}
                >
                  {LIVE_DRY_RUN_FAILURE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <article
            className={`assistant-mock-gateway-preview ${
              activeGatewayOutput || gatewayPreviewSource === "local-rules"
                ? "assistant-mock-gateway-preview-ok"
                : "assistant-mock-gateway-preview-fallback"
            }`}
            aria-label="Assistant gateway source preview"
          >
            <div className="assistant-gateway-source-toggle" aria-label="Assistant preview source">
              {GATEWAY_PREVIEW_SOURCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={gatewayPreviewSource === option.value ? "active" : ""}
                  onClick={() => setGatewayPreviewSource(option.value)}
                  title={option.description}
                >
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
            {gatewayPreviewSource === "live-provider-dry-run" ? (
              <div className="assistant-provider-request-panel" aria-label="Gated provider suggestion request">
                <div>
                  <span>{providerSuggestionRequested ? "Request held for review" : "Request required"}</span>
                  <strong>
                    {providerSuggestionRequested
                      ? "One review request is active for this capture."
                      : "Ask for one gated suggestion when you are ready."}
                  </strong>
                  <p>
                    The app still sends liveCallRequested: false. Nothing saves, sends, schedules, syncs, remembers, or contacts anyone.
                  </p>
                </div>
                <div className="assistant-provider-request-actions">
                  <button
                    type="button"
                    className="primary-button compact-button"
                    onClick={() => {
                      setGatewayPreviewSource("live-provider-dry-run");
                      setProviderRequestCaptureId(assistantSuggestion.id);
                      setAssistantIntakeClientResult(null);
                    }}
                  >
                    Request gated suggestion
                  </button>
                  <button
                    type="button"
                    className="button-secondary compact-button"
                    onClick={() => {
                      setProviderRequestCaptureId(null);
                      setAssistantIntakeClientResult(null);
                    }}
                  >
                    Clear request
                  </button>
                </div>
              </div>
            ) : null}
            <div className="assistant-suggestion-topline">
              {activeGatewayTopline.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="assistant-result-clarity" aria-label="Assistant result summary">
              <span>
                <small>Mode</small>
                <strong>{activeGatewayClarity.mode}</strong>
              </span>
              <span>
                <small>Result</small>
                <strong>{activeGatewayClarity.result}</strong>
              </span>
              <span>
                <small>Next</small>
                <strong>{activeGatewayClarity.next}</strong>
              </span>
            </div>
            {activeGatewayOutput ? (
              <>
              <SourceDestinationRow
                source={`${activeGatewayOutput.sources.map((source) => source.sourceLabel).join(", ")} · ${capturePairLabel}`}
                state={`${activeGatewayOutput.state} suggestion`}
                destination={activeGatewayOutput.destinationLabel}
              />
              <div className="assistant-suggestion-main">
                <div>
                  <p>Model-shaped preview</p>
                  <h3>{activeGatewayOutput.title}</h3>
                  <strong>{activeGatewayOutput.summary}</strong>
                </div>
              </div>
              <div className="assistant-suggestion-fields" aria-label="Gateway output fields">
                {activeGatewayOutput.fields.map((field) => (
                  <span key={`${field.label}-${field.value}`}>
                    <small>{field.label}</small>
                    <strong>{field.value}</strong>
                    <em>{field.editable ? "editable preview" : "locked context"}</em>
                  </span>
                ))}
              </div>
              <div className="assistant-mock-confirmation" aria-label="Gateway confirmation boundary">
                <span>{activeGatewayOutput.confirmation.label}</span>
                <strong>{activeGatewayOutput.confirmation.copy}</strong>
                <p>
                  {gatewayPreviewSource === "live-provider-dry-run"
                    ? "Validated preview only. Existing saves are unchanged."
                    : gatewayPreviewSource === "server-adapter-mock"
                    ? "Server adapter mock only. No network or hidden write."
                    : "No provider call or hidden write."}
                </p>
              </div>
              </>
            ) : duplicateGuardActive ? (
              <>
              <SourceDestinationRow
                source={`${activeGatewayLabel} · ${capturePairLabel}`}
                state="Possible duplicate held"
                destination="Hold for review"
              />
              <div className="assistant-suggestion-main">
                <div>
                  <p>Duplicate guard</p>
                  <h3>Possible duplicate suggestion</h3>
                  <strong>
                    This looks like an existing task: {duplicateExistingTask?.title || "matching task"}.
                  </strong>
                </div>
              </div>
              <div className="assistant-suggestion-fields" aria-label="Duplicate suggestion guard details">
                <span>
                  <small>Current capture</small>
                  <strong>{capturePairLabel}</strong>
                  <em>source paired</em>
                </span>
                <span>
                  <small>Action</small>
                  <strong>Held for review</strong>
                  <em>no auto-save</em>
                </span>
              </div>
              <div className="assistant-mock-confirmation" aria-label="Duplicate suggestion boundary">
                <span>No retry</span>
                <strong>Duplicate-looking output is not offered as a fresh suggestion.</strong>
                <p>No suggestion history is created. Nothing saves automatically.</p>
              </div>
              </>
            ) : gatewayPreviewSource === "mock-gateway" && mockGatewayResult.status === "fallback" ? (
              <>
              <SourceDestinationRow
                source={`Typed capture kept locally · ${capturePairLabel}`}
                state={mockGatewayResult.fallback.label}
                destination="Deterministic local draft"
              />
              <div className="assistant-suggestion-main">
                <div>
                  <p>Fallback state</p>
                  <h3>{mockGatewayResult.fallback.localSuggestion.title}</h3>
                  <strong>{mockGatewayResult.fallback.copy}</strong>
                </div>
              </div>
              <div className="assistant-suggestion-fields" aria-label="Mock gateway fallback details">
                <span>
                  <small>Local intent</small>
                  <strong>{mockGatewayResult.fallback.localSuggestion.intent}</strong>
                  <em>{mockGatewayResult.fallback.localSuggestion.confidenceLabel}</em>
                </span>
                <span>
                  <small>Local draft</small>
                  <strong>{localDraftTypeLabels[mockGatewayResult.fallback.localDraft.draftType]}</strong>
                  <em>unsaved</em>
                </span>
              </div>
              <div className="assistant-mock-confirmation" aria-label="Mock gateway fallback boundary">
                <span>{mockGatewayResult.fallback.retryPolicy.label}</span>
                <strong>Typed capture is preserved. Nothing saves or sends.</strong>
                <p>No hidden read, retry, or external action.</p>
              </div>
              </>
            ) : gatewayPreviewSource === "server-adapter-mock" &&
              serverGatewayResult.status === "fallback" &&
              serverGatewayResult.fallback ? (
              <>
              <SourceDestinationRow
                source={`Server adapter mock · ${capturePairLabel}`}
                state={serverGatewayResult.fallback.label}
                destination="Deterministic local draft"
              />
              <div className="assistant-suggestion-main">
                <div>
                  <p>Server adapter fallback</p>
                  <h3>{serverGatewayResult.fallback.reason}</h3>
                  <strong>{serverGatewayResult.fallback.copy}</strong>
                </div>
              </div>
              <div className="assistant-suggestion-fields" aria-label="Server adapter fallback details">
                <span>
                  <small>Provider</small>
                  <strong>{serverGatewayResult.providerCallState}</strong>
                  <em>no live AI</em>
                </span>
                <span>
                  <small>Network</small>
                  <strong>{serverGatewayResult.networkCallState}</strong>
                  <em>no request sent</em>
                </span>
                <span>
                  <small>Typed capture</small>
                  <strong>{serverGatewayResult.fallback.preservesTypedCapture ? "preserved" : "blocked"}</strong>
                  <em>local only</em>
                </span>
              </div>
              <div className="assistant-mock-confirmation" aria-label="Server adapter fallback boundary">
                <span>No retry</span>
                <strong>Server adapter mock is no-provider. Local rules stay available.</strong>
                <p>Nothing saves automatically.</p>
              </div>
              </>
            ) : gatewayPreviewSource === "live-provider-dry-run" && liveDryRunResult ? (
              <>
              <SourceDestinationRow
                source={`Synthetic/demo capture · ${capturePairLabel}`}
                state={
                  liveDryRunResultIsStale
                    ? "Stale result cleared"
                    : `Validation ${liveDryRunResult.outputValidationState || liveDryRunResult.metadataLog.validationResult}`
                }
                destination="Local fallback only"
              />
              <div className="assistant-suggestion-main">
                <div>
                  <p>Separately approved first-call lane</p>
                  <h3>
                    {firstLiveCallApprovedTestState
                      ? "Approved test lane visible"
                      : "Provider test remains disabled"}
                  </h3>
                  <strong>
                    {firstLiveCallResult?.fallback?.copy ||
                      liveDryRunFallbackGuidance?.copy ||
                      "Output must pass sanitizer, secret boundary, validation, and quarantine before display."}
                  </strong>
                </div>
              </div>
              <div
                className="assistant-suggestion-fields assistant-first-live-lane-labels"
                aria-label="First live provider call gate details"
              >
                <span>
                  <small>Source</small>
                  <strong>{firstLiveCallSourceState}</strong>
                  <em>{firstLiveCallLaneState}</em>
                </span>
                <span>
                  <small>Gateway</small>
                  <strong>{assistantIntakeCallState}</strong>
                  <em>{assistantIntakeClientResult?.authTokenPresent ? "auth token" : "local fallback"}</em>
                </span>
                <span>
                  <small>Prompt ID</small>
                  <strong>{firstLiveCallPromptId}</strong>
                  <em>Inbox only</em>
                </span>
                <span>
                  <small>Sanitizer</small>
                  <strong>{firstLiveCallSanitizerState}</strong>
                  <em>required</em>
                </span>
                <span>
                  <small>Quarantine</small>
                  <strong>{firstLiveCallValidationState}</strong>
                  <em>required</em>
                </span>
                <span>
                  <small>Fallback</small>
                  <strong>{firstLiveCallFallbackState}</strong>
                  <em>
                    {assistantIntakeServerResponse?.nothingSavedOrSent
                      ? "nothing saved"
                      : firstLiveCallResult?.fallback?.preservesTypedCapture
                        ? "capture kept"
                        : "available"}
                  </em>
                </span>
                <span>
                  <small>Provider</small>
                  <strong>{firstLiveCallProviderState}</strong>
                  <em>server only</em>
                </span>
                <span>
                  <small>Boundary</small>
                  <strong>Nothing saved or sent</strong>
                  <em>no external action</em>
                </span>
              </div>
              {liveDryRunFallbackGuidance ? (
                <div className="assistant-fallback-state-panel" aria-label="Live dry-run fallback guidance">
                  <span>{firstLiveCallFallbackState || liveDryRunFallbackGuidance.pill}</span>
                  <strong>
                    {firstLiveCallApprovedTestState
                      ? "Approved test output still needs review."
                      : "Hidden until explicit approval and server-only configuration."}
                  </strong>
                  <p>Capture remains editable. No save, send, schedule, sync, memory, geocoding, or notification happened.</p>
                </div>
              ) : null}
              <div className="assistant-mock-confirmation" aria-label="First live provider call boundary">
                <span>Nothing saved or sent</span>
                <strong>
                  {firstLiveCallApprovedTestState
                    ? "Approved test lane only. Existing saves are unchanged."
                    : "First live call lane is disabled until the approval record and secret boundary pass."}
                </strong>
                <p>Existing task and note save paths are unchanged. No broad chat or autonomous work.</p>
              </div>
              </>
            ) : gatewayPreviewSource === "live-provider-dry-run" ? (
              <>
              <SourceDestinationRow
                source={`Synthetic/demo capture · ${capturePairLabel}`}
                state="Cleared until current capture validates"
                destination="Local fallback only"
              />
              <div className="assistant-mock-confirmation" aria-label="Live dry-run loading boundary">
                <span>Nothing saved or sent</span>
                <strong>Preparing the disabled live-provider dry-run lane.</strong>
                <p>Provider remains disconnected.</p>
              </div>
              </>
            ) : (
              <>
              <SourceDestinationRow
                source={`${suggestionSourceLabel} · ${capturePairLabel}`}
                state={duplicateExistingTask ? "Possible duplicate review" : "Local deterministic suggestion"}
                destination={duplicateExistingTask ? "Hold for review" : suggestionDestination}
              />
              <div className="assistant-suggestion-main">
                <div>
                  <p>Local rules preview</p>
                  <h3>{assistantSuggestion.title}</h3>
                  <strong>{assistantSuggestion.summary}</strong>
                </div>
              </div>
              <div className="assistant-suggestion-fields" aria-label="Local rules preview details">
                <span>
                  <small>Intent</small>
                  <strong>{assistantSuggestion.intent}</strong>
                  <em>{assistantSuggestion.confidenceLabel}</em>
                </span>
                <span>
                  <small>Save path</small>
                  <strong>{suggestionDestination}</strong>
                  <em>unchanged</em>
                </span>
              </div>
              <div className="assistant-mock-confirmation" aria-label="Local rules boundary">
                <span>Local rules</span>
                <strong>Deterministic preview only. Use the existing confirmation controls for any save.</strong>
                <p>No provider or hidden write.</p>
              </div>
              </>
            )}
          </article>

          <article className={`assistant-suggestion-card assistant-suggestion-card-${assistantSuggestion.intent}`}>
            <div className="assistant-suggestion-topline">
              <span>{assistantSuggestion.intent}</span>
              <span>{assistantSuggestion.confidenceLabel}</span>
            </div>
            <SourceDestinationRow
              source={`${suggestionSourceLabel} · ${capturePairLabel}`}
              state={
                duplicateExistingTask
                  ? "Possible duplicate review"
                  : `${INBOX_PREVIEW_STATE_LABELS[visibleApprovalState]} suggestion`
              }
              destination={duplicateExistingTask ? "Hold for review" : suggestionDestination}
            />
            <p className="assistant-ai-fallback-copy">
              <span>{assistantAiAvailability.label}</span>
              {inboxAiFallbackCopy}
            </p>
            <div className="assistant-suggestion-main">
              <div>
                <p id="assistant-intent-preview-title">Suggested next shape</p>
                <h3>{assistantSuggestion.title}</h3>
                <strong>{assistantSuggestion.summary}</strong>
              </div>
              <div className="assistant-suggestion-actions" aria-label="Preview-only review actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setPreviewApprovalState("approved");
                    setShowTaskHandoff(false);
                    setTaskHandoffPreview(null);
                    setShowReviewHandoff(false);
                    setReviewHandoffPreview(null);
                    clearTaskSaveConfirmation();
                  }}
                  title="Preview only. This does not save anything."
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setPreviewApprovalState("editing");
                    setShowTaskHandoff(false);
                    setTaskHandoffPreview(null);
                    setShowReviewHandoff(false);
                    setReviewHandoffPreview(null);
                    clearTaskSaveConfirmation();
                  }}
                  title="Preview only. This does not edit saved data."
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setPreviewApprovalState("dismissed");
                    setShowTaskHandoff(false);
                    setTaskHandoffPreview(null);
                    setShowReviewHandoff(false);
                    setReviewHandoffPreview(null);
                    clearTaskSaveConfirmation();
                  }}
                  title="Preview only. This does not dismiss saved data."
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="assistant-approval-state-picker" aria-label="Local preview approval state">
              {APPROVAL_STATE_OPTIONS.map((state) => (
                <button
                  key={state}
                  type="button"
                  className={visibleApprovalState === state ? "active" : ""}
                  onClick={() => setPreviewApprovalState(state)}
                >
                  {INBOX_PREVIEW_STATE_LABELS[state]}
                </button>
              ))}
            </div>
            <p className={`assistant-approval-state-note assistant-approval-state-note-${activeApprovalState}`}>
              {INBOX_PREVIEW_STATE_LABELS[visibleApprovalState]} only. Nothing changes until final confirmation.
            </p>
            <div className="assistant-suggestion-fields" aria-label="Editable-looking suggestion fields">
              {assistantSuggestion.fields.map((field) => (
                <span key={field.label}>
                  <small>{field.label}</small>
                  <strong>{field.value}</strong>
                  <em>{field.editable ? "preview editable" : "contract field"}</em>
                </span>
              ))}
            </div>
            <p className="assistant-suggestion-warning">
              {duplicateExistingTask
                ? `Possible duplicate of "${duplicateExistingTask.title}". Review before creating anything new.`
                : "Preview only. Nothing is created here."}
            </p>
          </article>

          <div className="assistant-draft-comparison-row" aria-label="Compare local draft shapes">
            <span>Preview shapes</span>
            {draftComparisonOptions.map((option) => (
              <button
                key={option.draftType}
                type="button"
                className={activeDraftType === option.draftType ? "active" : ""}
                onClick={() => {
                  setSelectedDraftType(option.draftType);
                  setShowTaskHandoff(false);
                  setTaskHandoffPreview(null);
                  setShowReviewHandoff(false);
                  setReviewHandoffPreview(null);
                  clearTaskSaveConfirmation();
                }}
                title="Local preview only. This does not create another draft."
              >
                <strong>{option.label}</strong>
                <small>{option.recommended ? "Suggested" : option.summary}</small>
              </button>
            ))}
          </div>

          {approvedLocalDraft ? (
            <article className="assistant-local-draft-preview" aria-label="Local draft preview">
              <div className="assistant-local-draft-header">
                <span>{localDraftStatusLabels[approvedLocalDraft.status]}</span>
                <strong>{localDraftTypeLabels[approvedLocalDraft.draftType]}</strong>
              </div>
              <SourceDestinationRow
                source="Approved local suggestion"
                state="Unsaved draft preview"
                destination={DESTINATION_BY_DRAFT_TYPE[approvedLocalDraft.draftType]}
              />
              <div className="assistant-local-draft-body">
                <small>Draft title</small>
                <h3>{approvedLocalDraft.title}</h3>
                <p>{approvedLocalDraft.body}</p>
              </div>
              <div className="assistant-local-draft-fields" aria-label="Local draft fields">
                {approvedLocalDraft.fields.map((field) => (
                  <span key={field.draftKey}>
                    <small>{field.label}</small>
                    <strong>{field.value}</strong>
                  </span>
                ))}
              </div>
              <p className="assistant-local-draft-warning">Draft only. Review before any save path.</p>
              {canPreviewTaskHandoff ? (
                <div className="assistant-handoff-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      const preview = buildTaskRowHandoffPreview(approvedLocalDraft);
                      setTaskHandoffPreview(preview ? keepTaskSaveCopyNarrow(preview) : preview);
                      setShowTaskHandoff(Boolean(preview));
                      clearTaskSaveConfirmation();
                    }}
                  >
                    Task save preview
                  </button>
                  <span>Task save only. Notes save in Notes.</span>
                </div>
              ) : null}
              {canPreviewReviewHandoff ? (
                <div className="assistant-handoff-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      const preview = buildReviewHandoffPreview(approvedLocalDraft);
                      setReviewHandoffPreview(preview);
                      setShowReviewHandoff(Boolean(preview));
                      clearTaskSaveConfirmation();
                    }}
                  >
                    Preview {approvedLocalDraft.draftType === "follow-up" ? "follow-up" : "reminder"}
                  </button>
                  <span>
                    {approvedLocalDraft.draftType === "follow-up"
                      ? "No message sent."
                      : "No notification scheduled."}
                  </span>
                </div>
              ) : null}
            </article>
          ) : null}

          {showTaskHandoff && taskHandoffPreview ? (
            <article className="assistant-task-handoff-preview" aria-label="Editable task-only save preview">
              <div className="assistant-local-draft-header">
                <span>Task save only</span>
                <strong>Editable task row</strong>
              </div>
              <SourceDestinationRow
                source="Approved task draft"
                state="Editable unsaved row"
                destination={`${selectedListName} list after final confirmation`}
              />
              <div className="task-row-grid task-row-card assistant-task-handoff-row">
                <label className="field-stack task-row-field">
                  <span>Task</span>
                  <input
                    type="text"
                    value={taskHandoffPreview.title}
                    onChange={(event) =>
                      setTaskHandoffPreview((current) => {
                        clearTaskSaveConfirmation();
                        return current ? { ...current, title: event.target.value } : current;
                      })
                    }
                  />
                </label>
                <label className="field-stack task-row-field">
                  <span>Kind</span>
                  <select
                    value={taskHandoffPreview.itemKind}
                    onChange={(event) =>
                      setTaskHandoffPreview((current) => {
                        clearTaskSaveConfirmation();
                        return current ? { ...current, itemKind: event.target.value as TaskRowDraft["itemKind"] } : current;
                      })
                    }
                  >
                    <option value="task">Task</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </label>
                <label className="field-stack task-row-field">
                  <span>Due</span>
                  <input
                    type="date"
                    value={taskHandoffPreview.dueDate}
                    onChange={(event) =>
                      setTaskHandoffPreview((current) => {
                        clearTaskSaveConfirmation();
                        return current ? { ...current, dueDate: event.target.value } : current;
                      })
                    }
                  />
                </label>
                <label className="field-stack task-row-field">
                  <span>Minutes</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={taskHandoffPreview.estimatedLength}
                    onChange={(event) =>
                      setTaskHandoffPreview((current) => {
                        clearTaskSaveConfirmation();
                        return current ? { ...current, estimatedLength: event.target.value } : current;
                      })
                    }
                    placeholder="30"
                  />
                </label>
                <label className="field-stack task-row-field">
                  <span>Notes</span>
                  <input
                    type="text"
                    value={taskHandoffPreview.notes}
                    onChange={(event) =>
                      setTaskHandoffPreview((current) => {
                        clearTaskSaveConfirmation();
                        return current ? { ...current, notes: event.target.value } : current;
                      })
                    }
                  />
                </label>
              </div>
              <p className="assistant-local-draft-warning">Task save only. Final confirmation required.</p>
              <div className="assistant-task-save-confirmation" aria-label="Final task save confirmation">
                <div>
                  <span>Final confirmation</span>
                  <strong>Save one task to {selectedListName}</strong>
                  <p className="assistant-task-save-boundary">
                    Task save only: `{taskHandoffPreview.title || "Untitled task"}` as one {taskHandoffPreview.itemKind}.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-button compact-button"
                  onClick={() => void handleConfirmTaskSave()}
                  disabled={taskSaveConfirmation?.status === "saving"}
                >
                  {taskSaveConfirmation?.status === "saving" ? "Saving task..." : "Confirm and save task"}
                </button>
              </div>
              {taskSaveConfirmation ? (
                <article
                  className={`assistant-task-save-receipt assistant-task-save-receipt-${taskSaveConfirmation.status}`}
                  aria-label="Task save receipt"
                >
                  <div className="assistant-task-save-receipt-header">
                    <span>
                      {taskSaveConfirmation.status === "saved"
                        ? "Task saved"
                        : taskSaveConfirmation.status === "saving"
                          ? "Saving task"
                          : "Task-only receipt preview"}
                    </span>
                    <strong>{taskSaveConfirmation.title || "Untitled task"}</strong>
                  </div>
                  <dl className="assistant-task-save-receipt-grid">
                    <div>
                      <dt>List</dt>
                      <dd>{taskSaveConfirmation.listName}</dd>
                    </div>
                    <div>
                      <dt>Kind</dt>
                      <dd>{taskSaveConfirmation.itemKind}</dd>
                    </div>
                    <div>
                      <dt>Due</dt>
                      <dd>{taskSaveConfirmation.dueDate || "None"}</dd>
                    </div>
                    <div>
                      <dt>Minutes</dt>
                      <dd>{taskSaveConfirmation.estimatedLength || "Unset"}</dd>
                    </div>
                    <div className="assistant-task-save-receipt-scope">
                      <dt>Only saved</dt>
                      <dd>Task</dd>
                    </div>
                  </dl>
                  {taskSaveConfirmation.notes ? (
                    <p className="assistant-task-save-receipt-notes">{taskSaveConfirmation.notes}</p>
                  ) : null}
                  <p className="assistant-task-save-receipt-message">{taskSaveConfirmation.message}</p>
                  <p className="assistant-task-save-receipt-boundary">
                    Notes, plans, reminders, follow-ups, email, calendar, notifications, sync, and saved context stayed untouched.
                  </p>
                </article>
              ) : null}
            </article>
          ) : null}

          {showReviewHandoff && reviewHandoffPreview ? (
            <article className="assistant-review-handoff-preview" aria-label="Editable preview-only follow-up or reminder review">
              <div className="assistant-local-draft-header">
                <span>Preview-only review</span>
                <strong>
                  Editable {reviewHandoffPreview.handoffType === "follow-up" ? "follow-up" : "reminder"} preview
                </strong>
              </div>
              <SourceDestinationRow
                source="Approved local draft"
                state="Preview only"
                destination={
                  reviewHandoffPreview.handoffType === "follow-up"
                    ? "No message destination"
                    : "No notification destination"
                }
              />
              <div className="assistant-review-handoff-grid">
                <label className="field-stack">
                  <span>Review title</span>
                  <input
                    type="text"
                    value={reviewHandoffPreview.title}
                    onChange={(event) =>
                      setReviewHandoffPreview((current) => current ? { ...current, title: event.target.value } : current)
                    }
                  />
                </label>
                <label className="field-stack">
                  <span>{reviewHandoffPreview.handoffType === "follow-up" ? "Reply method" : "Reminder state"}</span>
                  <input
                    type="text"
                    value={reviewHandoffPreview.reviewMethod}
                    onChange={(event) =>
                      setReviewHandoffPreview((current) =>
                        current ? { ...current, reviewMethod: event.target.value } : current
                      )
                    }
                  />
                </label>
                <label className="field-stack">
                  <span>{reviewHandoffPreview.handoffType === "follow-up" ? "Review by" : "Timing note"}</span>
                  <input
                    type="text"
                    value={reviewHandoffPreview.timingHint}
                    onChange={(event) =>
                      setReviewHandoffPreview((current) =>
                        current ? { ...current, timingHint: event.target.value } : current
                      )
                    }
                  />
                </label>
                <label className="field-stack assistant-review-handoff-notes">
                  <span>Local review notes</span>
                  <textarea
                    rows={3}
                    value={reviewHandoffPreview.notes}
                    onChange={(event) =>
                      setReviewHandoffPreview((current) => current ? { ...current, notes: event.target.value } : current)
                    }
                  />
                </label>
              </div>
              <p className="assistant-local-draft-warning">
                {reviewHandoffPreview.handoffType === "follow-up"
                  ? "Preview only. No message sent."
                  : "Preview only. No notification scheduled."}
              </p>
            </article>
          ) : null}
        </section>

        <TaskComposer onSubmit={addTask} listName={selectedListName} showBrainDump={false} />
      </section>

      {error ? <p className="error-copy">{error}</p> : null}
    </>
  );
}
