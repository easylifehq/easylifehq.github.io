import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
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
      <PageSection
        eyebrow="Inbox"
        title="Capture, approve, plan, remember"
        description="Catch loose work, reminders, notes, and follow-ups in one intake. Approve what matters, send time-sensitive items to Plan, and keep context available for Today."
      >
        <div className="settings-status-grid" aria-label="Assistant inbox queue">
          {assistantQueue.map((item) => (
            <article className="settings-status-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="easylist-list-picker">
          <label className="field-stack">
            <span>Intake view</span>
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
        </div>
        <TaskComposer onSubmit={addTask} listName={selectedListName} showBrainDump={false} />
      </PageSection>

      {error ? <p className="error-copy">{error}</p> : null}
    </>
  );
}
