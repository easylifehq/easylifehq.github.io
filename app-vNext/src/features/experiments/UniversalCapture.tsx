import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import {
  createApplication,
  type ApplicationDraft,
  type ApplicationPriority,
} from "@/lib/firestore/applications";
import { createCalendarEvent, type CalendarEventType } from "@/lib/firestore/calendarEvents";
import { createContact, type ContactDraft } from "@/lib/firestore/contacts";
import { createNote, updateNote } from "@/lib/firestore/notes";
import { createProject, type ProjectDraft, type ProjectStatus } from "@/lib/firestore/projects";
import { createTask, subscribeToTasks, type TaskRecord } from "@/lib/firestore/tasks";
import { addSetToDailyWorkoutSession } from "@/lib/firestore/workoutSessions";
import { auth } from "@/lib/firebase/client";
import { useSettings } from "@/features/settings/SettingsContext";
import type { VisibleAppId } from "@/lib/firestore/settings";

type CaptureMode = "task" | "brainDump" | "note" | "event" | "application" | "contact" | "project" | "workout";

const captureModeAppMap: Partial<Record<CaptureMode, VisibleAppId>> = {
  task: "easylist",
  brainDump: "easylist",
  note: "easynotes",
  event: "easycalendar",
  application: "easypipeline",
  contact: "easycontacts",
  project: "easyprojects",
  workout: "easyworkout",
};

type QuickAddDetails = {
  company: string;
  role: string;
  email: string;
  followUp: string;
  taskCategory: string;
  taskDueDate: string;
  taskMinutes: string;
  taskPriority: 1 | 2 | 3 | 4 | 5;
  priority: ApplicationPriority;
  projectStatus: ProjectStatus;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: CalendarEventType;
};

const defaultDetails: QuickAddDetails = {
  company: "",
  role: "",
  email: "",
  followUp: "",
  taskCategory: "",
  taskDueDate: "",
  taskMinutes: "",
  taskPriority: 3,
  priority: "medium",
  projectStatus: "active",
  notes: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  eventType: "other",
};

const QUICK_ADD_DRAFT_KEY = "easylife.quickAddDraft";

function detectCaptureType(value: string) {
  const text = value.toLowerCase();
  if (/\b(today|tomorrow|meeting|appointment|calendar|schedule|at \d|pm|am)\b/.test(text)) {
    return "calendar";
  }
  if (/\b(call|email|text|follow up|reply)\b/.test(text)) {
    return "follow-up";
  }
  if (/\b(workout|gym|lift|sets?|reps?|push day|pull day|leg day)\b/.test(text)) {
    return "workout";
  }
  if (/\b(project|milestone|roadmap|launch)\b/.test(text)) {
    return "project";
  }
  if (/\b(note|idea|remember|thought)\b/.test(text)) {
    return "note";
  }
  return "task";
}
function priorityLabel(priority: 1 | 2 | 3 | 4 | 5) {
  return {
    1: "Urgent",
    2: "High",
    3: "Medium",
    4: "Low",
    5: "Someday",
  }[priority];
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseClockTime(hourValue: string, minuteValue = "0", meridiem = "") {
  let hour = Number(hourValue);
  const minute = Number(minuteValue);
  const normalizedMeridiem = meridiem.toLowerCase();

  if (normalizedMeridiem === "pm" && hour < 12) hour += 12;
  if (normalizedMeridiem === "am" && hour === 12) hour = 0;
  if (!normalizedMeridiem && hour >= 1 && hour <= 7) hour += 12;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function parseEventDetails(value: string) {
  const text = value.toLowerCase();
  const updates: Partial<Pick<QuickAddDetails, "date" | "startTime" | "endTime" | "eventType">> = {};
  const date = new Date();

  if (/\btomorrow\b/.test(text)) {
    date.setDate(date.getDate() + 1);
    updates.date = formatDateInput(date);
  } else if (/\btoday\b/.test(text)) {
    updates.date = formatDateInput(date);
  }

  const nextWeekdayMatch = text.match(/\bnext\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  const plainWeekdayMatch = text.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  const weekday = nextWeekdayMatch?.[1] ?? plainWeekdayMatch?.[1];
  if (weekday) {
    const targetDay = weekdays.indexOf(weekday);
    const daysAhead = (targetDay - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysAhead);
    updates.date = formatDateInput(date);
  }

  const slashDateMatch = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slashDateMatch) {
    const year = slashDateMatch[3]
      ? Number(slashDateMatch[3].length === 2 ? `20${slashDateMatch[3]}` : slashDateMatch[3])
      : date.getFullYear();
    const explicitDate = new Date(year, Number(slashDateMatch[1]) - 1, Number(slashDateMatch[2]));
    updates.date = formatDateInput(explicitDate);
  }

  const textWithoutDateShorthand = text.replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, "");
  const timeRangeMatch = textWithoutDateShorthand.match(/\b(?:from\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|to|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  const timeMatch = textWithoutDateShorthand.match(/\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (timeRangeMatch) {
    const endMeridiem = timeRangeMatch[6] || timeRangeMatch[3] || "";
    const start = parseClockTime(timeRangeMatch[1], timeRangeMatch[2] ?? "0", timeRangeMatch[3] || endMeridiem);
    const end = parseClockTime(timeRangeMatch[4], timeRangeMatch[5] ?? "0", endMeridiem);
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    updates.startTime = formatTimeInput(start);
    updates.endTime = formatTimeInput(end);
  } else if (timeMatch) {
    const start = parseClockTime(timeMatch[1], timeMatch[2] ?? "0", timeMatch[3] ?? "");
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    updates.startTime = formatTimeInput(start);
    updates.endTime = formatTimeInput(end);
  }

  if (/\b(dentist|doctor|appointment)\b/.test(text)) {
    updates.eventType = "appointment";
  } else if (/\b(class|lecture|lab)\b/.test(text)) {
    updates.eventType = "class";
  } else if (/\b(work|shift|meeting)\b/.test(text)) {
    updates.eventType = "work";
  }

  return updates;
}

type BrainDumpEntry = {
  kind: "task" | "event" | "deadline";
  title: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: CalendarEventType;
};

function cleanBrainDumpTitle(value: string) {
  const dateWords = "today|tomorrow|tonight|this\\s+weekend|next\\s+week|next\\s+(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)|sunday|monday|tuesday|wednesday|thursday|friday|saturday|\\d{1,2}\\/\\d{1,2}(?:\\/\\d{2,4})?";

  return value
    .replace(/^\s*(?:[-*+]|[0-9]+[.)])\s*/, "")
    .replace(/^\s*(?:I\s+)?(?:also\s+)?(?:need|have|should)\s+(?:to\s+)?/i, "")
    .replace(new RegExp(`\\b(?:due|by|before)\\s+(?:${dateWords})\\b`, "gi"), "")
    .replace(/\b(?:from\s*)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:-|to|until)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/gi, "")
    .replace(/\b(?:at\s*)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 140);
}

function splitBrainDumpEntries(value: string) {
  const itemStarter = "(?:I\\s+)?(?:also\\s+)?(?:need|have|should)\\s+(?:to\\s+)?|meet(?:ing)?|appointment|class|lecture|lab|shift|dinner|lunch|interview|deadline|due|submit|turn\\s+in|finish|email|call|text|send|buy|pick|pay|review|write|study|clean|schedule";

  return value
    .replace(/\r/g, "\n")
    .replace(/[\u2022\u2013\u2014]/g, "-")
    .replace(new RegExp(`[.!?]\\s+(?=${itemStarter}\\b)`, "gi"), "\n")
    .replace(/\s*;\s*/g, "\n")
    .split(/\n+/)
    .flatMap((line) =>
      line.length > 70
        ? line.split(/,\s+(?=(?:and\s+)?(?:meet|meeting|appointment|class|submit|turn in|finish|email|call|text|send|buy|pick|pay|review|write|study|clean|schedule)\b)/i)
        : [line]
    )
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function getDateTimeFromEntry(entry: BrainDumpEntry) {
  const dateValue = entry.date || formatDateInput(new Date());
  const startAt = new Date(`${dateValue}T${entry.startTime || "09:00"}:00`);
  const endAt = new Date(`${dateValue}T${entry.endTime || entry.startTime || "10:00"}:00`);
  if (endAt <= startAt) {
    endAt.setHours(startAt.getHours() + 1);
  }

  return { startAt, endAt };
}

function classifyBrainDumpEntry(line: string): BrainDumpEntry | null {
  const parsedEvent = parseEventDetails(line);
  const lower = line.toLowerCase();
  const hasDate = Boolean(parsedEvent.date) || /\b(today|tomorrow|tonight|eod|midnight|next\s+\w+|\d{1,2}\/\d{1,2})\b/.test(lower);
  const hasTime = Boolean(parsedEvent.startTime) || /\b(?:at|from)?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/.test(lower);
  const deadlineIntent = /\b(deadline|due|submit|turn in|before|by midnight|by eod)\b/.test(lower);
  const eventIntent = /\b(meeting|meet|appointment|class|lecture|lab|shift|dinner|lunch|call with|interview)\b/.test(lower);
  const kind = deadlineIntent && hasDate ? "deadline" : eventIntent || hasTime ? "event" : "task";
  const title = cleanBrainDumpTitle(line);

  if (!title) return null;

  return {
    kind,
    title,
    notes: line,
    date: parsedEvent.date || (hasDate ? detailsDateFallback(line) : ""),
    startTime: parsedEvent.startTime || "09:00",
    endTime: parsedEvent.endTime || "10:00",
    eventType: parsedEvent.eventType || (eventIntent ? "personal" : "other"),
  };
}

function detailsDateFallback(line: string) {
  const text = line.toLowerCase();
  const date = new Date();
  if (/\btomorrow\b/.test(text)) {
    date.setDate(date.getDate() + 1);
    return formatDateInput(date);
  }
  if (/\b(today|tonight|eod|midnight)\b/.test(text)) return formatDateInput(date);
  return "";
}

function parseBrainDumpEntries(value: string) {
  return splitBrainDumpEntries(value)
    .map(classifyBrainDumpEntry)
    .filter((entry): entry is BrainDumpEntry => Boolean(entry));
}

function parseWorkoutSet(value: string) {
  const text = value.trim();
  const setMatch = text.match(/\b(\d{1,3})\s*(?:reps?|x|@)\s*(\d{1,4}(?:\.\d+)?)?\s*(?:lbs?|lb|pounds?)?\b/i);
  const compactMatch = text.match(/\b(\d{1,4}(?:\.\d+)?)\s*x\s*(\d{1,3})\b/i);
  const weightMatch = text.match(/\b(\d{1,4}(?:\.\d+)?)\s*(?:lbs?|lb|pounds?)\b/i);
  const reps = setMatch ? Number(setMatch[1]) : compactMatch ? Number(compactMatch[2]) : 0;
  const weight = setMatch?.[2]
    ? Number(setMatch[2])
    : compactMatch
      ? Number(compactMatch[1])
      : weightMatch
        ? Number(weightMatch[1])
        : 0;
  const exerciseName = text
    .replace(/\b\d{1,4}(?:\.\d+)?\s*x\s*\d{1,3}\b/gi, "")
    .replace(/\b\d{1,3}\s*(?:reps?|x|@)\s*\d{0,4}(?:\.\d+)?\s*(?:lbs?|lb|pounds?)?\b/gi, "")
    .replace(/\b\d{1,4}(?:\.\d+)?\s*(?:lbs?|lb|pounds?)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    exerciseName: exerciseName || "Quick set",
    reps: Number.isFinite(reps) && reps > 0 ? reps : 0,
    weight: Number.isFinite(weight) && weight > 0 ? weight : 0,
  };
}

export function UniversalCapture() {
  const location = useLocation();
  const { isAppVisible } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<CaptureMode>("task");
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<QuickAddDetails>(defaultDetails);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [openTarget, setOpenTarget] = useState<{ to: string; label: string } | null>(null);
  const suggestion = useMemo(() => detectCaptureType(text), [text]);
  const brainDumpEntries = useMemo(() => parseBrainDumpEntries(text), [text]);
  const isEasyListCapture = location.pathname.startsWith("/app/easylist");
  const brainDumpSummary = useMemo(() => {
    const counts: Record<BrainDumpEntry["kind"], number> = { task: 0, event: 0, deadline: 0 };
    brainDumpEntries.forEach((entry) => {
      counts[entry.kind] += 1;
    });

    return [
      counts.task ? `${counts.task} task${counts.task === 1 ? "" : "s"}` : "",
      counts.event ? `${counts.event} event${counts.event === 1 ? "" : "s"}` : "",
      counts.deadline ? `${counts.deadline} deadline${counts.deadline === 1 ? "" : "s"}` : "",
    ].filter(Boolean).join(", ");
  }, [brainDumpEntries]);
  const recentCategories = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    tasks.forEach((task) => {
      const category = task.category.trim();
      if (!category) return;
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    });

    return Array.from(categoryCounts.entries())
      .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
      .slice(0, 5)
      .map(([category]) => category);
  }, [tasks]);
  const screenAction = useMemo(() => {
    if (location.pathname.startsWith("/app/easypipeline")) {
      return { mode: "application" as CaptureMode, label: "Add application", to: "/app/easypipeline/dashboard", hint: "Pipeline" };
    }
    if (location.pathname.startsWith("/app/easyprojects")) {
      return { mode: "project" as CaptureMode, label: "Add project", to: "/app/easyprojects", hint: "Projects" };
    }
    if (location.pathname.startsWith("/app/easyworkout")) {
      return { mode: "workout" as CaptureMode, label: "Log workout", to: "/app/easyworkout/log", hint: "Workout" };
    }
    if (location.pathname.startsWith("/app/easynotes")) {
      return { mode: "note" as CaptureMode, label: "Create note", to: "/app/easynotes", hint: "Notes" };
    }
    if (location.pathname.startsWith("/app/easycalendar")) {
      return { mode: "event" as CaptureMode, label: "Add event", to: "/app/easycalendar/day", hint: "Calendar" };
    }
    if (location.pathname.startsWith("/app/easycontacts")) {
      return { mode: "contact" as CaptureMode, label: "Add contact", to: "/app/easycontacts", hint: "Contacts" };
    }
    return { mode: "task" as CaptureMode, label: "Open full Add Task page", to: "/app/easylist/add", hint: "EasyList" };
  }, [location.pathname]);
  const captureModes = useMemo(
    () =>
      [
        ["task", "Task"],
        ["brainDump", "Brain dump"],
        ["note", "Note"],
        ["event", "Event"],
        ["application", "Application"],
        ["contact", "Contact"],
        ["project", "Project"],
        ["workout", "Set"],
      ].filter(([value]) => {
        const appId = captureModeAppMap[value as CaptureMode];
        return !appId || isAppVisible(appId);
      }) as Array<[CaptureMode, string]>,
    [isAppVisible]
  );

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(QUICK_ADD_DRAFT_KEY);
    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft) as {
        mode?: CaptureMode;
        text?: string;
        details?: Partial<QuickAddDetails>;
      };
      if (parsed.mode) setMode(parsed.mode);
      if (typeof parsed.text === "string") setText(parsed.text);
      if (parsed.details) setDetails((current) => ({ ...current, ...parsed.details }));
    } catch {
      window.localStorage.removeItem(QUICK_ADD_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const hasDraft =
      text.trim() ||
      Object.entries(details).some(
        ([key, value]) => String(value || "") !== String(defaultDetails[key as keyof QuickAddDetails] || "")
      );
    if (!hasDraft) {
      window.localStorage.removeItem(QUICK_ADD_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(
      QUICK_ADD_DRAFT_KEY,
      JSON.stringify({
        mode,
        text,
        details,
      })
    );
  }, [details, mode, text]);

  function openCapture() {
    const appId = captureModeAppMap[screenAction.mode];
    setMode(!appId || isAppVisible(appId) ? screenAction.mode : captureModes[0]?.[0] ?? "task");
    setMessage("");
    setOpenTarget(null);
    setIsOpen(true);
  }

  function resetFields(nextMessage: string, options: { keepOpenTarget?: boolean } = {}) {
    setText("");
    setDetails(defaultDetails);
    setMessage(nextMessage);
    window.localStorage.removeItem(QUICK_ADD_DRAFT_KEY);
    if (!options.keepOpenTarget) {
      setOpenTarget(null);
    }
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTyping) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCapture();
      }
      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "+") {
        event.preventDefault();
        openCapture();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [captureModes, isAppVisible, screenAction.mode]);

  useEffect(() => {
    let unsubscribeTasks: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeTasks?.();
      if (!user) {
        setTasks([]);
        return;
      }
      unsubscribeTasks = subscribeToTasks(user.uid, setTasks, () => setTasks([]));
    });

    return () => {
      unsubscribeTasks?.();
      unsubscribeAuth();
    };
  }, []);

  async function saveAsTask(options: { addAnother?: boolean } = {}) {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;
    const minutes = Number(details.taskMinutes);
    const inferredPriority = suggestion === "follow-up" ? 2 : 3;
    const priorityTier = details.taskPriority || inferredPriority;

    await createTask(user.uid, {
      title: text.trim().slice(0, 140),
      notes: text.trim(),
      category: details.taskCategory.trim() || (suggestion === "follow-up" ? "Follow-up" : "Inbox"),
      estimatedLength: Number.isFinite(minutes) && minutes > 0 ? minutes : null,
      priorityTier,
      priorityLabel: priorityLabel(priorityTier),
      dueDate: details.taskDueDate || null,
      recurring: false,
    });
    if (!options.addAnother) {
      setOpenTarget({ to: `/app/easylist/dashboard`, label: "Open task list" });
    }
    resetFields(options.addAnother ? "Task saved. Add the next one." : "Saved as a task.", { keepOpenTarget: !options.addAnother });
  }

  async function saveBrainDump(options: { addAnother?: boolean } = {}) {
    const user = auth.currentUser;
    const parsedEntries = parseBrainDumpEntries(text);
    if (!user || !parsedEntries.length) return;

    let taskCount = 0;
    let eventCount = 0;
    let deadlineCount = 0;

    for (const entry of parsedEntries) {
      if (entry.kind === "event") {
        const { startAt, endAt } = getDateTimeFromEntry(entry);
        await createCalendarEvent(user.uid, {
          title: entry.title,
          description: entry.notes,
          categoryId: null,
          startAt,
          endAt,
          allDay: false,
          isRecurring: false,
          recurrenceRule: null,
          eventType: entry.eventType,
        });
        eventCount += 1;
        continue;
      }

      await createTask(user.uid, {
        itemKind: entry.kind === "deadline" ? "deadline" : "task",
        title: entry.title,
        notes: entry.notes,
        category: entry.kind === "deadline" ? "Deadline" : "Inbox",
        estimatedLength: null,
        priorityTier: entry.kind === "deadline" ? 2 : 3,
        priorityLabel: entry.kind === "deadline" ? "High" : "Medium",
        dueDate: entry.date || null,
        recurring: false,
      });

      if (entry.kind === "deadline") {
        deadlineCount += 1;
      } else {
        taskCount += 1;
      }
    }

    const parts = [
      taskCount ? `${taskCount} task${taskCount === 1 ? "" : "s"}` : "",
      eventCount ? `${eventCount} event${eventCount === 1 ? "" : "s"}` : "",
      deadlineCount ? `${deadlineCount} deadline${deadlineCount === 1 ? "" : "s"}` : "",
    ].filter(Boolean);

    if (!options.addAnother) {
      setOpenTarget(
        eventCount && !taskCount && !deadlineCount
          ? { to: "/app/easycalendar/day", label: "Open calendar" }
          : { to: "/app/easylist/dashboard", label: "Open task list" }
      );
    }
    resetFields(
      options.addAnother ? "Brain dump added. Add the next one." : `Added ${parts.join(", ")}.`,
      { keepOpenTarget: !options.addAnother }
    );
  }

  async function saveAsNote(options: { addAnother?: boolean } = {}) {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    const noteId = await createNote(user.uid);
    await updateNote(user.uid, noteId, {
      title: text.trim().split(/\s+/).slice(0, 8).join(" "),
      tags: ["inbox"],
      folderId: "",
      pinned: false,
      bodyText: text.trim(),
    });
    if (!options.addAnother) {
      setOpenTarget({ to: `/app/easynotes/${noteId}`, label: "Open note" });
    }
    resetFields(options.addAnother ? "Note saved. Add the next one." : "Saved as a note.", { keepOpenTarget: !options.addAnother });
  }

  async function saveContextItem(options: { addAnother?: boolean } = {}) {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;
    const title = text.trim();

    if (mode === "task") {
      await saveAsTask(options);
      return;
    }
    if (mode === "brainDump") {
      await saveBrainDump(options);
      return;
    }
    if (mode === "note") {
      await saveAsNote(options);
      return;
    }
    if (mode === "application") {
      const draft: ApplicationDraft = {
        company: details.company.trim(),
        title,
        status: "need_to_apply",
        priority: details.priority,
        offerResponse: "",
        dateApplied: "",
        nextFollowUp: details.followUp,
        location: "",
        link: "",
        notes: details.notes.trim(),
        contactName: "",
        contactEmail: "",
      };
      const applicationId = await createApplication(user.uid, draft);
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easypipeline/dashboard?application=${applicationId}`, label: "Open board" });
      }
      resetFields(options.addAnother ? "Application added. Add the next one." : "Application added.", { keepOpenTarget: !options.addAnother });
      return;
    }
    if (mode === "contact") {
      const draft: ContactDraft = {
        fullName: title,
        relationship: "",
        company: details.company.trim(),
        role: details.role.trim(),
        email: details.email.trim(),
        phone: "",
        linkedinUrl: "",
        source: "",
        status: "warm",
        relatedOpportunityIds: [],
        lastContactedAt: "",
        nextFollowUpAt: details.followUp,
        notes: details.notes.trim(),
        archived: false,
      };
      const contactId = await createContact(user.uid, draft);
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easycontacts?contact=${contactId}`, label: "Open contacts" });
      }
      resetFields(options.addAnother ? "Contact added. Add the next one." : "Contact added.", { keepOpenTarget: !options.addAnother });
      return;
    }
    if (mode === "project") {
      const draft: ProjectDraft = {
        title,
        description: details.notes.trim(),
        targetDate: details.date,
        status: details.projectStatus,
      };
      const projectId = await createProject(user.uid, draft);
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easyprojects/${projectId}`, label: "Open project" });
      }
      resetFields(options.addAnother ? "Project added. Add the next one." : "Project added.", { keepOpenTarget: !options.addAnother });
      return;
    }
    if (mode === "event") {
      const dateValue = details.date || formatDateInput(new Date());
      const eventDate = new Date(`${dateValue}T${details.startTime || "09:00"}:00`);
      const endAt = new Date(`${dateValue}T${details.endTime || "10:00"}:00`);
      if (endAt <= eventDate) {
        endAt.setHours(eventDate.getHours() + 1);
      }
      await createCalendarEvent(user.uid, {
        title,
        description: details.notes.trim(),
        categoryId: null,
        startAt: eventDate,
        endAt,
        allDay: false,
        isRecurring: false,
        recurrenceRule: null,
        eventType: details.eventType,
      });
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easycalendar/day`, label: "Open calendar" });
      }
      resetFields(options.addAnother ? "Event added. Add the next one." : "Event added.", { keepOpenTarget: !options.addAnother });
      return;
    }
    if (mode === "workout") {
      const dateValue = details.date || formatDateInput(new Date());
      const parsedSet = parseWorkoutSet(title);
      const sessionId = await addSetToDailyWorkoutSession(user.uid, dateValue, {
        exerciseId: null,
        exerciseName: parsedSet.exerciseName,
        muscleGroup: "",
        notes: details.notes.trim(),
        sets: [
          {
            reps: parsedSet.reps,
            weight: parsedSet.weight,
            notes: details.notes.trim(),
          },
        ],
      });
      if (!options.addAnother) {
        setOpenTarget({ to: `/app/easyworkout/log`, label: "Open workout" });
      }
      resetFields(options.addAnother ? "Set added. Add the next one." : "Set added.", { keepOpenTarget: !options.addAnother });
      return sessionId;
    }
  }

  return (
    <>
      <button type="button" className="capture-fab" onClick={openCapture} aria-label="Quick capture">
        Capture
      </button>

      <div className={`capture-backdrop${isOpen ? " open" : ""}`} onClick={() => setIsOpen(false)} />
      <section
        className={`capture-modal${isEasyListCapture ? " easylist-capture-modal" : ""}${isOpen ? " open" : ""}`}
        aria-hidden={!isOpen}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            void saveContextItem();
          }
        }}
      >
        <div className="capture-header">
          <div>
            <p className="eyebrow">{screenAction.hint}</p>
            <h2>Quick capture</h2>
          </div>
          <div className="capture-header-actions">
            <span className="command-hint">Ctrl K</span>
            <button type="button" className="ghost-button compact-button" onClick={() => setIsOpen(false)} aria-label="Close quick capture">
              Close
            </button>
          </div>
        </div>

        <div className="capture-mode-row" role="tablist" aria-label="Quick capture type">
          {captureModes.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`capture-mode-button${mode === value ? " active" : ""}`}
              onClick={() => {
                setMode(value as CaptureMode);
                setMessage("");
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="field-stack">
          <span>{mode === "application" ? "Role" : mode === "contact" ? "Name" : mode === "event" ? "Event" : mode === "brainDump" ? "Brain dump" : mode === "project" ? "Project" : mode === "workout" ? "Exercise and set" : "Task"}</span>
          <textarea
            value={text}
            onChange={(event) => {
              const nextValue = event.target.value;
              setText(nextValue);
              if (mode === "event") {
                const parsedDetails = parseEventDetails(nextValue);
                if (Object.keys(parsedDetails).length) {
                  setDetails((current) => ({ ...current, ...parsedDetails }));
                }
              }
              setMessage("");
            }}
            placeholder={mode === "workout" ? "Bench press 135 x 8" : mode === "brainDump" ? "Examples: submit FAFSA by Friday; meeting with Alex tomorrow at 2pm; buy groceries this weekend." : "Type anything..."}
            rows={5}
          />
        </label>

        {mode === "task" ? (
          <div className="capture-detail-grid capture-detail-grid-four">
            <label className="field-stack">
              <span>Category</span>
              <input
                aria-label="Task category"
                value={details.taskCategory}
                onChange={(event) => setDetails((current) => ({ ...current, taskCategory: event.target.value }))}
                placeholder="Inbox"
              />
              {recentCategories.length ? (
                <div className="capture-category-row" aria-label="Recent task categories">
                  {recentCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="capture-category-chip"
                      onClick={() => setDetails((current) => ({ ...current, taskCategory: category }))}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ) : null}
            </label>
            <label className="field-stack">
              <span>Due</span>
              <input type="date" value={details.taskDueDate} onChange={(event) => setDetails((current) => ({ ...current, taskDueDate: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Minutes</span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={details.taskMinutes}
                onChange={(event) => setDetails((current) => ({ ...current, taskMinutes: event.target.value }))}
                placeholder="15"
              />
            </label>
            <label className="field-stack">
              <span>Priority</span>
              <select
                value={details.taskPriority}
                onChange={(event) => setDetails((current) => ({ ...current, taskPriority: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 }))}
              >
                <option value={1}>Urgent</option>
                <option value={2}>High</option>
                <option value={3}>Medium</option>
                <option value={4}>Low</option>
                <option value={5}>Someday</option>
              </select>
            </label>
          </div>
        ) : null}

        {mode === "application" ? (
          <div className="capture-detail-grid capture-detail-grid-three">
            <label className="field-stack">
              <span>Company</span>
              <input
                value={details.company}
                onChange={(event) => setDetails((current) => ({ ...current, company: event.target.value }))}
                placeholder="Company"
              />
            </label>
            <label className="field-stack">
              <span>Follow-up</span>
              <input type="date" value={details.followUp} onChange={(event) => setDetails((current) => ({ ...current, followUp: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Priority</span>
              <select value={details.priority} onChange={(event) => setDetails((current) => ({ ...current, priority: event.target.value as ApplicationPriority }))}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
        ) : null}

        {mode === "contact" ? (
          <div className="capture-detail-grid capture-detail-grid-three">
            <label className="field-stack">
              <span>Company</span>
              <input value={details.company} onChange={(event) => setDetails((current) => ({ ...current, company: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Role</span>
              <input value={details.role} onChange={(event) => setDetails((current) => ({ ...current, role: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Email</span>
              <input type="email" value={details.email} onChange={(event) => setDetails((current) => ({ ...current, email: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Follow-up</span>
              <input type="date" value={details.followUp} onChange={(event) => setDetails((current) => ({ ...current, followUp: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {mode === "project" ? (
          <div className="capture-detail-grid">
            <label className="field-stack">
              <span>Target date</span>
              <input type="date" value={details.date} onChange={(event) => setDetails((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Status</span>
              <select value={details.projectStatus} onChange={(event) => setDetails((current) => ({ ...current, projectStatus: event.target.value as ProjectStatus }))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="field-stack field-stack-wide">
              <span>Notes</span>
              <textarea rows={3} value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {mode === "event" ? (
          <div className="capture-detail-grid capture-detail-grid-four">
            <label className="field-stack">
              <span>Date</span>
              <input type="date" value={details.date} onChange={(event) => setDetails((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Start</span>
              <input type="time" value={details.startTime} onChange={(event) => setDetails((current) => ({ ...current, startTime: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>End</span>
              <input type="time" value={details.endTime} onChange={(event) => setDetails((current) => ({ ...current, endTime: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Type</span>
              <select value={details.eventType} onChange={(event) => setDetails((current) => ({ ...current, eventType: event.target.value as CalendarEventType }))}>
                <option value="class">Class</option>
                <option value="work">Work</option>
                <option value="appointment">Appointment</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="field-stack field-stack-wide">
              <span>Details</span>
              <textarea rows={3} value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {mode === "workout" ? (
          <div className="capture-detail-grid">
            <label className="field-stack">
              <span>Date</span>
              <input type="date" value={details.date} onChange={(event) => setDetails((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field-stack field-stack-wide">
              <span>Notes</span>
              <textarea rows={3} value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {mode === "brainDump" && text.trim() ? (
          <div className="capture-suggestion">
            {brainDumpSummary ? (
              <>
                Ready to add <strong>{brainDumpSummary}</strong>.
              </>
            ) : (
              "Add one clear item per line, or separate ideas with semicolons."
            )}
          </div>
        ) : text.trim() ? (
          <div className="capture-suggestion">
            This looks like a <strong>{suggestion}</strong>.
          </div>
        ) : null}

        <div className="task-composer-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => void saveContextItem()}
            disabled={!text.trim() || (mode === "brainDump" && brainDumpEntries.length === 0)}
          >
            {mode === "workout" ? "Add set" : mode === "brainDump" ? "Add brain dump" : `Save ${mode}`}
          </button>
          <button type="button" className="button-secondary" onClick={() => void saveContextItem({ addAnother: true })} disabled={!text.trim() || (mode === "brainDump" && brainDumpEntries.length === 0)}>
            {mode === "workout" ? "Add set and another" : "Save and add another"}
          </button>
          {mode === "brainDump" ? null : (
            <button type="button" className="button-secondary" onClick={() => void saveAsNote()} disabled={!text.trim()}>
              Save as note
            </button>
          )}
          <Link className="ghost-button" to={screenAction.to} onClick={() => setIsOpen(false)}>
            {screenAction.label}
          </Link>
        </div>
        {message ? (
          <div className="calendar-info-card capture-success-card">
            <span>{message}</span>
            {openTarget ? (
              <Link className="button-secondary compact-button" to={openTarget.to} onClick={() => setIsOpen(false)}>
                {openTarget.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
