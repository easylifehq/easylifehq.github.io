import { LoadingState } from "@/components/feedback/LoadingState";
import { PageSection } from "@/components/ui/PageSection";
import { TaskComposer } from "@/features/easylist/components/TaskComposer";
import { useEasyList } from "@/features/easylist/EasyListContext";
import { useMemo, useState } from "react";

export function EasyListInboxPage() {
  const { tasks, isLoading, error, addTask } = useEasyList();
  const [listName, setListName] = useState("Main");
  const listNames = useMemo(
    () => Array.from(new Set(["Main", ...tasks.map((task) => task.listName || "Main")])).sort(),
    [tasks]
  );

  if (isLoading) {
    return <LoadingState label="Loading EasyList..." />;
  }

  return (
    <>
      <PageSection
        eyebrow="Capture"
        title="Add task"
        description="Write one or more clear task rows. Details stay optional until the task needs them."
      >
        <div className="easylist-list-picker">
          <label className="field-stack">
            <span>Add to list</span>
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
        <TaskComposer onSubmit={addTask} listName={listName.trim() || "Main"} showBrainDump={false} />
      </PageSection>

      {error ? <p className="error-copy">{error}</p> : null}
    </>
  );
}
