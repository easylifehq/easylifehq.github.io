import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyProjects } from "@/features/easyprojects/EasyProjectsContext";
import { getPriorityMeta } from "@/features/easylist/lib/taskUtils";
import type { ProjectStatus } from "@/lib/firestore/projects";

export function EasyProjectDetailPage() {
  const { projectId = "" } = useParams();
  const {
    projects,
    sections,
    links,
    tasks,
    addSection,
    saveSection,
    deleteSection,
    saveProject,
    addProjectTask,
    deleteProjectTaskLink,
    completeProjectTask,
    reopenProjectTask,
  } = useEasyProjects();
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTargetDate, setProjectTargetDate] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("active");
  const [editingSectionId, setEditingSectionId] = useState("");
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  const project = projects.find((entry) => entry.id === projectId) || null;
  const projectSections = sections.filter((section) => section.projectId === projectId);
  const projectLinks = links.filter((link) => link.projectId === projectId);
  const completedCount = projectLinks.filter((link) => tasks.find((task) => task.id === link.taskId)?.completed).length;
  const openCount = projectLinks.length - completedCount;

  async function handleAddSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return;
    await addSection({
      projectId,
      title,
      order: projectSections.length,
    });
    event.currentTarget.reset();
  }

  function startEditingProject() {
    if (!project) return;
    setIsEditingProject(true);
    setProjectTitle(project.title);
    setProjectDescription(project.description);
    setProjectTargetDate(project.targetDate);
    setProjectStatus(project.status);
  }

  async function handleSaveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project || !projectTitle.trim()) return;
    await saveProject(project.id, {
      title: projectTitle.trim(),
      description: projectDescription.trim(),
      targetDate: projectTargetDate,
      status: projectStatus,
    });
    setIsEditingProject(false);
  }

  function startEditingSection(sectionId: string) {
    const section = sections.find((entry) => entry.id === sectionId);
    if (!section) return;
    setEditingSectionId(section.id);
    setEditingSectionTitle(section.title);
  }

  async function handleSaveSection(event: React.FormEvent<HTMLFormElement>, sectionId: string) {
    event.preventDefault();
    const section = sections.find((entry) => entry.id === sectionId);
    if (!section || !editingSectionTitle.trim()) return;
    await saveSection(section.id, {
      projectId: section.projectId,
      title: editingSectionTitle.trim(),
      order: section.order,
    });
    setEditingSectionId("");
    setEditingSectionTitle("");
  }

  async function handleAddTask(event: React.FormEvent<HTMLFormElement>, sectionId: string, currentCount: number) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return;
    const priorityTier = Number(form.get("priorityTier") || 3) as 1 | 2 | 3 | 4 | 5;
    await addProjectTask({
      task: {
        title,
        notes: String(form.get("notes") || "").trim(),
        category: project?.title || "EasyProjects",
        estimatedLength: form.get("estimatedLength") ? Number(form.get("estimatedLength")) : null,
        priorityTier,
        priorityLabel: getPriorityMeta(priorityTier).label,
        dueDate: String(form.get("dueDate") || "") || null,
        recurring: false,
      },
      link: {
        projectId,
        sectionId,
        order: currentCount,
        parentLabel: "",
      },
    });
    event.currentTarget.reset();
  }

  if (!project) {
    return (
      <PageSection eyebrow="Projects" title="Project not found">
        <Link to="/app/easyprojects" className="button-secondary">
          Back to projects
        </Link>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection
        eyebrow="Project"
        title={project.title}
        description={project.description || "Break the work into sections, then schedule the pieces that need calendar time."}
      >
        {isEditingProject ? (
          <form className="task-composer" onSubmit={handleSaveProject}>
            <div className="task-composer-grid">
              <label className="field-stack">
                <span>Project title</span>
                <input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} />
              </label>
              <label className="field-stack">
                <span>Target date</span>
                <input type="date" value={projectTargetDate} onChange={(event) => setProjectTargetDate(event.target.value)} />
              </label>
              <label className="field-stack">
                <span>Status</span>
                <select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value as ProjectStatus)}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label className="field-stack field-stack-wide">
                <span>Description</span>
                <textarea rows={3} value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} />
              </label>
            </div>
            <div className="task-composer-actions">
              <button type="button" className="ghost-button" onClick={() => setIsEditingProject(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button">Save project</button>
            </div>
          </form>
        ) : (
          <div className="toolbar-row-compact">
            <div className="pill-row">
              <span className="info-pill">{project.status}</span>
              <span className="info-pill">{openCount} open</span>
              <span className="info-pill">{completedCount} done</span>
              {project.targetDate ? <span className="info-pill">Due {project.targetDate}</span> : null}
            </div>
            <div className="task-composer-actions">
              <button type="button" className="button-secondary" onClick={startEditingProject}>
                Edit project
              </button>
              <Link to={`/app/easyprojects/${project.id}/timeline`} className="button-secondary">
                Open timeline
              </Link>
            </div>
          </div>
        )}
      </PageSection>

      <details className="advanced-disclosure">
        <summary>Add a section</summary>
        <PageSection
          eyebrow="Structure"
          title="Create a bucket"
          description="Use sections for milestones, phases, or groups of work."
        >
          <form className="task-composer-actions" onSubmit={handleAddSection}>
            <input name="title" className="search-input" aria-label="Section title" placeholder="Research, build, review..." />
            <button type="submit" className="primary-button">Add section</button>
          </form>
        </PageSection>
      </details>

      <div className="project-section-board">
        {projectSections.length === 0 ? <div className="empty-card-vnext">Add your first section to start breaking the project down.</div> : null}
        {projectSections.map((section) => {
          const sectionLinks = projectLinks.filter((link) => link.sectionId === section.id);
          return (
            <PageSection
              key={section.id}
              eyebrow="Section"
              title={section.title}
              description={`${sectionLinks.length} task${sectionLinks.length === 1 ? "" : "s"} linked to this section`}
            >
              <div className="toolbar-row-compact project-section-toolbar">
                <span className="helper-copy">{sectionLinks.length} task{sectionLinks.length === 1 ? "" : "s"}</span>
                <div className="task-composer-actions">
                  <button type="button" className="button-secondary compact-button" onClick={() => startEditingSection(section.id)}>
                    Edit section
                  </button>
                  <button type="button" className="ghost-button" onClick={() => void deleteSection(section.id)}>
                    Delete section
                  </button>
                </div>
              </div>

              {editingSectionId === section.id ? (
                <form className="task-composer-actions" onSubmit={(event) => void handleSaveSection(event, section.id)}>
                  <input value={editingSectionTitle} onChange={(event) => setEditingSectionTitle(event.target.value)} className="search-input" aria-label="Edit section title" />
                  <button type="button" className="ghost-button" onClick={() => setEditingSectionId("")}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">Save section</button>
                </form>
              ) : null}

              <details className="project-inline-add">
                <summary>Add task</summary>
                <form className="task-composer" onSubmit={(event) => void handleAddTask(event, section.id, sectionLinks.length)}>
                  <div className="task-composer-grid project-task-create-grid">
                    <label className="field-stack">
                      <span>Task</span>
                      <input name="title" placeholder="Build onboarding screen" />
                    </label>
                    <label className="field-stack">
                      <span>Due date</span>
                      <input name="dueDate" type="date" />
                    </label>
                    <label className="field-stack">
                      <span>Minutes</span>
                      <input name="estimatedLength" type="number" min="0" step="5" placeholder="45" />
                    </label>
                    <label className="field-stack">
                      <span>Priority</span>
                      <select name="priorityTier" defaultValue="3">
                        {[1, 2, 3, 4, 5].map((tier) => (
                          <option key={tier} value={tier}>
                            {getPriorityMeta(tier).label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field-stack field-stack-wide">
                      <span>Notes</span>
                      <input name="notes" placeholder="Anything the task needs to keep its context" />
                    </label>
                  </div>
                  <button type="submit" className="primary-button">Add task to section</button>
                </form>
              </details>

              <div className="task-list-vnext">
                {sectionLinks.length === 0 ? (
                  <div className="empty-card-vnext">No tasks in this section yet.</div>
                ) : (
                  sectionLinks.map((link) => {
                    const task = tasks.find((entry) => entry.id === link.taskId);
                    if (!task) return null;
                    return (
                      <article key={link.id} className={`task-card-vnext project-task-row${task.completed ? " completed" : ""}`}>
                        <div className="task-card-copy">
                          <div className="task-card-title-row">
                            <h3>{task.title}</h3>
                            <span className="priority-pill-vnext">{task.priorityLabel}</span>
                          </div>
                          <p>
                            {task.estimatedLength ? `${task.estimatedLength} min | ` : ""}
                            {task.dueDate ? task.dueDate.toLocaleDateString() : "No due date"}
                            {task.linkedCalendarBlockIds.length ? ` | Scheduled (${task.linkedCalendarBlockIds.length})` : ""}
                          </p>
                          {task.notes ? <small>{task.notes}</small> : null}
                        </div>
                        <div className="task-card-actions">
                          {task.completed ? (
                            <button type="button" className="ghost-button" onClick={() => void reopenProjectTask(task.id)}>
                              Reopen
                            </button>
                          ) : (
                            <button type="button" className="primary-button compact-button" onClick={() => void completeProjectTask(task.id)}>
                              Complete
                            </button>
                          )}
                          <Link to={`/app/easyprojects/${project.id}/timeline`} className="button-secondary compact-button">
                            Schedule
                          </Link>
                          <button type="button" className="ghost-button" onClick={() => void deleteProjectTaskLink(link.id)}>
                            Remove
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </PageSection>
          );
        })}
      </div>
    </>
  );
}
