import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  createProject,
  removeProject,
  subscribeToProjects,
  updateProject,
  type ProjectDraft,
  type ProjectRecord,
} from "@/lib/firestore/projects";
import {
  createProjectSection,
  removeProjectSection,
  subscribeToProjectSections,
  updateProjectSection,
  type ProjectSectionDraft,
  type ProjectSectionRecord,
} from "@/lib/firestore/projectSections";
import {
  createProjectTaskLink,
  removeProjectTaskLink,
  subscribeToProjectTaskLinks,
  updateProjectTaskLink,
  type ProjectTaskLinkDraft,
  type ProjectTaskLinkRecord,
} from "@/lib/firestore/projectTaskLinks";
import {
  addLinkedCalendarBlock,
  completeTask,
  createTask,
  reopenTask,
  subscribeToTasks,
  type TaskDraft,
  type TaskRecord,
} from "@/lib/firestore/tasks";
import {
  createCalendarTaskBlock,
  markCalendarTaskBlocksActive,
  markCalendarTaskBlocksComplete,
  type PlanningState,
} from "@/lib/firestore/calendarTaskBlocks";
import { toSafeFirebaseMessage } from "@/lib/firebase/errors";

type EasyProjectsContextValue = {
  projects: ProjectRecord[];
  sections: ProjectSectionRecord[];
  links: ProjectTaskLinkRecord[];
  tasks: TaskRecord[];
  isLoading: boolean;
  error: string;
  addProject: (draft: ProjectDraft) => Promise<string | null>;
  saveProject: (projectId: string, draft: ProjectDraft) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addSection: (draft: ProjectSectionDraft) => Promise<string | null>;
  saveSection: (sectionId: string, draft: ProjectSectionDraft) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  addProjectTask: (payload: { task: TaskDraft; link: Omit<ProjectTaskLinkDraft, "taskId"> }) => Promise<void>;
  saveProjectTaskLink: (linkId: string, draft: ProjectTaskLinkDraft) => Promise<void>;
  deleteProjectTaskLink: (linkId: string) => Promise<void>;
  completeProjectTask: (taskId: string) => Promise<void>;
  reopenProjectTask: (taskId: string) => Promise<void>;
  scheduleProjectTask: (payload: {
    task: TaskRecord;
    startAt: Date;
    endAt: Date;
    planningState?: PlanningState;
  }) => Promise<void>;
};

const EasyProjectsContext = createContext<EasyProjectsContextValue | undefined>(undefined);

function isVisualQaMode() {
  if (!import.meta.env.DEV) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("visualQa") === "1" || params.get("demo") === "1";
}

export function EasyProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [sections, setSections] = useState<ProjectSectionRecord[]>([]);
  const [links, setLinks] = useState<ProjectTaskLinkRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [error, setError] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    if (isVisualQaMode()) {
      setProjects([
        {
          id: "visual-project",
          title: "EasyLife polish launch",
          description: "A seeded QA project for checking detail and timeline layouts without Firestore data.",
          targetDate: "2026-04-18",
          status: "active",
          createdAt: new Date("2026-04-12T09:00:00"),
          updatedAt: new Date("2026-04-12T11:00:00"),
        },
      ]);
      setSections([
        {
          id: "visual-section-1",
          projectId: "visual-project",
          title: "Ship polish",
          order: 1,
          createdAt: new Date("2026-04-12T09:05:00"),
          updatedAt: new Date("2026-04-12T09:05:00"),
        },
        {
          id: "visual-section-2",
          projectId: "visual-project",
          title: "Follow-up",
          order: 2,
          createdAt: new Date("2026-04-12T09:10:00"),
          updatedAt: new Date("2026-04-12T09:10:00"),
        },
      ]);
      setLinks([
        {
          id: "visual-link-1",
          projectId: "visual-project",
          sectionId: "visual-section-1",
          taskId: "visual-task-1",
          order: 1,
          parentLabel: "Ship polish",
          createdAt: new Date("2026-04-12T09:15:00"),
          updatedAt: new Date("2026-04-12T09:15:00"),
        },
        {
          id: "visual-link-2",
          projectId: "visual-project",
          sectionId: "visual-section-2",
          taskId: "visual-task-2",
          order: 2,
          parentLabel: "Follow-up",
          createdAt: new Date("2026-04-12T09:20:00"),
          updatedAt: new Date("2026-04-12T09:20:00"),
        },
      ]);
      setTasks([
        {
          id: "visual-task-1",
          itemKind: "task",
          title: "Verify Settings labs in the deployed build",
          notes: "Seeded visual QA task",
          listName: "Main",
          category: "EasyLife",
          estimatedLength: 20,
          priorityTier: 2,
          priorityLabel: "High",
          dueDate: new Date("2026-04-12T12:00:00"),
          linkedCalendarEventId: null,
          linkedNoteId: null,
          recurring: false,
          completed: false,
          completedAt: null,
          deletedAt: null,
          linkedCalendarBlockIds: [],
          createdAt: new Date("2026-04-12T09:20:00"),
          updatedAt: new Date("2026-04-12T09:20:00"),
        },
        {
          id: "visual-task-2",
          itemKind: "task",
          title: "Write down the next cleanup ideas",
          notes: "Seeded visual QA task",
          listName: "Main",
          category: "EasyLife",
          estimatedLength: 15,
          priorityTier: 3,
          priorityLabel: "Medium",
          dueDate: null,
          linkedCalendarEventId: null,
          linkedNoteId: null,
          recurring: false,
          completed: false,
          completedAt: null,
          deletedAt: null,
          linkedCalendarBlockIds: [],
          createdAt: new Date("2026-04-12T09:25:00"),
          updatedAt: new Date("2026-04-12T09:25:00"),
        },
      ]);
      setProjectsLoading(false);
      setSectionsLoading(false);
      setLinksLoading(false);
      setTasksLoading(false);
      setError("");
      return;
    }

    if (!user) {
      setProjects([]);
      setSections([]);
      setLinks([]);
      setTasks([]);
      setProjectsLoading(false);
      setSectionsLoading(false);
      setLinksLoading(false);
      setTasksLoading(false);
      return;
    }

    setProjectsLoading(true);
    setSectionsLoading(true);
    setLinksLoading(true);
    setTasksLoading(true);

    const unsubscribeProjects = subscribeToProjects(
      user.uid,
      (records) => {
        setProjects(records);
        setProjectsLoading(false);
        setError("");
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setProjectsLoading(false);
      }
    );
    const unsubscribeSections = subscribeToProjectSections(
      user.uid,
      (records) => {
        setSections(records);
        setSectionsLoading(false);
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setSectionsLoading(false);
      }
    );
    const unsubscribeLinks = subscribeToProjectTaskLinks(
      user.uid,
      (records) => {
        setLinks(records);
        setLinksLoading(false);
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setLinksLoading(false);
      }
    );
    const unsubscribeTasks = subscribeToTasks(
      user.uid,
      (records) => {
        setTasks(records);
        setTasksLoading(false);
      },
      (nextError) => {
        setError(toSafeFirebaseMessage(nextError));
        setTasksLoading(false);
      }
    );

    return () => {
      unsubscribeProjects();
      unsubscribeSections();
      unsubscribeLinks();
      unsubscribeTasks();
    };
  }, [user]);

  const value = useMemo(
    () => ({
      projects,
      sections,
      links,
      tasks,
      isLoading: projectsLoading || sectionsLoading || linksLoading || tasksLoading,
      error,
      addProject: async (draft: ProjectDraft) => {
        if (!user) return null;
        return createProject(user.uid, draft);
      },
      saveProject: async (projectId: string, draft: ProjectDraft) => {
        if (!user) return;
        await updateProject(user.uid, projectId, draft);
      },
      deleteProject: async (projectId: string) => {
        if (!user) return;
        await Promise.all(
          links
            .filter((link) => link.projectId === projectId)
            .map((link) => removeProjectTaskLink(user.uid, link.id))
        );
        await Promise.all(
          sections
            .filter((section) => section.projectId === projectId)
            .map((section) => removeProjectSection(user.uid, section.id))
        );
        await removeProject(user.uid, projectId);
      },
      addSection: async (draft: ProjectSectionDraft) => {
        if (!user) return null;
        return createProjectSection(user.uid, draft);
      },
      saveSection: async (sectionId: string, draft: ProjectSectionDraft) => {
        if (!user) return;
        await updateProjectSection(user.uid, sectionId, draft);
      },
      deleteSection: async (sectionId: string) => {
        if (!user) return;
        await Promise.all(
          links
            .filter((link) => link.sectionId === sectionId)
            .map((link) => removeProjectTaskLink(user.uid, link.id))
        );
        await removeProjectSection(user.uid, sectionId);
      },
      addProjectTask: async (payload: { task: TaskDraft; link: Omit<ProjectTaskLinkDraft, "taskId"> }) => {
        if (!user) return;
        const taskId = await createTask(user.uid, payload.task);
        await createProjectTaskLink(user.uid, {
          ...payload.link,
          taskId,
        });
      },
      saveProjectTaskLink: async (linkId: string, draft: ProjectTaskLinkDraft) => {
        if (!user) return;
        await updateProjectTaskLink(user.uid, linkId, draft);
      },
      deleteProjectTaskLink: async (linkId: string) => {
        if (!user) return;
        await removeProjectTaskLink(user.uid, linkId);
      },
      completeProjectTask: async (taskId: string) => {
        if (!user) return;
        const task = tasks.find((entry) => entry.id === taskId);
        await completeTask(user.uid, taskId);
        if (task?.linkedCalendarBlockIds.length) {
          await markCalendarTaskBlocksComplete(user.uid, task.linkedCalendarBlockIds);
        }
      },
      reopenProjectTask: async (taskId: string) => {
        if (!user) return;
        const task = tasks.find((entry) => entry.id === taskId);
        await reopenTask(user.uid, taskId);
        if (task?.linkedCalendarBlockIds.length) {
          await markCalendarTaskBlocksActive(user.uid, task.linkedCalendarBlockIds);
        }
      },
      scheduleProjectTask: async (payload: {
        task: TaskRecord;
        startAt: Date;
        endAt: Date;
        planningState?: PlanningState;
      }) => {
        if (!user) return;
        const blockId = await createCalendarTaskBlock(user.uid, {
          taskId: payload.task.id,
          titleSnapshot: payload.task.title || "Untitled task",
          categoryId: payload.task.category.trim() || null,
          startAt: payload.startAt,
          endAt: payload.endAt,
          planningState: payload.planningState || "scheduled",
          isFlexible: true,
          userAdjusted: true,
        });
        await addLinkedCalendarBlock(user.uid, payload.task.id, blockId);
      },
    }),
    [
      error,
      links,
      linksLoading,
      projects,
      projectsLoading,
      sections,
      sectionsLoading,
      tasks,
      tasksLoading,
      user,
    ]
  );

  return <EasyProjectsContext.Provider value={value}>{children}</EasyProjectsContext.Provider>;
}

export function useEasyProjects() {
  const context = useContext(EasyProjectsContext);
  if (!context) {
    throw new Error("useEasyProjects must be used inside EasyProjectsProvider");
  }

  return context;
}
