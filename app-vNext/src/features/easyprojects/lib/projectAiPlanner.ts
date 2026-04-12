import { auth } from "@/lib/firebase/client";

export type AiProjectPlanTask = {
  title: string;
  notes: string;
  dueDate: string | null;
  estimatedLength: number | null;
  priorityTier: 1 | 2 | 3 | 4 | 5;
};

export type AiProjectPlanSection = {
  title: string;
  goal: string;
  suggestedDueDate: string | null;
  tasks: AiProjectPlanTask[];
};

export type AiProjectPlan = {
  summary: string;
  risks: string[];
  sections: AiProjectPlanSection[];
};

type ProjectPlanningPayload = {
  title: string;
  description: string;
  targetDate: string;
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizePriority(priorityTier: unknown): 1 | 2 | 3 | 4 | 5 {
  const tier = Number(priorityTier);
  return ([1, 2, 3, 4, 5].includes(tier) ? tier : 3) as 1 | 2 | 3 | 4 | 5;
}

function normalizePlan(payload: unknown): AiProjectPlan {
  const plan = payload as Partial<AiProjectPlan> | null;
  const sections = Array.isArray(plan?.sections) ? plan.sections : [];

  return {
    summary: String(plan?.summary || "").trim(),
    risks: Array.isArray(plan?.risks)
      ? plan.risks.map((risk) => String(risk || "").trim()).filter(Boolean).slice(0, 5)
      : [],
    sections: sections
      .map((section) => ({
        title: String(section?.title || "").trim(),
        goal: String(section?.goal || "").trim(),
        suggestedDueDate: typeof section?.suggestedDueDate === "string" ? section.suggestedDueDate : null,
        tasks: (Array.isArray(section?.tasks) ? section.tasks : [])
          .map((task) => ({
            title: String(task?.title || "").trim(),
            notes: String(task?.notes || "").trim(),
            dueDate: typeof task?.dueDate === "string" ? task.dueDate : null,
            estimatedLength:
              typeof task?.estimatedLength === "number" && task.estimatedLength > 0 ? task.estimatedLength : null,
            priorityTier: normalizePriority(task?.priorityTier),
          }))
          .filter((task) => task.title)
          .slice(0, 8),
      }))
      .filter((section) => section.title && section.tasks.length)
      .slice(0, 6),
  };
}

export async function requestProjectPlan(payload: ProjectPlanningPayload) {
  const endpoint =
    import.meta.env.VITE_PROJECT_PLANNER_URL ||
    "https://us-central1-pipeline-2f422.cloudfunctions.net/planProjectWithAi";
  const user = auth.currentUser;

  if (!endpoint) {
    throw new Error("Project planner AI is not configured yet.");
  }

  if (!user) {
    throw new Error("Sign in before using AI project planning.");
  }

  const token = await user.getIdToken();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      currentDate: toDateInputValue(new Date()),
    }),
  });

  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(responsePayload?.error || "AI project planning failed.");
  }

  return normalizePlan(responsePayload);
}
