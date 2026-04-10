import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

await setPersistence(auth, browserLocalPersistence);

const SAVE_STATUS = {
  SAVED: "Everything saved",
  SAVING: "Saving...",
  DIRTY: "Unsaved changes",
};

const state = {
  uid: null,
  notes: [],
  selectedNoteId: null,
  search: "",
  autosaveTimer: null,
};

const elements = {
  brandMenuBtn: document.getElementById("brandMenuBtn"),
  brandDropdownMenu: document.getElementById("brandDropdownMenu"),
  logoutBtn: document.getElementById("logoutBtn"),
  saveStatus: document.getElementById("saveStatus"),
  newNoteBtn: document.getElementById("newNoteBtn"),
  searchInput: document.getElementById("searchInput"),
  noteCountLabel: document.getElementById("noteCountLabel"),
  notesList: document.getElementById("notesList"),
  noteTitleInput: document.getElementById("noteTitleInput"),
  noteTagsInput: document.getElementById("noteTagsInput"),
  notePinnedInput: document.getElementById("notePinnedInput"),
  noteEditor: document.getElementById("noteEditor"),
  deleteNoteBtn: document.getElementById("deleteNoteBtn"),
  turnIntoTaskBtn: document.getElementById("turnIntoTaskBtn"),
  clearFormatBtn: document.getElementById("clearFormatBtn"),
  toolbarButtons: Array.from(document.querySelectorAll("[data-command]")),
};

init();

function init() {
  setupBrandMenu();
  setupEvents();
  initAuth();
}

function getNotesCollection(uid) {
  return collection(db, "users", uid, "notes");
}

function getTasksCollection(uid) {
  return collection(db, "users", uid, "tasks");
}

function redirectToLogin() {
  window.location.replace("../login.html");
}

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toPlainText(html) {
  const shell = document.createElement("div");
  shell.innerHTML = html || "";
  return shell.textContent?.trim() || "";
}

function normalizeNote(entry) {
  const data = entry.data();
  return {
    id: entry.id,
    title: data.title || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    pinned: Boolean(data.pinned),
    bodyHtml: data.bodyHtml || "",
    bodyText: data.bodyText || "",
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return Number(b.pinned) - Number(a.pinned);
    }

    const aTime = a.updatedAt?.getTime() || a.createdAt?.getTime() || 0;
    const bTime = b.updatedAt?.getTime() || b.createdAt?.getTime() || 0;
    return bTime - aTime;
  });
}

async function loadNotes(uid) {
  const snapshot = await getDocs(getNotesCollection(uid));
  return sortNotes(snapshot.docs.map(normalizeNote));
}

function getFilteredNotes() {
  const term = state.search.trim().toLowerCase();
  if (!term) return state.notes;

  return state.notes.filter((note) => {
    const haystack = [note.title, note.bodyText, ...(note.tags || [])].join(" ").toLowerCase();
    return haystack.includes(term);
  });
}

function getSelectedNote() {
  return state.notes.find((note) => note.id === state.selectedNoteId) || null;
}

function setSaveStatus(next) {
  elements.saveStatus.textContent = next;
}

function formatNoteDate(note) {
  const date = note.updatedAt || note.createdAt;
  if (!date) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function renderNotesList() {
  const notes = getFilteredNotes();
  elements.noteCountLabel.textContent = `${notes.length} note${notes.length === 1 ? "" : "s"}`;

  if (!notes.length) {
    elements.notesList.innerHTML = `
      <div class="note-list-item">
        <h2>No notes yet</h2>
        <p>Start a new note and use this space for brain dumps, meetings, and rough ideas.</p>
      </div>
    `;
    return;
  }

  elements.notesList.innerHTML = notes
    .map((note) => {
      const active = note.id === state.selectedNoteId ? "active" : "";
      const title = escapeHtml(note.title || "Untitled note");
      const excerpt = escapeHtml(note.bodyText || "No content yet.");
      const pin = note.pinned ? `<span class="pin-badge">Pinned</span>` : `<span>${escapeHtml(formatNoteDate(note))}</span>`;

      return `
        <button type="button" class="note-list-item ${active}" data-note-id="${note.id}">
          <h2>${title}</h2>
          <p>${excerpt}</p>
          <div class="note-list-meta">
            ${pin}
            <span>${escapeHtml(formatNoteDate(note))}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderEditor() {
  const note = getSelectedNote();
  if (!note) return;

  elements.noteTitleInput.value = note.title;
  elements.noteTagsInput.value = note.tags.join(", ");
  elements.notePinnedInput.checked = note.pinned;
  elements.noteEditor.innerHTML = note.bodyHtml || "";
}

function renderAll() {
  renderNotesList();
  renderEditor();
}

async function refreshNotes() {
  if (!state.uid) return;

  state.notes = await loadNotes(state.uid);
  if (!state.selectedNoteId && state.notes.length) {
    state.selectedNoteId = state.notes[0].id;
  }

  if (state.selectedNoteId && !getSelectedNote()) {
    state.selectedNoteId = state.notes[0]?.id || null;
  }

  renderAll();
}

async function createNote() {
  if (!state.uid) return;

  const now = Timestamp.now();
  const noteRef = await addDoc(getNotesCollection(state.uid), {
    title: "",
    tags: [],
    pinned: false,
    bodyHtml: "",
    bodyText: "",
    createdAt: now,
    updatedAt: now,
  });

  await refreshNotes();
  state.selectedNoteId = noteRef.id;
  renderAll();
  elements.noteTitleInput.focus();
  setSaveStatus(SAVE_STATUS.SAVED);
}

async function flushAutosave() {
  if (!state.autosaveTimer) return;

  window.clearTimeout(state.autosaveTimer);
  state.autosaveTimer = null;
  await saveActiveNote();
}

function sanitizeEditorHtml() {
  const container = document.createElement("div");
  container.innerHTML = elements.noteEditor.innerHTML || "";

  container.querySelectorAll("script, style").forEach((node) => node.remove());
  container.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "style") {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return container.innerHTML.trim();
}

async function saveActiveNote() {
  const note = getSelectedNote();
  if (!state.uid || !note) return;

  setSaveStatus(SAVE_STATUS.SAVING);

  const title = elements.noteTitleInput.value.trim();
  const tags = parseTags(elements.noteTagsInput.value);
  const pinned = elements.notePinnedInput.checked;
  const bodyHtml = sanitizeEditorHtml();
  const bodyText = toPlainText(bodyHtml);

  await updateDoc(doc(db, "users", state.uid, "notes", note.id), {
    title,
    tags,
    pinned,
    bodyHtml,
    bodyText,
    updatedAt: Timestamp.now(),
  });

  state.notes = sortNotes(
    state.notes.map((item) =>
      item.id === note.id
        ? {
            ...item,
            title,
            tags,
            pinned,
            bodyHtml,
            bodyText,
            updatedAt: new Date(),
          }
        : item
    )
  );

  renderNotesList();
  setSaveStatus(SAVE_STATUS.SAVED);
}

function queueAutosave() {
  setSaveStatus(SAVE_STATUS.DIRTY);
  window.clearTimeout(state.autosaveTimer);
  state.autosaveTimer = window.setTimeout(() => {
    saveActiveNote().catch((error) => {
      console.error("EasyNotes autosave failed:", error);
      setSaveStatus("Could not save");
    });
  }, 900);
}

async function deleteActiveNote() {
  const note = getSelectedNote();
  if (!state.uid || !note) return;

  const confirmed = window.confirm(`Delete "${note.title || "Untitled note"}"?`);
  if (!confirmed) return;

  await deleteDoc(doc(db, "users", state.uid, "notes", note.id));
  state.selectedNoteId = null;
  await refreshNotes();

  if (!state.notes.length) {
    await createNote();
  }
}

function runFormat(command) {
  elements.noteEditor.focus();

  if (command === "h1") {
    document.execCommand("formatBlock", false, "h1");
    return;
  }

  if (command === "h2") {
    document.execCommand("formatBlock", false, "h2");
    return;
  }

  if (command === "ul") {
    document.execCommand("insertUnorderedList");
    return;
  }

  if (command === "check") {
    document.execCommand("insertText", false, "- [ ] ");
  }
}

function clearFormatting() {
  elements.noteEditor.focus();
  document.execCommand("removeFormat");
  document.execCommand("formatBlock", false, "p");
}

function getSelectedTaskLines() {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim() || "";
  const sourceText = selectedText || toPlainText(elements.noteEditor.innerHTML);

  return sourceText
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]?\s*(\[[ xX]\])?\s*/, "").trim())
    .filter(Boolean);
}

async function turnSelectionIntoTasks() {
  if (!state.uid) return;

  const note = getSelectedNote();
  const lines = getSelectedTaskLines();

  if (!lines.length) {
    window.alert("Select a line or write a few lines first.");
    return;
  }

  const now = Timestamp.now();

  await Promise.all(
    lines.map((line) =>
      addDoc(getTasksCollection(state.uid), {
        title: line,
        dueDate: null,
        notes: `Created from EasyNotes: ${note?.title?.trim() || "Untitled note"}`,
        category: "EasyNotes",
        estimatedLength: "",
        recurring: false,
        priorityTier: 3,
        priorityLabel: "Golden Gator",
        completed: false,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      })
    )
  );

  window.alert(`${lines.length} task${lines.length === 1 ? "" : "s"} sent to EasyList.`);
}

function setupEvents() {
  elements.logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    redirectToLogin();
  });

  elements.newNoteBtn?.addEventListener("click", async () => {
    await flushAutosave();
    await createNote();
  });

  elements.searchInput?.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderNotesList();
  });

  elements.notesList?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-note-id]");
    if (!trigger) return;

    flushAutosave()
      .catch((error) => {
        console.error("EasyNotes save before switch failed:", error);
      })
      .finally(() => {
        state.selectedNoteId = trigger.dataset.noteId;
        renderAll();
        setSaveStatus(SAVE_STATUS.SAVED);
      });
  });

  elements.noteTitleInput?.addEventListener("input", queueAutosave);
  elements.noteTagsInput?.addEventListener("input", queueAutosave);
  elements.notePinnedInput?.addEventListener("change", queueAutosave);
  elements.noteEditor?.addEventListener("input", queueAutosave);

  elements.noteEditor?.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
  });

  elements.deleteNoteBtn?.addEventListener("click", async () => {
    await deleteActiveNote();
  });

  elements.turnIntoTaskBtn?.addEventListener("click", async () => {
    await turnSelectionIntoTasks();
  });

  elements.clearFormatBtn?.addEventListener("click", () => {
    clearFormatting();
    queueAutosave();
  });

  elements.toolbarButtons.forEach((button) => {
    button.addEventListener("click", () => {
      runFormat(button.dataset.command);
      queueAutosave();
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
  elements.brandMenuBtn?.addEventListener("click", (event) => {
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      redirectToLogin();
      return;
    }

    state.uid = user.uid;

    try {
      await refreshNotes();
      if (!state.notes.length) {
        await createNote();
      } else {
        renderAll();
      }
      setSaveStatus(SAVE_STATUS.SAVED);
    } catch (error) {
      console.error("EasyNotes load failed:", error);
      setSaveStatus("Could not load notes");
    }
  });
}
