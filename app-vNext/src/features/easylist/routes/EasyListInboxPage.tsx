import { LoadingState } from "@/components/feedback/LoadingState";
import { TaskComposer } from "@/features/easylist/components/TaskComposer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { useMemo, useState } from "react";

const FOLLOW_UP_PATTERN = /\b(email|reply|respond|follow up|follow-up|call|text|message)\b/i;

export function EasyListInboxPage() {
  const { tasks, isLoading, error, addTask } = useEasyList();
  const [listName, setListName] = useState("Main");
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

        <TaskComposer onSubmit={addTask} listName={selectedListName} showBrainDump={false} />
      </section>

      {error ? <p className="error-copy">{error}</p> : null}
    </>
  );
}
