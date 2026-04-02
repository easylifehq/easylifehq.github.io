// js/add-tasks.js

import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
import { getPriorityMeta, toDateInputValue } from "./utils.js";
import { initializeTheme, wireThemeControls } from "./theme.js";
import { escapeHTML } from "./ui.js";

await setPersistence(auth, browserLocalPersistence);

const DEFAULT_ROW_COUNT = 1;
const DEFAULT_PRIORITY_TIER = 3;

const elements = {
  rowsContainer: document.getElementById("taskRows"),
  addRowBtn: document.getElementById("addTaskRowBtn"),
  saveBtn: document.getElementById("saveTasksBtn"),
  pageMessage: document.getElementById("addTasksMessage"),
  form: document.getElementById("addTasksForm"),
  logoutBtn: document.getElementById("logoutBtn"),
  brandMenuBtn: document.getElementById("brandMenuBtn"),
  brandDropdownMenu: document.getElementById("brandDropdownMenu"),
};

const state = {
  currentUser: null,
  isSaving: false,
};

init();

function init() {
  initializeTheme();
  wireThemeControls();
  bindEvents();
  protectPage();
  setupBrandMenu();
}

function bindEvents() {
  elements.addRowBtn?.addEventListener("click", handleAddRow);
  elements.form?.addEventListener("submit", handleSaveTasks);
  elements.logoutBtn?.addEventListener("click", handleLogout);

  elements.rowsContainer?.addEventListener("click", handleRowActions);
  elements.rowsContainer?.addEventListener("input", handleRowInput);
  elements.rowsContainer?.addEventListener("change", handleRowInput);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBrandMenu();
    }
  });
}

function redirectToLogin() {
  window.location.replace("../../login.html");
}

function protectPage() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      redirectToLogin();
      return;
    }

    state.currentUser = user;

    if (elements.rowsContainer && !elements.rowsContainer.children.length) {
      renderInitialRows();
    }
  });
}

function renderInitialRows() {
  if (!elements.rowsContainer) return;

  elements.rowsContainer.innerHTML = "";
  for (let i = 0; i < DEFAULT_ROW_COUNT; i += 1) {
    addTaskRow();
  }
}

function handleAddRow() {
  addTaskRow();
  clearPageMessage();
}

function addTaskRow(prefill = {}) {
  if (!elements.rowsContainer) return;
  elements.rowsContainer.appendChild(createTaskRow(prefill));
}

function getPriorityOptions(selectedTier = DEFAULT_PRIORITY_TIER) {
  return [1, 2, 3, 4, 5]
    .map((tier) => {
      const meta = getPriorityMeta(tier);
      return `
        <option value="${tier}" ${Number(selectedTier) === tier ? "selected" : ""}>
          ${escapeHTML(meta.label)}
        </option>
      `;
    })
    .join("");
}

function getEstimatedLengthOptions(selectedValue = "") {
  const options = ["", "5", "10", "15", "20", "30", "45", "60", "90", "120"];

  return options
    .map((value) => {
      const label = value ? `${value} min` : "Length";
      return `
        <option value="${value}" ${String(selectedValue) === value ? "selected" : ""}>
          ${label}
        </option>
      `;
    })
    .join("");
}

function createTaskRow(prefill = {}) {
  const row = document.createElement("article");
  row.className = "task-row";
  row.dataset.rowId = crypto.randomUUID();

  row.innerHTML = `
    <input
      type="text"
      data-field="title"
      placeholder="Call insurance"
      value="${escapeHTML(prefill.title ?? "")}"
    />

    <input
      type="date"
      data-field="dueDate"
      value="${escapeHTML(prefill.dueDate ?? toDateInputValue(new Date()))}"
    />

    <input
      type="text"
      data-field="category"
      placeholder="Life Admin"
      value="${escapeHTML(prefill.category ?? "")}"
    />

    <select data-field="estimatedLength">
      ${getEstimatedLengthOptions(String(prefill.estimatedLength ?? ""))}
    </select>

    <select data-field="priorityTier">
      ${getPriorityOptions(Number(prefill.priorityTier ?? DEFAULT_PRIORITY_TIER))}
    </select>

    <select data-field="recurring">
      <option value="false" ${prefill.recurring ? "" : "selected"}>One-time</option>
      <option value="true" ${prefill.recurring ? "selected" : ""}>Recurring</option>
    </select>

    <input
      type="text"
      data-field="notes"
      placeholder="Ask about deductible"
      value="${escapeHTML(prefill.notes ?? "")}"
    />

    <button
      type="button"
      class="ghost-btn row-delete-btn"
      data-action="remove-row"
      aria-label="Remove row"
    >
      ✕
    </button>
  `;

  return row;
}

function handleRowActions(event) {
  const removeBtn = event.target.closest('[data-action="remove-row"]');
  if (!removeBtn) return;

  const row = removeBtn.closest(".task-row");
  if (!row) return;

  row.remove();
  clearPageMessage();

  if (elements.rowsContainer && !elements.rowsContainer.children.length) {
    addTaskRow();
  }
}

function handleRowInput() {
  clearPageMessage();
}

function getFieldValue(row, field) {
  const el = row.querySelector(`[data-field="${field}"]`);
  if (!el) return "";

  if (el.tagName === "SELECT" || el.tagName === "INPUT") {
    return el.value.trim();
  }

  return "";
}

function prepareRowData(row) {
  const title = getFieldValue(row, "title");
  const dueDate = getFieldValue(row, "dueDate");
  const category = getFieldValue(row, "category");
  const estimatedLengthRaw = getFieldValue(row, "estimatedLength");
  const priorityTier = Number(getFieldValue(row, "priorityTier")) || DEFAULT_PRIORITY_TIER;
  const recurring = getFieldValue(row, "recurring") === "true";
  const notes = getFieldValue(row, "notes");

  const isBlank =
    !title &&
    !dueDate &&
    !category &&
    !estimatedLengthRaw &&
    !notes &&
    !recurring &&
    priorityTier === DEFAULT_PRIORITY_TIER;

  if (isBlank) {
    return { isBlank: true, isValid: true, task: null };
  }

  if (!title) {
    return {
      isBlank: false,
      isValid: false,
      task: null,
      error: "Each saved row needs a title.",
    };
  }

  const priorityMeta = getPriorityMeta(priorityTier);
  const estimatedLength = estimatedLengthRaw ? Number(estimatedLengthRaw) : "";

  return {
    isBlank: false,
    isValid: true,
    task: {
      title,
      dueDate: dueDate || null,
      category,
      estimatedLength,
      recurring,
      priorityTier,
      priorityLabel: priorityMeta.label,
      notes,
      completed: false,
      completedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  };
}

function showPageMessage(message, stateName = "") {
  if (!elements.pageMessage) return;

  elements.pageMessage.textContent = message;
  if (stateName) {
    elements.pageMessage.dataset.state = stateName;
  } else {
    delete elements.pageMessage.dataset.state;
  }
}

function clearPageMessage() {
  showPageMessage("");
}

function setSavingState(isSaving) {
  state.isSaving = isSaving;

  if (elements.saveBtn) {
    elements.saveBtn.disabled = isSaving;
    elements.saveBtn.textContent = isSaving ? "Saving..." : "Save Tasks";
  }

  if (elements.addRowBtn) {
    elements.addRowBtn.disabled = isSaving;
  }
}

async function handleSaveTasks(event) {
  event.preventDefault();

  if (state.isSaving || !state.currentUser || !elements.rowsContainer) return;

  clearPageMessage();

  const rows = Array.from(elements.rowsContainer.querySelectorAll(".task-row"));
  const preparedRows = rows.map(prepareRowData);
  const nonBlankRows = preparedRows.filter((row) => !row.isBlank);
  const invalidRow = nonBlankRows.find((row) => !row.isValid);

  if (!nonBlankRows.length) {
    showPageMessage("Add at least one task before saving.", "error");
    return;
  }

  if (invalidRow) {
    showPageMessage(invalidRow.error || "A row needs fixing before saving.", "error");
    return;
  }

  try {
    setSavingState(true);

    const tasksRef = collection(db, "users", state.currentUser.uid, "tasks");

    await Promise.all(nonBlankRows.map((row) => addDoc(tasksRef, row.task)));

    showPageMessage(
      `${nonBlankRows.length} task${nonBlankRows.length === 1 ? "" : "s"} saved.`,
      "success"
    );

    renderInitialRows();
  } catch (error) {
    console.error("Failed to save tasks:", error);
    showPageMessage("Could not save tasks right now. Try again.", "error");
  } finally {
    setSavingState(false);
  }
}

async function handleLogout() {
  await signOut(auth);
  redirectToLogin();
}

function openBrandMenu() {
  if (!elements.brandDropdownMenu || !elements.brandMenuBtn) return;
  elements.brandDropdownMenu.hidden = false;
  elements.brandMenuBtn.setAttribute("aria-expanded", "true");
}

function closeBrandMenu() {
  if (!elements.brandDropdownMenu || !elements.brandMenuBtn) return;
  elements.brandDropdownMenu.hidden = true;
  elements.brandMenuBtn.setAttribute("aria-expanded", "false");
}

function setupBrandMenu() {
  if (!elements.brandMenuBtn || !elements.brandDropdownMenu) return;

  closeBrandMenu();

  elements.brandMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = !elements.brandDropdownMenu.hidden;

    if (isOpen) {
      closeBrandMenu();
    } else {
      openBrandMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (
      target instanceof Node &&
      !elements.brandDropdownMenu.contains(target) &&
      !elements.brandMenuBtn.contains(target)
    ) {
      closeBrandMenu();
    }
  });
}