import { useState, type FormEvent } from "react";
import type { TaskDraft } from "@/lib/firestore/tasks";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";

type TaskComposerProps = {
  onSubmit: (draft: TaskDraft) => Promise<void>;
};

export function TaskComposer({ onSubmit }: TaskComposerProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedLength, setEstimatedLength] = useState("");
  const [priorityTier, setPriorityTier] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        category: category.trim(),
        dueDate: dueDate || null,
        estimatedLength: estimatedLength ? Number(estimatedLength) : null,
        priorityTier,
        priorityLabel: getPriorityMeta(priorityTier).label,
        notes: notes.trim(),
        recurring: false,
      });

      setTitle("");
      setCategory("");
      setDueDate("");
      setEstimatedLength("");
      setPriorityTier(3);
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="task-composer" onSubmit={handleSubmit}>
      <div className="task-composer-grid">
        <label className="field-stack">
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Call insurance"
            required
          />
        </label>

        <label className="field-stack">
          <span>Category</span>
          <input
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Life Admin"
          />
        </label>

        <label className="field-stack">
          <span>Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>

        <label className="field-stack">
          <span>Duration</span>
          <input
            type="number"
            min="0"
            step="5"
            value={estimatedLength}
            onChange={(event) => setEstimatedLength(event.target.value)}
            placeholder="30"
          />
        </label>

        <label className="field-stack">
          <span>Priority</span>
          <select
            value={priorityTier}
            onChange={(event) => setPriorityTier(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}
          >
            {[1, 2, 3, 4, 5].map((tier) => (
              <option key={tier} value={tier}>
                {getPriorityMeta(tier).label}
              </option>
            ))}
          </select>
        </label>

        <label className="field-stack field-stack-wide">
          <span>Notes</span>
          <input
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any context that matters"
          />
        </label>
      </div>

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Add Task"}
      </button>
    </form>
  );
}
