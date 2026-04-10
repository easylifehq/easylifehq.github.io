import { useMemo, useState, type FormEvent } from "react";
import type { TaskDraft } from "@/lib/firestore/tasks";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";

type TaskComposerProps = {
  onSubmit: (draft: TaskDraft) => Promise<void>;
};

type TaskRowDraft = {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  estimatedLength: string;
  priorityTier: 1 | 2 | 3 | 4 | 5;
  notes: string;
};

const EMPTY_ROW = (): TaskRowDraft => ({
  id: crypto.randomUUID(),
  title: "",
  category: "",
  dueDate: "",
  estimatedLength: "",
  priorityTier: 3,
  notes: "",
});

function buildTaskDraft(row: TaskRowDraft): TaskDraft | null {
  if (!row.title.trim()) {
    return null;
  }

  return {
    title: row.title.trim(),
    category: row.category.trim(),
    dueDate: row.dueDate || null,
    estimatedLength: row.estimatedLength ? Number(row.estimatedLength) : null,
    priorityTier: row.priorityTier,
    priorityLabel: getPriorityMeta(row.priorityTier).label,
    notes: row.notes.trim(),
    recurring: false,
  };
}

function parseBrainDump(text: string): TaskRowDraft[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]?\s*(\[[ xX]\])?\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((line) => {
      const [title, notes = ""] = line.split(/\s+[|:-]\s+/, 2);
      return {
        ...EMPTY_ROW(),
        title: title.trim(),
        notes: notes.trim(),
      };
    });
}

export function TaskComposer({ onSubmit }: TaskComposerProps) {
  const [rows, setRows] = useState<TaskRowDraft[]>([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [brainDump, setBrainDump] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const readyCount = useMemo(
    () => rows.filter((row) => row.title.trim()).length,
    [rows]
  );

  function updateRow(rowId: string, field: keyof TaskRowDraft, value: string | number) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function addBlankRow() {
    setRows((current) => [...current, EMPTY_ROW()]);
  }

  function removeRow(rowId: string) {
    setRows((current) => {
      if (current.length === 1) {
        return [EMPTY_ROW()];
      }

      return current.filter((row) => row.id !== rowId);
    });
  }

  function handleBrainDumpToRows() {
    const parsedRows = parseBrainDump(brainDump);
    if (!parsedRows.length) {
      return;
    }

    setRows((current) => {
      const emptySlots = current.filter((row) => !row.title.trim());
      const filled = current.filter((row) => row.title.trim());
      const replacement = [...filled, ...parsedRows];
      const neededPadding = Math.max(1, emptySlots.length) - parsedRows.length;

      return [
        ...replacement,
        ...Array.from({ length: Math.max(neededPadding, 1) }, () => EMPTY_ROW()),
      ];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const drafts = rows.map(buildTaskDraft).filter(Boolean) as TaskDraft[];
    if (!drafts.length) return;

    setIsSubmitting(true);

    try {
      for (const draft of drafts) {
        await onSubmit(draft);
      }

      setRows([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
      setBrainDump("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="task-composer" onSubmit={handleSubmit}>
      <div className="brain-dump-card">
        <label className="field-stack">
          <span>Brain dump</span>
          <textarea
            value={brainDump}
            onChange={(event) => setBrainDump(event.target.value)}
            rows={5}
            placeholder="Drop a messy list here and turn it into task rows."
          />
        </label>

        <div className="brain-dump-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={handleBrainDumpToRows}
          >
            Turn Into Rows
          </button>
          <span className="helper-copy">One line per task works best.</span>
        </div>
      </div>

      <div className="task-rows-shell">
        <div className="task-row-grid task-row-grid-header" aria-hidden="true">
          <span>Task</span>
          <span>Category</span>
          <span>Due</span>
          <span>Minutes</span>
          <span>Priority</span>
          <span>Notes</span>
          <span>Row</span>
        </div>

        {rows.map((row, index) => (
          <div key={row.id} className="task-row-grid task-row-card">
            <label className="field-stack task-row-field">
              <span>Task</span>
              <input
                type="text"
                value={row.title}
                onChange={(event) => updateRow(row.id, "title", event.target.value)}
                placeholder={`Task ${index + 1}`}
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Category</span>
              <input
                type="text"
                value={row.category}
                onChange={(event) => updateRow(row.id, "category", event.target.value)}
                placeholder="Personal"
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Due</span>
              <input
                type="date"
                value={row.dueDate}
                onChange={(event) => updateRow(row.id, "dueDate", event.target.value)}
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Minutes</span>
              <input
                type="number"
                min="0"
                step="5"
                value={row.estimatedLength}
                onChange={(event) => updateRow(row.id, "estimatedLength", event.target.value)}
                placeholder="30"
              />
            </label>

            <label className="field-stack task-row-field">
              <span>Priority</span>
              <select
                value={row.priorityTier}
                onChange={(event) =>
                  updateRow(row.id, "priorityTier", Number(event.target.value))
                }
              >
                {[1, 2, 3, 4, 5].map((tier) => (
                  <option key={tier} value={tier}>
                    {getPriorityMeta(tier).label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-stack task-row-field">
              <span>Notes</span>
              <input
                type="text"
                value={row.notes}
                onChange={(event) => updateRow(row.id, "notes", event.target.value)}
                placeholder="Optional context"
              />
            </label>

            <div className="task-row-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => removeRow(row.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="task-composer-actions">
        <button type="button" className="button-secondary" onClick={addBlankRow}>
          Add Row
        </button>
        <button type="submit" className="primary-button" disabled={isSubmitting || readyCount === 0}>
          {isSubmitting ? "Saving..." : `Add ${readyCount || ""} Task${readyCount === 1 ? "" : "s"}`.trim()}
        </button>
      </div>
    </form>
  );
}
