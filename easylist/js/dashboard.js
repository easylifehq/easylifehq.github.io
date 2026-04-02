// js/dashboard.js

import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
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
  getEnergyLabel,
  getPriorityMeta,
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

await setPersistence(auth, browserLocalPersistence);

const VIEW_MODES = {
  WEEK: "week",
  TWO_WEEKS: "twoWeeks",
  MONTH: "month",
};

const state = {
  uid: null,
  tasks: [],
  activeTasks: [],
  completedTodayTasks: [],
  selectedTask: null,
  viewMode: VIEW_MODES.WEEK,
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
  motivationPanel: document.getElementById("motivationPanel"),
  momentumBody: document.getElementById("momentumBody"),
  knockedOutChip: document.getElementById("knockedOutChip"),
  logoutBtn: document.getElementById("logoutBtn"),
  plannerHeading: document.getElementById("plannerHeading"),
  plannerSubtitle: document.getElementById("plannerSubtitle"),
  refreshPlannerBtn: document.getElementById("refreshPlannerBtn"),
  brandMenuBtn: document.getElementById("brandMenuBtn"),
  brandDropdownMenu: document.getElementById("brandDropdownMenu"),
  viewButtons: Array.from(document.querySelectorAll("[data-view-mode]")),
};

init();

function init() {
  initializeTheme();
  wireThemeControls();
  setupPlannerEvents();
  setupCompletedEvents();
  setupDrawerEvents();
  setupTopbarActions();
  setupViewSwitcher();
  setupBrandMenu();
  initAuth();
}

function redirectToLogin() {
  window.location.replace("../../login.html");
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

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayName(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function formatDayDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthDayDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthTitle(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDayKeyFromDate(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function getTaskDayKey(task) {
  if (!task?.dueDate) return null;

  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return null;

  return getDayKeyFromDate(due);
}

function getPlannerMeta(mode) {
  const today = startOfDay(new Date());

  if (mode === VIEW_MODES.WEEK) {
    const start = addDays(today, -1);
    const days = Array.from({ length: 8 }, (_, index) => {
      const date = addDays(start, index);
      return {
        key: getDayKeyFromDate(date),
        date,
        dayLabel: formatDayName(date),
        dateLabel: formatDayDate(date),
        isToday: isSameDay(date, today),
        inCurrentMonth: true,
      };
    });

    return {
      heading: "Your next 8 days",
      subtitle: "Yesterday through the next 6 days.",
      days,
      className: "week-view",
    };
  }

  if (mode === VIEW_MODES.TWO_WEEKS) {
    const start = today;
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = addDays(start, index);
      return {
        key: getDayKeyFromDate(date),
        date,
        dayLabel: formatDayName(date),
        dateLabel: formatDayDate(date),
        isToday: isSameDay(date, today),
        inCurrentMonth: true,
      };
    });

    return {
      heading: "Next 2 weeks",
      subtitle: "A wider look at what is coming up.",
      days,
      className: "two-week-view",
    };
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

  const days = [];
  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    days.push({
      key: getDayKeyFromDate(cursor),
      date: new Date(cursor),
      dayLabel: formatDayName(cursor),
      dateLabel: formatMonthDayDate(cursor),
      isToday: isSameDay(cursor, today),
      inCurrentMonth: cursor.getMonth() === today.getMonth(),
    });
  }

  return {
    heading: formatMonthTitle(today),
    subtitle: "Full month view.",
    days,
    className: "month-view",
  };
}

function groupTasksForPlanner(days) {
  const grouped = Object.fromEntries(days.map((day) => [day.key, []]));

  state.activeTasks.forEach((task) => {
    const key = getTaskDayKey(task);
    if (key && grouped[key]) {
      grouped[key].push(task);
    }
  });

  return grouped;
}

function renderPlanner() {
  if (!elements.plannerGrid) return;

  const planner = getPlannerMeta(state.viewMode);
  const grouped = groupTasksForPlanner(planner.days);

  elements.plannerGrid.className = `planner-grid ${planner.className}`;
  elements.plannerHeading.textContent = planner.heading;
  elements.plannerSubtitle.textContent = planner.subtitle;

  elements.plannerGrid.innerHTML = planner.days
    .map((day) => {
      const tasks = grouped[day.key] || [];
      const classes = [
        "day-card",
        day.isToday ? "today" : "",
        !day.inCurrentMonth ? "outside-month" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <article class="${classes}" data-day-key="${day.key}">
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

function renderMomentumStats() {
  if (elements.openTaskCount) {
    elements.openTaskCount.textContent = String(state.activeTasks.length);
  }

  if (elements.todayCompleteCount) {
    elements.todayCompleteCount.textContent = String(state.completedTodayTasks.length);
  }

  if (elements.energyLabel) {
    elements.energyLabel.textContent = getEnergyLabel(state.completedTodayTasks.length);
  }

  if (elements.knockedOutChip) {
    elements.knockedOutChip.textContent = `${state.completedTodayTasks.length} done`;
  }
}

function renderMotivationPanel() {
  if (!elements.momentumBody) return;

  const motivation = buildMotivationData(
    state.completedTodayTasks.length,
    state.activeTasks.length,
    state.completedTodayTasks
  );

  const heading = elements.motivationPanel?.querySelector(".momentum-header h2");
  if (heading) {
    heading.textContent = motivation.title;
  }

  elements.momentumBody.innerHTML = `
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

function setActiveViewButton() {
  elements.viewButtons.forEach((button) => {
    const isActive = button.dataset.viewMode === state.viewMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderAll() {
  renderPlanner();
  renderCompletedTodayList();
  renderMomentumStats();
  renderMotivationPanel();
  setActiveViewButton();
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
      closeBrandMenu();
    }
  });
}

function setupTopbarActions() {
  elements.logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    redirectToLogin();
  });

  elements.refreshPlannerBtn?.addEventListener("click", async () => {
    await refreshDashboard();
  });
}

function setupViewSwitcher() {
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.viewMode;
      if (!nextMode || nextMode === state.viewMode) return;

      state.viewMode = nextMode;
      renderPlanner();
      setActiveViewButton();
    });
  });
}

function openBrandMenu() {
  elements.brandDropdownMenu.hidden = false;
  elements.brandMenuBtn?.setAttribute("aria-expanded", "true");
}

function closeBrandMenu() {
  elements.brandDropdownMenu.hidden = true;
  elements.brandMenuBtn?.setAttribute("aria-expanded", "false");
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

function renderErrorState() {
  if (!elements.plannerGrid) return;

  elements.plannerGrid.className = "planner-grid week-view";
  elements.plannerHeading.textContent = "Could not load planner";
  elements.plannerSubtitle.textContent = "Try refreshing the page.";

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