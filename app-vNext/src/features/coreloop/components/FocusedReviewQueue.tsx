import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { useCoreLoopSearch } from "../CoreLoopSearchContext";
import {
  FOCUSED_REVIEW_FORMULA_VERSION,
  deriveFocusedReviewQueue,
  emptyFocusedReviewProgress,
  getVisibleFocusedReviewItems,
  normalizeFocusedReviewProgress,
  type FocusedReviewProgress,
} from "../domain/focusedReviewQueue";
import type { ApplicationRecord } from "@/lib/firestore/applications";
import type { ProjectRecord } from "@/lib/firestore/projects";
import type { ProjectTaskLinkRecord } from "@/lib/firestore/projectTaskLinks";
import type { WorkoutSessionRecord } from "@/lib/firestore/workoutSessions";

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shiftDateKey(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function withMode(to: string, search: string) {
  const [pathname, raw = ""] = to.split("?");
  const next = new URLSearchParams(raw);
  const current = new URLSearchParams(search);
  ["demo", "visualQa"].forEach((key) => current.get(key) === "1" && !next.has(key) && next.set(key, "1"));
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function FocusedReviewQueue({
  projects,
  projectLinks,
  applications,
  workouts,
  userKey,
  isDemoMode,
}: {
  projects: ProjectRecord[];
  projectLinks: ProjectTaskLinkRecord[];
  applications: ApplicationRecord[];
  workouts: WorkoutSessionRecord[];
  userKey: string;
  isDemoMode: boolean;
}) {
  const location = useLocation();
  const { tasks, assignTaskToToday, completeTaskFromCalendar } = useEasyCalendar();
  const { isOnline } = useCoreLoopSearch();
  const nowDateKey = localDateKey(new Date());
  const storageKey = `easylife:focused-review:${userKey || "signed-out"}:v1`;
  const [progress, setProgress] = useState<FocusedReviewProgress>(() => {
    try {
      return normalizeFocusedReviewProgress(JSON.parse(window.localStorage.getItem(storageKey) || "null"));
    } catch {
      return emptyFocusedReviewProgress;
    }
  });
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const items = useMemo(() => deriveFocusedReviewQueue({ nowDateKey, tasks, projects, projectLinks, applications, workouts }), [applications, nowDateKey, projectLinks, projects, tasks, workouts]);
  const visibleItems = useMemo(() => getVisibleFocusedReviewItems(items, progress, nowDateKey), [items, nowDateKey, progress]);
  const current = visibleItems.find((item) => item.id === progress.currentId) || visibleItems[0] || null;
  const processedCount = items.filter((item) => progress.processedIds.includes(item.id)).length;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  useEffect(() => {
    if (current && progress.currentId !== current.id) setProgress((value) => ({ ...value, currentId: current.id }));
  }, [current, progress.currentId]);

  function updateProgress(next: FocusedReviewProgress, nextMessage: string) {
    setProgress(next);
    setMessage(nextMessage);
    setActionError("");
  }

  function markProcessed(label: string) {
    if (!current) return;
    updateProgress({ ...progress, processedIds: [...new Set([...progress.processedIds, current.id])].sort(), currentId: null }, label);
  }

  function deferCurrent() {
    if (!current) return;
    updateProgress({ ...progress, deferredUntil: { ...progress.deferredUntil, [current.id]: shiftDateKey(nowDateKey, 1) }, currentId: null }, "Deferred until tomorrow. The source record was not changed.");
  }

  async function runTaskAction(action: "today" | "complete") {
    if (!current?.taskId) return;
    if (!isOnline && !isDemoMode) {
      setActionError("This saved-data action needs a connection. Defer or open the source while offline.");
      return;
    }
    try {
      if (action === "today") await assignTaskToToday(current.taskId);
      else await completeTaskFromCalendar(current.taskId);
      markProcessed(isDemoMode ? `Demo preview: ${action === "today" ? "assigned to Today" : "marked complete"}. No Firebase write ran.` : action === "today" ? "Assigned to Today." : "Marked complete.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The action could not be completed.");
    }
  }

  return (
    <section className="focused-review" aria-labelledby="focused-review-title">
      <div className="focused-review-header">
        <div><p className="eyebrow">Focused Review · optional</p><h2 id="focused-review-title">One decision at a time</h2><p>Deterministic order: captures, priorities, projects, applications, then completed workouts. No AI and no automatic scheduling.</p></div>
        <Link className="button-secondary compact-button" to={withMode("/app/easystatistics?tab=week", location.search)}>Return to overview</Link>
      </div>
      <div className="focused-review-progress" role="status"><span>{FOCUSED_REVIEW_FORMULA_VERSION}</span><strong>{processedCount} processed · {visibleItems.length} remaining</strong></div>
      {message ? <p className="calendar-info-card" role="status">{message}</p> : null}
      {actionError ? <p className="error-copy" role="alert">{actionError}</p> : null}
      {!isOnline ? <p className="focused-review-offline" role="status"><strong>Offline:</strong> source links and local deferral remain available; saved-data actions wait for a connection.</p> : null}
      {current ? (
        <article className="focused-review-card">
          <span className={`focused-review-kind kind-${current.kind}`}>{current.reason}</span>
          <h3>{current.title}</h3>
          <p>{current.detail}</p>
          <div className="focused-review-actions">
            {current.taskId ? <button type="button" className="primary-button compact-button" onClick={() => void runTaskAction("today")}>Assign Today</button> : null}
            {current.taskId ? <Link className="button-secondary compact-button" to={withMode(`/app/easycalendar/day?scheduleTask=${encodeURIComponent(current.taskId)}`, location.search)}>Schedule in Plan</Link> : null}
            {current.taskId ? <Link className="button-secondary compact-button" to={withMode(`/app/easyprojects?connectTask=${encodeURIComponent(current.taskId)}`, location.search)}>Connect to project</Link> : null}
            {current.taskId ? <button type="button" className="button-secondary compact-button" onClick={() => void runTaskAction("complete")}>Mark complete</button> : <button type="button" className="primary-button compact-button" onClick={() => markProcessed(current.kind === "workout" ? "Workout review acknowledged." : "Review item processed.")}>{current.kind === "workout" ? "Mark reviewed" : "Process item"}</button>}
            <button type="button" className="ghost-button compact-button" onClick={deferCurrent}>Defer one day</button>
            <Link className="ghost-button compact-button" to={withMode(current.sourceTo, location.search)}>Open source</Link>
          </div>
          <small>Actions are explicit. Scheduling and project connection hand off to their owning surfaces.</small>
        </article>
      ) : (
        <div className="focused-review-clear">
          <strong>Queue clear for now.</strong>
          <p>Nothing else needs a focused decision today. The normal My Week overview remains available.</p>
          {items.length ? <button type="button" className="button-secondary compact-button" onClick={() => updateProgress(emptyFocusedReviewProgress, "Focused review restarted.")}>Restart review</button> : null}
        </div>
      )}
    </section>
  );
}
