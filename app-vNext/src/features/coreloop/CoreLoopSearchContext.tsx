import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useEasyCalendar } from "@/features/easycalendar/EasyCalendarContext";
import { coreLoopDemoApplications, coreLoopDemoContacts, coreLoopDemoNotes, coreLoopDemoProjects } from "./demo/coreLoopDemoFixtures";
import { searchCoreLoopDocuments, type CoreSearchDocument } from "./domain/globalSearch";
import { workoutDemoSessions } from "@/features/easyworkout/demo/workoutDemoFixtures";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";
import { subscribeToApplications, type ApplicationRecord } from "@/lib/firestore/applications";
import { subscribeToContacts, type ContactRecord } from "@/lib/firestore/contacts";
import { subscribeToNotes, type NoteRecord } from "@/lib/firestore/notes";
import { subscribeToProjects, type ProjectRecord } from "@/lib/firestore/projects";
import { subscribeToWorkoutSessions, type WorkoutSessionRecord } from "@/lib/firestore/workoutSessions";

type SearchSource = "notes" | "contacts" | "projects" | "applications" | "workouts";
type CoreLoopSearchContextValue = {
  documents: CoreSearchDocument[];
  search: (query: string) => ReturnType<typeof searchCoreLoopDocuments>;
  isLoading: boolean;
  errors: string[];
  isOnline: boolean;
};

const CoreLoopSearchContext = createContext<CoreLoopSearchContextValue | undefined>(undefined);
const initialLoading: Record<SearchSource, boolean> = { notes: true, contacts: true, projects: true, applications: true, workouts: true };

export function CoreLoopSearchProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const { tasks, isDailyDataLoading, error: calendarError } = useEasyCalendar();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSessionRecord[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [sourceErrors, setSourceErrors] = useState<Partial<Record<SearchSource, string>>>({});
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setNotes(coreLoopDemoNotes);
      setContacts(coreLoopDemoContacts);
      setProjects(coreLoopDemoProjects);
      setApplications(coreLoopDemoApplications);
      setWorkouts(workoutDemoSessions);
      setLoading({ notes: false, contacts: false, projects: false, applications: false, workouts: false });
      setSourceErrors({});
      return;
    }

    if (!user) {
      setNotes([]); setContacts([]); setProjects([]); setApplications([]); setWorkouts([]);
      setLoading({ notes: false, contacts: false, projects: false, applications: false, workouts: false });
      setSourceErrors({});
      return;
    }

    setLoading(initialLoading);
    setSourceErrors({});
    const settle = <T,>(source: SearchSource, setter: (records: T[]) => void) => (records: T[]) => {
      setter(records);
      setLoading((current) => ({ ...current, [source]: false }));
      setSourceErrors((current) => ({ ...current, [source]: undefined }));
    };
    const fail = (source: SearchSource) => (error: Error) => {
      setLoading((current) => ({ ...current, [source]: false }));
      setSourceErrors((current) => ({ ...current, [source]: toSafeFirebaseMessage(error) }));
    };
    const unsubscribers = [
      subscribeToNotes(user.uid, settle("notes", setNotes), fail("notes")),
      subscribeToContacts(user.uid, settle("contacts", setContacts), fail("contacts")),
      subscribeToProjects(user.uid, settle("projects", setProjects), fail("projects")),
      subscribeToApplications(user.uid, settle("applications", setApplications), fail("applications")),
      subscribeToWorkoutSessions(user.uid, settle("workouts", setWorkouts), fail("workouts")),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [isDemoMode, user]);

  const documents = useMemo<CoreSearchDocument[]>(() => [
    ...notes.filter((note) => !note.deletedAt).map((note) => ({ id: `note:${note.id}`, group: "Notes" as const, title: note.title || "Untitled note", detail: note.bodyText.slice(0, 140) || "Empty note", searchText: `${note.tags.join(" ")} ${note.bodyText}`, to: `/app/easynotes/${encodeURIComponent(note.id)}`, updatedAt: note.updatedAt })),
    ...contacts.filter((contact) => !contact.archived).map((contact) => ({ id: `contact:${contact.id}`, group: "People" as const, title: contact.fullName || "Unnamed person", detail: [contact.role, contact.company].filter(Boolean).join(" · ") || contact.relationship || "Person", searchText: `${contact.email} ${contact.relationship} ${contact.notes}`, to: `/app/easycontacts?contact=${encodeURIComponent(contact.id)}`, updatedAt: contact.updatedAt })),
    ...projects.map((project) => ({ id: `project:${project.id}`, group: "Projects" as const, title: project.title || "Untitled project", detail: project.description || (project.targetDate ? `Target ${project.targetDate}` : "Project"), searchText: `${project.status} ${project.targetDate}`, to: `/app/easyprojects/${encodeURIComponent(project.id)}`, updatedAt: project.updatedAt })),
    ...applications.map((application) => ({ id: `application:${application.id}`, group: "Job applications" as const, title: `${application.company} — ${application.title}`, detail: `${application.status.replace(/_/g, " ")}${application.nextFollowUp ? ` · Follow-up ${application.nextFollowUp}` : ""}`, searchText: `${application.location} ${application.notes} ${application.contactName}`, to: `/app/easypipeline/dashboard?application=${encodeURIComponent(application.id)}`, updatedAt: application.updatedAt })),
    ...tasks.filter((task) => !task.deletedAt).map((task) => ({ id: `task:${task.id}`, group: "Plan" as const, title: task.title || "Untitled plan item", detail: [task.listName, task.category, task.dueDate?.toLocaleDateString()].filter(Boolean).join(" · ") || "Inbox task", searchText: `${task.notes} ${task.priorityLabel}`, to: `/app/easylist/dashboard?task=${encodeURIComponent(task.id)}`, updatedAt: task.updatedAt })),
    ...workouts.map((session) => ({ id: `workout:${session.id}`, group: "Workouts" as const, title: session.routineName || "Workout session", detail: `${session.performedOn}${session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}`, searchText: `${session.notes} ${(session.exercises || []).map((exercise) => `${exercise.exerciseName} ${exercise.notes}`).join(" ")}`, to: `/app/easyworkout/session/${encodeURIComponent(session.id)}`, updatedAt: session.updatedAt || session.createdAt })),
  ], [applications, contacts, notes, projects, tasks, workouts]);

  const errors = useMemo(() => [calendarError, ...Object.values(sourceErrors)].filter((value): value is string => Boolean(value)), [calendarError, sourceErrors]);
  const value = useMemo(() => ({ documents, search: (query: string) => searchCoreLoopDocuments(documents, query), isLoading: isDailyDataLoading || Object.values(loading).some(Boolean), errors, isOnline }), [documents, errors, isDailyDataLoading, isOnline, loading]);
  return <CoreLoopSearchContext.Provider value={value}>{children}</CoreLoopSearchContext.Provider>;
}

export function useCoreLoopSearch() {
  const value = useContext(CoreLoopSearchContext);
  if (!value) throw new Error("useCoreLoopSearch must be used inside CoreLoopSearchProvider");
  return value;
}

