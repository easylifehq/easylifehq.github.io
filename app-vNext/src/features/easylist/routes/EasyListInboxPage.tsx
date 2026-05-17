import { LoadingState } from "@/components/feedback/LoadingState";
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
import { buildTaskDraft, type TaskRowDraft } from "@/features/easylist/components/TaskComposer";
import { type AssistantApprovalState } from "@/features/assistant/intentTypes";
import { TaskComposer } from "@/features/easylist/components/TaskComposer";
import { useEasyList } from "@/features/easylist/EasyListContext";
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
type MockGatewayMode = "normal" | MockGatewayForcedFallbackReason;
const MOCK_GATEWAY_MODE_OPTIONS: Array<{ value: MockGatewayMode; label: string }> = [
  { value: "normal", label: "Mock output" },
  { value: "ai-disabled", label: "AI disabled" },
  { value: "timeout", label: "Timeout" },
  { value: "rate-limit", label: "Rate limit" },
  { value: "circuit-open", label: "Circuit open" },
];
const DESTINATION_BY_DRAFT_TYPE: Record<AssistantLocalDraftType, string> = {
  task: "Inbox task save lane",
  note: "Notes save lane",
  plan: "Plan preview only",
  reminder: "Reminder preview only",
  "follow-up": "Follow-up preview only",
  unsure: "Hold for review",
};

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
  const [mockGatewayMode, setMockGatewayMode] = useState<MockGatewayMode>("normal");
  const [previewApprovalState, setPreviewApprovalState] = useState<AssistantApprovalState>("suggested");
  const [selectedDraftType, setSelectedDraftType] = useState<AssistantLocalDraftType>("follow-up");
  const [showTaskHandoff, setShowTaskHandoff] = useState(false);
  const [taskHandoffPreview, setTaskHandoffPreview] = useState<AssistantTaskRowHandoffPreview | null>(null);
  const [showReviewHandoff, setShowReviewHandoff] = useState(false);
  const [reviewHandoffPreview, setReviewHandoffPreview] = useState<AssistantReviewHandoffPreview | null>(null);
  const [taskSaveConfirmation, setTaskSaveConfirmation] = useState<AssistantTaskSaveConfirmation | null>(null);
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

  if (isLoading) {
    return <LoadingState label="Opening Inbox..." />;
  }

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
                  clearTaskSaveConfirmation();
                }}
                placeholder="Paste one messy thought to classify locally"
              />
            </label>
            <div className="assistant-trust-chip-row" aria-label="Assistant save boundaries">
              {[
                ...INBOX_TRUST_LABELS,
                "Mock gateway",
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
          </div>

          {mockGatewayOutput ? (
            <article className="assistant-mock-gateway-preview assistant-mock-gateway-preview-ok" aria-label="Mock gateway suggestion preview">
              <div className="assistant-suggestion-topline">
                <span>Mock gateway</span>
                <span>No provider</span>
                <span>{mockGatewaySafetyState}</span>
              </div>
              <SourceDestinationRow
                source={mockGatewayOutput.sources.map((source) => source.sourceLabel).join(", ")}
                state={`${mockGatewayOutput.state} suggestion`}
                destination={mockGatewayOutput.destinationLabel}
              />
              <div className="assistant-suggestion-main">
                <div>
                  <p>Model-shaped preview</p>
                  <h3>{mockGatewayOutput.title}</h3>
                  <strong>{mockGatewayOutput.summary}</strong>
                </div>
              </div>
              <div className="assistant-suggestion-fields" aria-label="Mock gateway output fields">
                {mockGatewayOutput.fields.map((field) => (
                  <span key={`${field.label}-${field.value}`}>
                    <small>{field.label}</small>
                    <strong>{field.value}</strong>
                    <em>{field.editable ? "editable preview" : "locked context"}</em>
                  </span>
                ))}
              </div>
              <div className="assistant-mock-confirmation" aria-label="Mock gateway confirmation boundary">
                <span>{mockGatewayOutput.confirmation.label}</span>
                <strong>{mockGatewayOutput.confirmation.copy}</strong>
                <p>No live AI, no provider call, no hidden write.</p>
              </div>
            </article>
          ) : mockGatewayResult.status === "fallback" ? (
            <article className="assistant-mock-gateway-preview assistant-mock-gateway-preview-fallback" aria-label="Mock gateway fallback preview">
              <div className="assistant-suggestion-topline">
                <span>Mock fallback</span>
                <span>{mockGatewayResult.fallback.reason}</span>
                <span>No retry</span>
              </div>
              <SourceDestinationRow
                source="Typed capture kept locally"
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
                <strong>Typed capture is preserved. Nothing saves, sends, syncs, or schedules.</strong>
                <p>No hidden reads, no hidden writes, no external action.</p>
              </div>
            </article>
          ) : null}

          <article className={`assistant-suggestion-card assistant-suggestion-card-${assistantSuggestion.intent}`}>
            <div className="assistant-suggestion-topline">
              <span>{assistantSuggestion.intent}</span>
              <span>{assistantSuggestion.confidenceLabel}</span>
            </div>
            <SourceDestinationRow
              source={suggestionSourceLabel}
              state={`${INBOX_PREVIEW_STATE_LABELS[visibleApprovalState]} suggestion`}
              destination={suggestionDestination}
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
              Preview only. No task, note, plan, reminder, follow-up, email, sync, or notification is created here.
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
