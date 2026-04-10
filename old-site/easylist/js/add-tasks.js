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
  draftAssistMessage: document.getElementById("draftAssistMessage"),
  draftInput: document.getElementById("draftInput"),
  analyzeDraftBtn: document.getElementById("analyzeDraftBtn"),
  addAllDraftsBtn: document.getElementById("addAllDraftsBtn"),
  draftSuggestions: document.getElementById("draftSuggestions"),
  form: document.getElementById("addTasksForm"),
  logoutBtn: document.getElementById("logoutBtn"),
  brandMenuBtn: document.getElementById("brandMenuBtn"),
  brandDropdownMenu: document.getElementById("brandDropdownMenu"),
};

const state = {
  currentUser: null,
  draftSuggestions: [],
  isSaving: false,
};

init();

function init() {
  initializeTheme();
  wireThemeControls();
  renderDraftSuggestions();
  bindEvents();
  protectPage();
  setupBrandMenu();
}

function bindEvents() {
  elements.addRowBtn?.addEventListener("click", handleAddRow);
  elements.analyzeDraftBtn?.addEventListener("click", handleAnalyzeDraft);
  elements.addAllDraftsBtn?.addEventListener("click", handleAddAllDrafts);
  elements.form?.addEventListener("submit", handleSaveTasks);
  elements.logoutBtn?.addEventListener("click", handleLogout);

  elements.rowsContainer?.addEventListener("click", handleRowActions);
  elements.rowsContainer?.addEventListener("input", handleRowInput);
  elements.rowsContainer?.addEventListener("change", handleRowInput);
  elements.draftInput?.addEventListener("input", clearDraftAssistMessage);
  elements.draftSuggestions?.addEventListener("click", handleDraftSuggestionActions);

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

    renderDraftSuggestions();
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

function handleDraftSuggestionActions(event) {
  const addBtn = event.target.closest("[data-action='add-draft']");
  if (!addBtn) return;

  const draftIndex = Number(addBtn.dataset.index);
  const draft = state.draftSuggestions[draftIndex];
  if (!draft) return;

  addTaskRow(draft);
  showDraftAssistMessage(`Added "${draft.title}" to the builder.`, "success");
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
    <label class="task-field">
      <span class="task-field-label">Title</span>
      <input
        type="text"
        data-field="title"
        placeholder="Call insurance"
        value="${escapeHTML(prefill.title ?? "")}"
      />
    </label>

    <label class="task-field">
      <span class="task-field-label">Due Date</span>
      <input
        type="date"
        data-field="dueDate"
        value="${escapeHTML(prefill.dueDate ?? "")}"
      />
    </label>

    <label class="task-field">
      <span class="task-field-label">Category</span>
      <input
        type="text"
        data-field="category"
        placeholder="Life Admin"
        value="${escapeHTML(prefill.category ?? "")}"
      />
    </label>

    <label class="task-field">
      <span class="task-field-label">Est. Length</span>
      <select data-field="estimatedLength">
        ${getEstimatedLengthOptions(String(prefill.estimatedLength ?? ""))}
      </select>
    </label>

    <label class="task-field">
      <span class="task-field-label">Priority</span>
      <select data-field="priorityTier">
        ${getPriorityOptions(Number(prefill.priorityTier ?? DEFAULT_PRIORITY_TIER))}
      </select>
    </label>

    <label class="task-field">
      <span class="task-field-label">Recurring</span>
      <select data-field="recurring">
        <option value="false" ${prefill.recurring ? "" : "selected"}>One-time</option>
        <option value="true" ${prefill.recurring ? "selected" : ""}>Recurring</option>
      </select>
    </label>

    <label class="task-field">
      <span class="task-field-label">Notes</span>
      <input
        type="text"
        data-field="notes"
        placeholder="Ask about deductible"
        value="${escapeHTML(prefill.notes ?? "")}"
      />
    </label>

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

function startOfDay(dateInput = new Date()) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(dateInput, days) {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
}

function getNextWeekday(targetDay) {
  const today = startOfDay(new Date());
  const todayDay = today.getDay();
  let distance = (targetDay - todayDay + 7) % 7;

  if (distance === 0) {
    distance = 7;
  }

  return addDays(today, distance);
}

function extractDueDate(text) {
  const lower = text.toLowerCase();
  const today = startOfDay(new Date());

  if (/\btoday\b/.test(lower)) return toDateInputValue(today);
  if (/\btomorrow\b/.test(lower)) return toDateInputValue(addDays(today, 1));
  if (/\bthis weekend\b/.test(lower)) return toDateInputValue(getNextWeekday(6));
  if (/\bnext week\b/.test(lower)) return toDateInputValue(addDays(today, 7));

  const weekdayMatchers = [
    { pattern: /\bmonday\b/, day: 1 },
    { pattern: /\btuesday\b/, day: 2 },
    { pattern: /\bwednesday\b/, day: 3 },
    { pattern: /\bthursday\b/, day: 4 },
    { pattern: /\bfriday\b/, day: 5 },
    { pattern: /\bsaturday\b/, day: 6 },
    { pattern: /\bsunday\b/, day: 0 },
  ];

  const match = weekdayMatchers.find((item) => item.pattern.test(lower));
  return match ? toDateInputValue(getNextWeekday(match.day)) : "";
}

function inferCategory(text) {
  const lower = text.toLowerCase();

  if (/(professor|class|assignment|school|study|exam|campus)/.test(lower)) return "School";
  if (/(grocer|laundry|clean|kitchen|home|apartment|roommate|dinner|cook)/.test(lower)) return "Home";
  if (/(job|resume|recruiter|application|interview|linkedin)/.test(lower)) return "Career";
  if (/(email|call|insurance|bank|doctor|dentist|lease|landlord|form|follow up)/.test(lower)) {
    return "Life Admin";
  }

  return "";
}

function inferPriorityTier(text) {
  const lower = text.toLowerCase();

  if (/(asap|urgent|important|deadline|immediately|today)/.test(lower)) return 4;
  if (/(soon|follow up|this week|tomorrow)/.test(lower)) return 3;
  return DEFAULT_PRIORITY_TIER;
}

function cleanDraftTitle(text) {
  return text
    .replace(/\b(today|tomorrow|this weekend|next week)\b/gi, "")
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\-\*\d\.\)\]]+\s*/, "")
    .trim()
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

function splitDraftInput(text) {
  const normalized = text.replace(/\r/g, "").trim();
  if (!normalized) return [];

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  return normalized
    .split(/(?:;|(?<=[.!?])\s+(?=[A-Z0-9]))/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildDraftSuggestions(text) {
  return splitDraftInput(text)
    .map((chunk) => {
      const title = cleanDraftTitle(chunk);
      if (!title) return null;

      const priorityTier = inferPriorityTier(chunk);

      return {
        title,
        dueDate: extractDueDate(chunk),
        category: inferCategory(chunk),
        estimatedLength: "",
        priorityTier,
        recurring: false,
        notes: "",
        originalText: chunk,
      };
    })
    .filter(Boolean);
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

function showDraftAssistMessage(message, stateName = "") {
  if (!elements.draftAssistMessage) return;

  elements.draftAssistMessage.textContent = message;
  if (stateName) {
    elements.draftAssistMessage.dataset.state = stateName;
  } else {
    delete elements.draftAssistMessage.dataset.state;
  }
}

function clearDraftAssistMessage() {
  showDraftAssistMessage("");
}

function renderDraftSuggestions() {
  if (!elements.draftSuggestions) return;

  if (!state.draftSuggestions.length) {
    elements.draftSuggestions.innerHTML = `
      <div class="draft-empty">
        Paste a few lines above and EasyList will draft rows you can review before adding.
      </div>
    `;
    return;
  }

  elements.draftSuggestions.innerHTML = state.draftSuggestions
    .map((draft, index) => {
      const meta = [];
      if (draft.dueDate) meta.push(`Due ${escapeHTML(draft.dueDate)}`);
      if (draft.category) meta.push(escapeHTML(draft.category));
      meta.push(escapeHTML(getPriorityMeta(draft.priorityTier).label));

      return `
        <article class="draft-card">
          <div class="draft-card-top">
            <div>
              <h3>${escapeHTML(draft.title)}</h3>
              <p>${escapeHTML(draft.originalText)}</p>
            </div>

            <button
              type="button"
              class="ghost-btn"
              data-action="add-draft"
              data-index="${index}"
            >
              Add Row
            </button>
          </div>

          <div class="draft-meta">
            ${meta.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
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

function handleAnalyzeDraft() {
  const input = elements.draftInput?.value.trim() || "";

  if (!input) {
    state.draftSuggestions = [];
    renderDraftSuggestions();
    showDraftAssistMessage("Paste some text first so EasyList has something to analyze.", "error");
    return;
  }

  state.draftSuggestions = buildDraftSuggestions(input);
  renderDraftSuggestions();

  if (!state.draftSuggestions.length) {
    showDraftAssistMessage("Could not turn that into draft rows yet. Try one task or thought per line.", "error");
    return;
  }

  showDraftAssistMessage(
    `${state.draftSuggestions.length} draft row${state.draftSuggestions.length === 1 ? "" : "s"} ready to review.`,
    "success"
  );
}

function handleAddAllDrafts() {
  if (!state.draftSuggestions.length) {
    showDraftAssistMessage("Analyze some text first, then add the drafts you want.", "error");
    return;
  }

  state.draftSuggestions.forEach((draft) => addTaskRow(draft));
  showDraftAssistMessage(
    `${state.draftSuggestions.length} draft row${state.draftSuggestions.length === 1 ? "" : "s"} added to the builder.`,
    "success"
  );
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
