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
  type AssistantTaskRowHandoffPreview,
  type AssistantLocalDraftType,
} from "@/features/assistant/localDraftTypes";
import type { TaskRowDraft } from "@/features/easylist/components/TaskComposer";
import {
  approvalStatePreviewLabels,
  type AssistantApprovalState,
} from "@/features/assistant/intentTypes";
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

  return (
    <>
      <section className="panel-section easylist-inbox-surface" aria-labelledby="easylist-inbox-title">
        <header className="panel-header easylist-inbox-header">
          <p className="eyebrow">Inbox</p>
          <h2 id="easylist-inbox-title">Review the intake queue</h2>
          <p className="page-section-description">
            Capture loose input, approve what matters, send time-sensitive work to Plan, and keep context available for Today.
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
                }}
                placeholder="Paste one messy thought to classify locally"
              />
            </label>
            <p>Local preview only. Nothing is saved, sent, synced, or remembered from this card.</p>
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
              <div className="assistant-suggestion-actions" aria-label="Preview-only approval actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setPreviewApprovalState("approved");
                    setShowTaskHandoff(false);
                    setTaskHandoffPreview(null);
                    setShowReviewHandoff(false);
                    setReviewHandoffPreview(null);
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
                  {approvalStatePreviewLabels[state]}
                </button>
              ))}
            </div>
            <p className={`assistant-approval-state-note assistant-approval-state-note-${activeApprovalState}`}>
              {approvalStatePreviewLabels[visibleApprovalState]} only. Approval creates an unsaved draft preview here,
              not a task, note, calendar item, email, sync, or memory.
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
                      setTaskHandoffPreview(preview);
                      setShowTaskHandoff(Boolean(preview));
                    }}
                  >
                    Preview task row handoff
                  </button>
                  <span>This only prepares an editable local row. It does not save.</span>
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
                    }}
                  >
                    Preview {approvedLocalDraft.draftType === "follow-up" ? "follow-up" : "reminder"} handoff
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
            <article className="assistant-task-handoff-preview" aria-label="Editable unsaved task-row preview">
              <div className="assistant-local-draft-header">
                <span>Explicit handoff preview</span>
                <strong>Editable unsaved task row</strong>
              </div>
              <div className="task-row-grid task-row-card assistant-task-handoff-row">
                <label className="field-stack task-row-field">
                  <span>Task</span>
                  <input
                    type="text"
                    value={taskHandoffPreview.title}
                    onChange={(event) =>
                      setTaskHandoffPreview((current) => current ? { ...current, title: event.target.value } : current)
                    }
                  />
                </label>
                <label className="field-stack task-row-field">
                  <span>Kind</span>
                  <select
                    value={taskHandoffPreview.itemKind}
                    onChange={(event) =>
                      setTaskHandoffPreview((current) =>
                        current ? { ...current, itemKind: event.target.value as TaskRowDraft["itemKind"] } : current
                      )
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
                      setTaskHandoffPreview((current) => current ? { ...current, dueDate: event.target.value } : current)
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
                      setTaskHandoffPreview((current) =>
                        current ? { ...current, estimatedLength: event.target.value } : current
                      )
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
                      setTaskHandoffPreview((current) => current ? { ...current, notes: event.target.value } : current)
                    }
                  />
                </label>
              </div>
              {taskHandoffPreview.warnings.map((warning) => (
                <p key={warning} className="assistant-local-draft-warning">
                  {warning}
                </p>
              ))}
            </article>
          ) : null}

          {showReviewHandoff && reviewHandoffPreview ? (
            <article className="assistant-review-handoff-preview" aria-label="Editable unsaved follow-up or reminder preview">
              <div className="assistant-local-draft-header">
                <span>Explicit handoff preview</span>
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
