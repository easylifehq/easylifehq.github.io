// js/archive.js

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
import { initializeTheme, wireThemeControls } from "./theme.js";
import {
  formatDisplayDate,
  groupCompletedTasksByWeek,
  normalizeTask,
  truncateText,
} from "./utils.js";
import {
  createCategoryPillHTML,
  createPriorityPillHTML,
  escapeHTML,
} from "./ui.js";

import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

await setPersistence(auth, browserLocalPersistence);

const elements = {
  archiveLoading: document.getElementById("archiveLoading"),
  archiveEmpty: document.getElementById("archiveEmpty"),
  archiveList: document.getElementById("archiveList"),
  completedCount: document.getElementById("completedCount"),
  weekCount: document.getElementById("weekCount"),
  latestCompletion: document.getElementById("latestCompletion"),
  logoutBtn: document.getElementById("logoutBtn"),
};

init();

function init() {
  initializeTheme();
  wireThemeControls();
  bindEvents();
  protectPage();
}

function redirectToLogin() {
  window.location.replace("../../login.html");
}

function getTasksCollectionRef(uid) {
  return collection(db, "users", uid, "tasks");
}

function bindEvents() {
  elements.logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    redirectToLogin();
  });

  elements.archiveList?.addEventListener("click", (event) => {
    const header = event.target.closest(".archive-week-header");
    if (!header) return;

    const weekSection = header.closest(".archive-week");
    if (!weekSection) return;

    const isCollapsed = weekSection.classList.toggle("collapsed");
    header.setAttribute("aria-expanded", String(!isCollapsed));
  });
}

async function fetchCompletedTasks(uid) {
  const tasksRef = getTasksCollectionRef(uid);
  const snapshot = await getDocs(query(tasksRef));

  return snapshot.docs
    .map(normalizeTask)
    .filter((task) => task.completed && task.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}

function renderSummary(tasks, groupedWeeks) {
  if (elements.completedCount) {
    elements.completedCount.textContent = String(tasks.length);
  }

  if (elements.weekCount) {
    elements.weekCount.textContent = String(groupedWeeks.length);
  }

  if (elements.latestCompletion) {
    elements.latestCompletion.textContent = tasks.length
      ? formatDisplayDate(tasks[0].completedAt)
      : "—";
  }
}

function buildMetaRow(task) {
  const parts = [];

  if (task.category) parts.push(escapeHTML(task.category));
  if (task.estimatedLength) parts.push(`${escapeHTML(String(task.estimatedLength))} min`);
  if (task.dueDate) {
    parts.push(`Due ${formatDisplayDate(task.dueDate, { short: true })}`);
  } else {
    parts.push("No due date");
  }

  parts.push(`Knocked out ${formatDisplayDate(task.completedAt, { short: true })}`);

  return parts
    .map((part, index) =>
      index === 0
        ? `<span>${part}</span>`
        : `<span><span class="archive-meta-dot">•</span> ${part}</span>`
    )
    .join("");
}

function createTaskCardHTML(task) {
  const notesPreview = task.notes
    ? `<p class="archive-task-notes">${escapeHTML(truncateText(task.notes, 140))}</p>`
    : "";

  return `
    <article class="archive-task">
      <div class="archive-task-top">
        <div class="archive-task-main">
          <h3 class="archive-task-title">${escapeHTML(task.title || "Untitled task")}</h3>
        </div>

        <div class="archive-task-pills">
          ${task.category ? createCategoryPillHTML(task.category) : ""}
          ${createPriorityPillHTML(task.priorityTier, task.priorityLabel)}
        </div>
      </div>

      <div class="archive-task-meta">
        ${buildMetaRow(task)}
      </div>

      ${notesPreview}
    </article>
  `;
}

function createWeekSectionHTML(weekGroup, index) {
  const defaultCollapsed = index > 1;

  return `
    <section class="archive-week ${defaultCollapsed ? "collapsed" : ""}" data-week-key="${escapeHTML(weekGroup.key)}">
      <button
        class="archive-week-header"
        type="button"
        aria-expanded="${defaultCollapsed ? "false" : "true"}"
      >
        <div class="archive-week-left">
          <span class="archive-week-title">${escapeHTML(weekGroup.label)}</span>
          <span class="archive-week-subtitle">
            ${weekGroup.tasks.length} task${weekGroup.tasks.length === 1 ? "" : "s"} finished
          </span>
        </div>

        <span class="archive-week-toggle">⌄</span>
      </button>

      <div class="archive-week-body">
        ${weekGroup.tasks.map(createTaskCardHTML).join("")}
      </div>
    </section>
  `;
}

function renderArchive(tasks) {
  const groupedWeeks = groupCompletedTasksByWeek(tasks);

  renderSummary(tasks, groupedWeeks);

  elements.archiveLoading?.classList.add("hidden");

  if (!groupedWeeks.length) {
    elements.archiveEmpty?.classList.remove("hidden");
    elements.archiveList?.classList.add("hidden");
    return;
  }

  elements.archiveEmpty?.classList.add("hidden");
  if (elements.archiveList) {
    elements.archiveList.classList.remove("hidden");
    elements.archiveList.innerHTML = groupedWeeks
      .map((weekGroup, index) => createWeekSectionHTML(weekGroup, index))
      .join("");
  }
}

function renderArchiveError() {
  if (elements.archiveLoading) {
    elements.archiveLoading.classList.remove("hidden");
    elements.archiveLoading.textContent = "Could not load your archive right now.";
  }

  elements.archiveEmpty?.classList.add("hidden");
  elements.archiveList?.classList.add("hidden");
}

function protectPage() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      redirectToLogin();
      return;
    }

    try {
      const tasks = await fetchCompletedTasks(user.uid);
      renderArchive(tasks);
    } catch (error) {
      console.error("Archive load failed:", error);
      renderArchiveError();
    }
  });
}