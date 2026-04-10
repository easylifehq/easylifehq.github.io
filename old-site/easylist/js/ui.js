// js/ui.js

import {
  formatTime,
  getPriorityMeta,
  toDateInputValue,
} from "./utils.js";

/* =========================
   CORE HELPERS
========================= */

export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* =========================
   PILLS
========================= */

export function createPriorityPillHTML(priorityTier, priorityLabel = "") {
  const meta = getPriorityMeta(priorityTier, priorityLabel);

  return `
    <span class="pill priority-pill priority-tier-${meta.tier}">
      ${escapeHTML(meta.label)}
    </span>
  `;
}

export function createCategoryPillHTML(category) {
  if (!category) return "";

  return `
    <span class="pill category-pill">
      ${escapeHTML(category)}
    </span>
  `;
}

/* =========================
   EMPTY STATES
========================= */

export function renderEmptyDayState() {
  return `
    <div class="task-stack empty-state">
      <p>No tasks parked here yet.</p>
    </div>
  `;
}

export function renderEmptyCompletedState() {
  return `
    <div class="empty-state">
      <p>Nothing knocked out yet today. Start with one annoying little win.</p>
    </div>
  `;
}

/* =========================
   TASK CARDS
========================= */

export function renderTaskCard(task) {
  const priority = getPriorityMeta(task.priorityTier, task.priorityLabel);

  const metaParts = [];
  if (task.category) metaParts.push(task.category);
  if (task.estimatedLength) metaParts.push(`${task.estimatedLength} min`);

  return `
    <button
      type="button"
      class="task-card priority-tier-${priority.tier}"
      data-task-id="${escapeHTML(task.id)}"
    >
      <div class="task-main">
        <span class="task-title">${escapeHTML(task.title || "Untitled task")}</span>
        <span class="task-meta">
          ${escapeHTML(metaParts.join(" • ") || "No details yet")}
        </span>
      </div>

      <div class="task-side">
        <span class="task-priority">${escapeHTML(priority.label)}</span>
        <span
          class="task-complete-action"
          data-complete-task="${escapeHTML(task.id)}"
          aria-label="Mark ${escapeHTML(task.title || "task")} complete"
          title="Mark complete"
        >
          ✓
        </span>
      </div>
    </button>
  `;
}

/* =========================
   COMPLETED TODAY
========================= */

export function renderCompletedItem(task) {
  const completedTime = task.completedAt ? formatTime(task.completedAt) : "";

  return `
    <article class="completed-item" data-task-id="${escapeHTML(task.id)}">
      <div>
        <h3>${escapeHTML(task.title || "Untitled task")}</h3>
        <p>${escapeHTML(completedTime ? `Handled at ${completedTime}` : "")}</p>
      </div>

      <span class="completed-badge">Handled</span>
    </article>
  `;
}

/* =========================
   DRAWER
========================= */

export function openDrawer(drawer) {
  if (!drawer) return;

  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

export function closeDrawer(drawer) {
  if (!drawer) return;

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

export function fillDrawer(drawer, task) {
  if (!drawer || !task) return;

  const titleInput = drawer.querySelector('[data-field="title"]');
  const dueDateInput = drawer.querySelector('[data-field="dueDate"]');
  const categoryInput = drawer.querySelector('[data-field="category"]');
  const estimatedInput = drawer.querySelector('[data-field="estimatedLength"]');
  const prioritySelect = drawer.querySelector('[data-field="priorityTier"]');
  const notesInput = drawer.querySelector('[data-field="notes"]');

  if (titleInput) titleInput.value = task.title || "";
  if (dueDateInput) dueDateInput.value = task.dueDate ? toDateInputValue(task.dueDate) : "";
  if (categoryInput) categoryInput.value = task.category || "";
  if (estimatedInput) estimatedInput.value = task.estimatedLength || "";
  if (prioritySelect) prioritySelect.value = String(Number(task.priorityTier) || 1);
  if (notesInput) notesInput.value = task.notes || "";

  const completeBtn = drawer.querySelector("[data-drawer-complete]");
  if (completeBtn) {
    completeBtn.dataset.drawerComplete = task.id;
    completeBtn.textContent = task.completed ? "Already Complete" : "Mark Complete";
    completeBtn.disabled = task.completed;
  }

  const saveBtn = drawer.querySelector("[data-save-task]");
  if (saveBtn) {
    saveBtn.dataset.saveTask = task.id;
  }

  const deleteBtn = drawer.querySelector("[data-delete-task]");
  if (deleteBtn) {
    deleteBtn.dataset.deleteTask = task.id;
  }
}