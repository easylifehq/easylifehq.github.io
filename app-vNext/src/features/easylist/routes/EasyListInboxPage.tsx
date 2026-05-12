import { LoadingState } from "@/components/feedback/LoadingState";
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
import { useMemo, useState } from "react";

const FOLLOW_UP_PATTERN = /\b(email|reply|respond|follow up|follow-up|call|text|message)\b/i;
const APPROVAL_STATE_OPTIONS: AssistantApprovalState[] = [
  "suggested",
  "editing",
  "approved",
  "dismissed",
  "needs-review",
];
const INBOX_PREVIEW_STATE_LABELS: Record<AssistantApprovalState, string> = {
  suggested: "Preview: suggested",
  editing: "Preview: editing",
  approved: "Preview: ready for draft",
  dismissed: "Preview: dismissed locally",
  "needs-review": "Preview: needs review",
};

export function EasyListInboxPage() {
  const { tasks, isLoading, error, addTask } = useEasyList();
  const [listName, setListName] = useState("Main");
  const [assistantCaptureText, setAssistantCaptureText] = useState("Reply to Maya about Friday plans");
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
        label: "Remember",
        count: activeLaneItems.filter((task) => task.notes || task.category).length,
        detail: "Carries notes or memory context.",
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
        message: "Name the task before saving. Nothing was saved.",
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
        message: "Demo review mode: no signed-in task save happened. This final confirmation would save one task only outside demo review; nothing else was created.",
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
      message: taskId
        ? "Saved one task only. No note, plan, reminder, follow-up, email, calendar item, notification, sync, or memory was created."
        : "No signed-in task save happened in this preview session. Nothing else was created.",
    });
  }

  return (
    <>
      <section className="panel-section easylist-inbox-surface" aria-labelledby="easylist-inbox-title">
        <header className="panel-header easylist-inbox-header">
          <p className="eyebrow">Inbox</p>
          <h2 id="easylist-inbox-title">Review the intake queue</h2>
          <p className="page-section-description">
            Capture loose input, approve what matters, and keep the save paths explicit: tasks confirm here, note/context
            confirms in Notes, and plans, reminders, and follow-ups stay preview-only.
          </p>
        </header>

        <div className="easylist-inbox-command" aria-label="Next inbox review action">
          <div>
            <span>Next review</span>
            <strong>{nextReviewItem?.title || "No unresolved input is waiting."}</strong>
            <p>
              {nextReviewItem
                ? "Approve it, add time context, remember the detail, or release it before adding more."
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
          <p>Keep scope quiet. Today only needs the next thing worth approving.</p>
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
            <p>
              Local preview only. Nothing saves, sends, syncs, schedules, or remembers until final confirmation.
            </p>
          </div>

          <article className={`assistant-suggestion-card assistant-suggestion-card-${assistantSuggestion.intent}`}>
            <div className="assistant-suggestion-topline">
              <span>{assistantSuggestion.intent}</span>
              <span>{assistantSuggestion.confidenceLabel}</span>
            </div>
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
                  Preview draft
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
                  Edit preview
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
                  Dismiss preview
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
              {INBOX_PREVIEW_STATE_LABELS[visibleApprovalState]} only. This creates a local draft preview here,
              not a saved task, note, calendar item, email, sync, or memory.
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
            {assistantSuggestion.warnings.map((warning) => (
              <p key={warning} className="assistant-suggestion-warning">
                {warning}
              </p>
            ))}
          </article>

          <div className="assistant-draft-comparison-row" aria-label="Compare local draft shapes">
            <span>Compare unsaved shapes</span>
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
            <article className="assistant-local-draft-preview" aria-label="Unsaved local draft preview">
              <div className="assistant-local-draft-header">
                <span>{localDraftStatusLabels[approvedLocalDraft.status]}</span>
                <strong>{localDraftTypeLabels[approvedLocalDraft.draftType]}</strong>
              </div>
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
              {approvedLocalDraft.warnings.map((warning) => (
                <p key={warning} className="assistant-local-draft-warning">
                  {warning}
                </p>
              ))}
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
                    Preview task-only save row
                  </button>
                  <span>Only task drafts can reach final save in Inbox. Note/context saves happen in Notes.</span>
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
                    Preview-only {approvedLocalDraft.draftType === "follow-up" ? "follow-up" : "reminder"} review
                  </button>
                  <span>
                    {approvedLocalDraft.draftType === "follow-up"
                      ? "This does not send email, text, calls, or messages."
                      : "This does not schedule a notification."}
                  </span>
                </div>
              ) : null}
            </article>
          ) : null}

          {showTaskHandoff && taskHandoffPreview ? (
            <article className="assistant-task-handoff-preview" aria-label="Editable unsaved task-only save preview">
              <div className="assistant-local-draft-header">
                <span>Task-only save preview</span>
                <strong>Editable unsaved task row</strong>
              </div>
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
              {taskHandoffPreview.warnings.map((warning) => (
                <p key={warning} className="assistant-local-draft-warning">
                  {warning}
                </p>
              ))}
              <div className="assistant-task-save-confirmation" aria-label="Final task save confirmation">
                <div>
                  <span>Final confirmation</span>
                  <strong>Save one task to {selectedListName}</strong>
                  <p className="assistant-task-save-boundary">
                    Task save only: `{taskHandoffPreview.title || "Untitled task"}` can be saved as one{" "}
                    {taskHandoffPreview.itemKind}. Everything else stays preview-only.
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
                    No note, plan, reminder, follow-up, email, calendar item, notification, sync, or memory was created.
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
                  Editable unsaved {reviewHandoffPreview.handoffType === "follow-up" ? "follow-up" : "reminder"} review
                </strong>
              </div>
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
              {reviewHandoffPreview.warnings.map((warning) => (
                <p key={warning} className="assistant-local-draft-warning">
                  {warning}
                </p>
              ))}
            </article>
          ) : null}
        </section>

        <TaskComposer onSubmit={addTask} listName={selectedListName} showBrainDump={false} />
      </section>

      {error ? <p className="error-copy">{error}</p> : null}
    </>
  );
}
