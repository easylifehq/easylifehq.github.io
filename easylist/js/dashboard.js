// js/dashboard.js

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
import { initializeTheme, wireThemeControls } from "./theme.js";
import {
  buildMotivationData,
  getCurrentWeek,
  getEnergyLabel,
  getPriorityMeta,
  getWeekRangeLabel,
  groupTasksByDay,
  isCompletedToday,
  normalizeTask,
} from "./utils.js";
import {
  closeDrawer,
  fillDrawer,
  openDrawer,
  renderCompletedItem,
  renderEmptyCompletedState,
  renderEmptyDayState,
  renderTaskCard,
} from "./ui.js";

import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

await setPersistence(auth, browserLocalPersistence);

const state = {
  uid: null,
  tasks: [],
  activeTasks: [],
  completedTodayTasks: [],
  weekDays: getCurrentWeek(),
  selectedTask: null,
};

const elements = {
  plannerGrid: document.getElementById("plannerGrid"),
  completedTodayList: document.getElementById("completedTodayList"),
  taskDrawer: document.getElementById("taskDrawer"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  closeDrawerBtn: document.getElementById("closeDrawerBtn"),
  openTaskCount: document.getElementById("openTaskCount"),
  todayCompleteCount: document.getElementById("todayCompleteCount"),
  energyLabel: document.getElementById("energyLabel"),
  currentWeekLabel: document.getElementById("currentWeekLabel"),
  jumpTodayBtn: document.getElementById("jumpTodayBtn"),
  refreshWeekBtn: document.getElementById("refreshWeekBtn"),
  motivationPanel: document.getElementById("motivationPanel"),
  logoutBtn: document.getElementById("logoutBtn"),
};

init();

function init() {
  initializeTheme();
  wireThemeControls();
  setupPlannerEvents();
  setupCompletedEvents();
  setupDrawerEvents();
  setupWeekButtons();
  setupTopbarActions();
  initAuth();
}

function redirectToLogin() {
  window.location.replace("https://easylifehq.com/login.html");
}

function getTasksCollection(uid) {
  return collection(db, "users", uid, "tasks");
}

async function loadTasks(uid) {
  const snapshot = await getDocs(getTasksCollection(uid));
  return snapshot.docs.map(normalizeTask);
}

function splitTasks(tasks) {
  state.activeTasks = tasks.filter((task) => !task.completed);
  state.completedTodayTasks = tasks.filter((task) => isCompletedToday(task));
}

function updateWeekLabel() {
  const valueEl = elements.currentWeekLabel?.querySelector(".pill-value");
  if (valueEl) {
    valueEl.textContent = getWeekRangeLabel(state.weekDays);
  }
}

function renderPlanner() {
  if (!elements.plannerGrid) return;

  const grouped = groupTasksByDay(state.activeTasks, state.weekDays);

  elements.plannerGrid.innerHTML = state.weekDays
    .map((day) => {
      const tasks = grouped[day.key] || [];

      return `
        <article class="day-card ${day.isToday ? "today" : ""}" data-day-key="${day.key}">
          <header class="day-card-header">
            <div>
              <p class="day-name">${day.dayLabel}</p>
              <h3 class="day-date">${day.dateLabel}</h3>
            </div>
            ${day.isToday ? `<span class="day-badge">Today</span>` : ""}
          </header>

          ${
            tasks.length
              ? `<div class="task-stack">${tasks.map(renderTaskCard).join("")}</div>`
              : renderEmptyDayState()
          }
        </article>
      `;
    })
    .join("");
}

function getDateValue(value) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (typeof value?.getTime === "function") return value.getTime();

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function renderCompletedTodayList() {
  if (!elements.completedTodayList) return;

  if (!state.completedTodayTasks.length) {
    elements.completedTodayList.innerHTML = renderEmptyCompletedState();
    return;
  }

  const sorted = [...state.completedTodayTasks].sort(
    (a, b) => getDateValue(b.completedAt) - getDateValue(a.completedAt)
  );

  elements.completedTodayList.innerHTML = sorted.map(renderCompletedItem).join("");
}

function renderHeroStats() {
  if (elements.openTaskCount) {
    elements.openTaskCount.textContent = String(state.activeTasks.length);
  }

  if (elements.todayCompleteCount) {
    elements.todayCompleteCount.textContent = String(state.completedTodayTasks.length);
  }

  if (elements.energyLabel) {
    elements.energyLabel.textContent = getEnergyLabel(state.completedTodayTasks.length);
  }

  const knockedOutChip = document.getElementById("knockedOutChip");
  if (knockedOutChip) {
    knockedOutChip.textContent = `${state.completedTodayTasks.length} done`;
  }
}

function renderMotivationPanel() {
  if (!elements.motivationPanel) return;

  const motivation = buildMotivationData(
    state.completedTodayTasks.length,
    state.activeTasks.length,
    state.completedTodayTasks
  );

  elements.motivationPanel.innerHTML = `
    <p class="motivation-kicker">Today’s read</p>
    <h3>${motivation.title}</h3>
    <p class="motivation-text">${motivation.body}</p>

    <div class="motivation-notes">
      <article class="motivation-card">
        <span class="motivation-label">Best streak</span>
        <strong>${motivation.bestStreak}</strong>
      </article>
      <article class="motivation-card">
        <span class="motivation-label">Top category</span>
        <strong>${motivation.topCategory}</strong>
      </article>
      <article class="motivation-card">
        <span class="motivation-label">Current tone</span>
        <strong>${motivation.tone}</strong>
      </article>
    </div>
  `;
}

function renderAll() {
  updateWeekLabel();
  renderPlanner();
  renderCompletedTodayList();
  renderHeroStats();
  renderMotivationPanel();
}

function findTaskById(taskId) {
  return state.tasks.find((task) => task.id === taskId) || null;
}

function openTaskDetails(taskId) {
  const task = findTaskById(taskId);
  if (!task || !elements.taskDrawer) return;

  state.selectedTask = task;
  fillDrawer(elements.taskDrawer, task);
  openDrawer(elements.taskDrawer);
}

async function markTaskComplete(taskId) {
  if (!state.uid || !taskId) return;

  const taskRef = doc(db, "users", state.uid, "tasks", taskId);
  const now = Timestamp.now();

  await updateDoc(taskRef, {
    completed: true,
    completedAt: now,
    updatedAt: now,
  });

  await refreshDashboard();
}

async function saveDrawerTask(taskId) {
  if (!state.uid || !taskId || !elements.taskDrawer) return;

  const title = elements.taskDrawer.querySelector('[data-field="title"]')?.value.trim() || "";
  const dueDateValue = elements.taskDrawer.querySelector('[data-field="dueDate"]')?.value || "";
  const category = elements.taskDrawer.querySelector('[data-field="category"]')?.value.trim() || "";
  const estimatedLengthRaw =
    elements.taskDrawer.querySelector('[data-field="estimatedLength"]')?.value.trim() || "";
  const notes = elements.taskDrawer.querySelector('[data-field="notes"]')?.value.trim() || "";
  const priorityTier =
    Number(elements.taskDrawer.querySelector('[data-field="priorityTier"]')?.value) || 3;

  if (!title) return;

  const taskRef = doc(db, "users", state.uid, "tasks", taskId);
  const priorityMeta = getPriorityMeta(priorityTier);

  await updateDoc(taskRef, {
    title,
    dueDate: dueDateValue || null,
    category,
    estimatedLength: estimatedLengthRaw ? Number(estimatedLengthRaw) : "",
    priorityTier,
    priorityLabel: priorityMeta.label,
    notes,
    updatedAt: Timestamp.now(),
  });

  closeDrawer(elements.taskDrawer);
  await refreshDashboard();
}

async function deleteTask(taskId) {
  if (!state.uid || !taskId) return;

  const taskRef = doc(db, "users", state.uid, "tasks", taskId);
  await deleteDoc(taskRef);

  closeDrawer(elements.taskDrawer);
  await refreshDashboard();
}

async function refreshDashboard() {
  if (!state.uid) return;

  state.weekDays = getCurrentWeek();
  state.tasks = await loadTasks(state.uid);
  splitTasks(state.tasks);
  renderAll();
}

function setupPlannerEvents() {
  elements.plannerGrid?.addEventListener("click", async (event) => {
    const completeBtn = event.target.closest("[data-complete-task]");
    if (completeBtn) {
      event.stopPropagation();
      await markTaskComplete(completeBtn.dataset.completeTask);
      return;
    }

    const taskCard = event.target.closest("[data-task-id]");
    if (taskCard) {
      openTaskDetails(taskCard.dataset.taskId);
    }
  });
}

function setupCompletedEvents() {
  elements.completedTodayList?.addEventListener("click", (event) => {
    const item = event.target.closest("[data-task-id]");
    if (item) {
      openTaskDetails(item.dataset.taskId);
    }
  });
}

function setupDrawerEvents() {
  elements.closeDrawerBtn?.addEventListener("click", () => {
    closeDrawer(elements.taskDrawer);
  });

  elements.drawerBackdrop?.addEventListener("click", () => {
    closeDrawer(elements.taskDrawer);
  });

  elements.taskDrawer?.addEventListener("click", async (event) => {
    const completeBtn = event.target.closest("[data-drawer-complete]");
    if (completeBtn) {
      await markTaskComplete(completeBtn.dataset.drawerComplete);
      closeDrawer(elements.taskDrawer);
      return;
    }

    const saveBtn = event.target.closest("[data-save-task]");
    if (saveBtn) {
      await saveDrawerTask(saveBtn.dataset.saveTask);
      return;
    }

    const deleteBtn = event.target.closest("[data-delete-task]");
    if (deleteBtn) {
      await deleteTask(deleteBtn.dataset.deleteTask);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer(elements.taskDrawer);
    }
  });
}

function setupWeekButtons() {
  elements.refreshWeekBtn?.addEventListener("click", async () => {
    await refreshDashboard();
  });

  elements.jumpTodayBtn?.addEventListener("click", () => {
    const todayCard = elements.plannerGrid?.querySelector(".day-card.today");
    todayCard?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  });
}

function setupTopbarActions() {
  elements.logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    redirectToLogin();
  });
}

function renderErrorState() {
  if (!elements.plannerGrid) return;

  elements.plannerGrid.innerHTML = `
    <article class="day-card">
      <header class="day-card-header">
        <div>
          <p class="day-name">Error</p>
          <h3 class="day-date">Could not load tasks</h3>
        </div>
      </header>
      <div class="task-stack empty-state">
        <p>Try refreshing the page.</p>
      </div>
    </article>
  `;
}

function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      redirectToLogin();
      return;
    }

    state.uid = user.uid;

    try {
      await refreshDashboard();
    } catch (error) {
      console.error("Dashboard load failed:", error);
      renderErrorState();
    }
  });
}