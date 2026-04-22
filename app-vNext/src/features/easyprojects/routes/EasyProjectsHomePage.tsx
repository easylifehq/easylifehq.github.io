import { useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyProjects } from "@/features/easyprojects/EasyProjectsContext";
import { requestProjectPlan, type AiProjectPlan } from "@/features/easyprojects/lib/projectAiPlanner";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";
import { useSettings } from "@/features/settings/SettingsContext";
import type { ProjectStatus } from "@/lib/firestore/projects";

export function EasyProjectsHomePage() {
  const {
    projects,
    sections,
    links,
    tasks,
    addProject,
    saveProject,
    deleteProject,
    addSection,
    addProjectTask,
    error,
    isLoading,
  } = useEasyProjects();
  const { settings, isExperimentalFeatureEnabled } = useSettings();
  const isProjectPlannerEnabled =
    settings.assistant.enabled &&
    settings.assistant.allowDraftCreation &&
    isExperimentalFeatureEnabled("projectPlanner");
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingTargetDate, setEditingTargetDate] = useState("");
  const [editingStatus, setEditingStatus] = useState<ProjectStatus>("active");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectTargetDate, setNewProjectTargetDate] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [plannerTitle, setPlannerTitle] = useState("");
  const [plannerDescription, setPlannerDescription] = useState("");
  const [plannerTargetDate, setPlannerTargetDate] = useState("");
  const [aiPlan, setAiPlan] = useState<AiProjectPlan | null>(null);
  const [plannerMessage, setPlannerMessage] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  async function handlePlanProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plannerTitle.trim() && !plannerDescription.trim()) return;

    setIsPlanning(true);
    setPlannerMessage("");

    if (!settings.assistant.enabled || !settings.assistant.allowDraftCreation) {
      setPlannerMessage("Turn on Assistant and draft creation in Settings before using AI project planning.");
      setIsPlanning(false);
      return;
    }

    try {
      const nextPlan = await requestProjectPlan({
        title: plannerTitle,
        description: plannerDescription,
        targetDate: plannerTargetDate,
      });
      setAiPlan(nextPlan);
      setPlannerMessage(
        settings.assistant.requireReviewBeforeSave
          ? "Review the plan, then create it when it feels right."
          : "A draft plan is ready. Check it before adding it to your workspace."
      );
    } catch (nextError) {
      setPlannerMessage(
        settings.assistant.fallbackMode === "quiet"
          ? "AI project planning is unavailable."
          : nextError instanceof Error
            ? nextError.message
            : "AI project planning is unavailable. You can still create the project manually below."
      );
    } finally {
      setIsPlanning(false);
    }
  }

  async function handleCreateAiPlan() {
    if (!aiPlan || (!plannerTitle.trim() && !plannerDescription.trim())) return;

    setIsCreatingPlan(true);
    setPlannerMessage("");

    try {
      if (settings.assistant.requireReviewBeforeSave && !aiPlan.sections.length) {
        throw new Error("Review a generated draft before creating the project.");
      }

      const projectId = await addProject({
        title: plannerTitle.trim() || "AI planned project",
        description: [plannerDescription.trim(), aiPlan.summary.trim()].filter(Boolean).join("\n\n"),
        targetDate: plannerTargetDate,
        status: "active",
      });

      if (!projectId) {
        throw new Error("Could not create the project yet.");
      }

      for (const [sectionIndex, section] of aiPlan.sections.entries()) {
        const sectionId = await addSection({
          projectId,
          title: section.title,
          order: sectionIndex + 1,
        });

        if (!sectionId) continue;

        for (const [taskIndex, task] of section.tasks.entries()) {
          await addProjectTask({
            task: {
              title: task.title,
              notes: task.notes,
              category: plannerTitle.trim() || "Project",
              dueDate: task.dueDate,
              estimatedLength: task.estimatedLength,
              priorityTier: task.priorityTier,
              priorityLabel: getPriorityMeta(task.priorityTier).label,
              recurring: false,
            },
            link: {
              projectId,
              sectionId,
              order: taskIndex + 1,
              parentLabel: section.title,
            },
          });
        }
      }

      setPlannerMessage("Project plan created. Open it below to refine the details.");
      setAiPlan(null);
      setPlannerTitle("");
      setPlannerDescription("");
      setPlannerTargetDate("");
    } catch (nextError) {
      setPlannerMessage(nextError instanceof Error ? nextError.message : "Could not create the project plan.");
    } finally {
      setIsCreatingPlan(false);
    }
  }

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newProjectTitle.trim()) return;

    const projectId = await addProject({
      title: newProjectTitle.trim(),
      description: newProjectDescription.trim(),
      targetDate: newProjectTargetDate,
      status: "active",
    });

    if (!projectId) return;

    setNewProjectTitle("");
    setNewProjectTargetDate("");
    setNewProjectDescription("");
  }

  function startEditingProject(projectId: string) {
    const project = projects.find((entry) => entry.id === projectId);
    if (!project) return;
    setEditingProjectId(project.id);
    setEditingTitle(project.title);
    setEditingDescription(project.description);
    setEditingTargetDate(project.targetDate);
    setEditingStatus(project.status);
  }

  async function handleSaveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProjectId || !editingTitle.trim()) return;
    await saveProject(editingProjectId, {
      title: editingTitle.trim(),
      description: editingDescription.trim(),
      targetDate: editingTargetDate,
      status: editingStatus,
    });
    setEditingProjectId("");
    setEditingTitle("");
    setEditingDescription("");
    setEditingTargetDate("");
    setEditingStatus("active");
  }

  return (
    <>
      {error ? <p className="error-copy">{error}</p> : null}

      <div className="dashboard-grid">
        <PageSection
          eyebrow="Projects"
          title="Start a project"
          description="Give the work a name now. Sections, tasks, and dates can come after."
        >
          <form className="project-command-strip" onSubmit={handleCreateProject}>
            <label className="field-stack project-title-field">
              <span>Project name</span>
              <input
                value={newProjectTitle}
                onChange={(event) => setNewProjectTitle(event.target.value)}
                placeholder="Portfolio refresh, exam prep, apartment move..."
              />
            </label>
            <label className="field-stack">
              <span>Target date</span>
              <input
                type="date"
                value={newProjectTargetDate}
                onChange={(event) => setNewProjectTargetDate(event.target.value)}
              />
            </label>
            <button type="submit" className="primary-button" disabled={!newProjectTitle.trim()}>
              Add project
            </button>
            <label className="field-stack field-stack-wide project-description-field">
              <span>Notes</span>
              <input
                value={newProjectDescription}
                onChange={(event) => setNewProjectDescription(event.target.value)}
                placeholder="Optional context, constraints, or what done looks like"
              />
            </label>
          </form>
        </PageSection>

        <details className="advanced-disclosure">
          <summary>Project pulse</summary>
          <PageSection
            eyebrow="Summary"
            title="Current load"
            description="A quick read on the amount of work currently living in projects."
          >
            <div className="stats-grid">
              <article className="stat-card-vnext">
                <span>Projects</span>
                <strong>{projects.length}</strong>
              </article>
              <article className="stat-card-vnext">
                <span>Sections</span>
                <strong>{sections.length}</strong>
              </article>
              <article className="stat-card-vnext">
                <span>Linked tasks</span>
                <strong>{links.length}</strong>
              </article>
              <article className="stat-card-vnext">
                <span>Completed</span>
                <strong>{links.filter((link) => tasks.find((task) => task.id === link.taskId)?.completed).length}</strong>
              </article>
            </div>
          </PageSection>
        </details>

        {isProjectPlannerEnabled ? (
          <details className="advanced-disclosure">
            <summary>AI project planner</summary>
            <PageSection
              eyebrow="Experimental"
              title="Draft from a rough idea"
              description="Describe the outcome and EasyProjects can draft sections, due dates, and linked tasks for review."
            >
              <form className="project-ai-planner" onSubmit={handlePlanProject}>
                <div className="task-composer-grid">
                  <label className="field-stack">
                    <span>Project idea</span>
                    <input
                      value={plannerTitle}
                      onChange={(event) => setPlannerTitle(event.target.value)}
                      placeholder="Launch portfolio refresh"
                    />
                  </label>
                  <label className="field-stack">
                    <span>Target date</span>
                    <input
                      type="date"
                      value={plannerTargetDate}
                      onChange={(event) => setPlannerTargetDate(event.target.value)}
                    />
                  </label>
                  <label className="field-stack field-stack-wide">
                    <span>What should the plan account for?</span>
                    <textarea
                      rows={4}
                      value={plannerDescription}
                      onChange={(event) => setPlannerDescription(event.target.value)}
                      placeholder="Add constraints, deliverables, class deadlines, materials, people involved, or what done looks like."
                    />
                  </label>
                </div>

                <div className="task-composer-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isPlanning || (!plannerTitle.trim() && !plannerDescription.trim())}
                  >
                    {isPlanning ? "Planning..." : "Generate plan"}
                  </button>
                  {aiPlan ? (
                    <button type="button" className="button-secondary" onClick={() => setAiPlan(null)}>
                      Clear preview
                    </button>
                  ) : null}
                </div>
              </form>

              {plannerMessage ? <p className="helper-copy">{plannerMessage}</p> : null}

              {aiPlan ? (
                <div className="project-ai-preview">
                  <div className="project-ai-preview-header">
                    <div>
                      <p className="eyebrow">Draft plan</p>
                      <h3>{aiPlan.summary || "A structured project plan is ready."}</h3>
                    </div>
                    <button
                      type="button"
                      className="primary-button compact-button"
                      onClick={() => void handleCreateAiPlan()}
                      disabled={isCreatingPlan}
                    >
                      {isCreatingPlan ? "Creating..." : "Create project plan"}
                    </button>
                  </div>

                  {aiPlan.risks.length ? (
                    <div className="pill-row">
                      {aiPlan.risks.map((risk) => (
                        <span key={risk} className="info-pill">{risk}</span>
                      ))}
                    </div>
                  ) : null}

                  <div className="project-ai-section-list">
                    {aiPlan.sections.map((section) => (
                      <article key={section.title} className="project-ai-section-card">
                        <div className="task-card-title-row">
                          <h4>{section.title}</h4>
                          {section.suggestedDueDate ? <span className="priority-pill-vnext">Due {section.suggestedDueDate}</span> : null}
                        </div>
                        {section.goal ? <p>{section.goal}</p> : null}
                        <ul>
                          {section.tasks.map((task) => (
                            <li key={`${section.title}-${task.title}`}>
                              <span>{task.title}</span>
                              <small>
                                {getPriorityMeta(task.priorityTier).label}
                                {task.estimatedLength ? ` | ${task.estimatedLength} min` : ""}
                                {task.dueDate ? ` | ${task.dueDate}` : ""}
                              </small>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </PageSection>
          </details>
        ) : null}
      </div>

      <PageSection
        eyebrow="Projects"
        title="Active projects"
        description="Open a project to organize sections, tasks, and scheduling."
      >
        {isLoading ? <p className="helper-copy">Loading projects...</p> : null}
        <div className="task-list-vnext">
          {!isLoading && projects.length === 0 ? (
            <div className="empty-card-vnext">No projects yet.</div>
          ) : null}
          {projects.map((project) => {
            const projectSections = sections.filter((section) => section.projectId === project.id);
            const projectLinks = links.filter((link) => link.projectId === project.id);
            const completedCount = projectLinks.filter((link) => tasks.find((task) => task.id === link.taskId)?.completed).length;
            return (
              <article key={project.id} className="task-card-vnext project-card-compact">
                {editingProjectId === project.id ? (
                  <form className="task-card-copy" onSubmit={handleSaveProject}>
                    <div className="task-composer-grid">
                      <label className="field-stack">
                        <span>Project title</span>
                        <input value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} />
                      </label>
                      <label className="field-stack">
                        <span>Target date</span>
                        <input type="date" value={editingTargetDate} onChange={(event) => setEditingTargetDate(event.target.value)} />
                      </label>
                      <label className="field-stack">
                        <span>Status</span>
                        <select value={editingStatus} onChange={(event) => setEditingStatus(event.target.value as ProjectStatus)}>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                      </label>
                      <label className="field-stack field-stack-wide">
                        <span>Description</span>
                        <textarea rows={3} value={editingDescription} onChange={(event) => setEditingDescription(event.target.value)} />
                      </label>
                    </div>
                    <div className="task-composer-actions">
                      <button type="button" className="ghost-button" onClick={() => setEditingProjectId("")}>
                        Cancel
                      </button>
                      <button type="submit" className="primary-button">Save changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="task-card-copy">
                    <div className="task-card-title-row">
                      <h3>{project.title}</h3>
                      <span className="priority-pill-vnext">{project.status}</span>
                    </div>
                    <p>
                      {completedCount}/{projectLinks.length} done | {projectSections.length} section{projectSections.length === 1 ? "" : "s"}
                      {project.targetDate ? ` | due ${project.targetDate}` : ""}
                    </p>
                    {project.description ? <small>{project.description}</small> : null}
                  </div>
                )}
                <div className="task-card-actions">
                  <Link to={`/app/easyprojects/${project.id}`} className="primary-button compact-button">
                    Open
                  </Link>
                  {editingProjectId === project.id ? null : (
                    <button type="button" className="button-secondary compact-button" onClick={() => startEditingProject(project.id)}>
                      Edit
                    </button>
                  )}
                  <button type="button" className="ghost-button" onClick={() => void deleteProject(project.id)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}
