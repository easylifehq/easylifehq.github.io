import { useState } from "react";
import { Link } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyProjects } from "@/features/easyprojects/EasyProjectsContext";
import type { ProjectStatus } from "@/lib/firestore/projects";

export function EasyProjectsHomePage() {
  const { projects, sections, links, tasks, addProject, saveProject, deleteProject, error, isLoading } = useEasyProjects();
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingTargetDate, setEditingTargetDate] = useState("");
  const [editingStatus, setEditingStatus] = useState<ProjectStatus>("active");

  async function handleAddProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return;
    await addProject({
      title,
      description: String(form.get("description") || "").trim(),
      targetDate: String(form.get("targetDate") || ""),
      status: "active",
    });
    event.currentTarget.reset();
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
      <div className="dashboard-grid">
        <PageSection
          eyebrow="Create"
          title="New project"
          description="Set the goal first, then break it into sections and tasks."
        >
          {error ? <p className="error-copy">{error}</p> : null}
          <form className="task-composer" onSubmit={handleAddProject}>
            <div className="task-composer-grid">
              <label className="field-stack">
                <span>Project title</span>
                <input name="title" placeholder="Launch portfolio refresh" />
              </label>
              <label className="field-stack">
                <span>Target date</span>
                <input name="targetDate" type="date" />
              </label>
              <label className="field-stack field-stack-wide">
                <span>Description</span>
                <textarea name="description" rows={4} placeholder="What this project is for and what done looks like." />
              </label>
            </div>
            <button type="submit" className="primary-button">Create project</button>
          </form>
        </PageSection>

        <PageSection
          eyebrow="Summary"
          title="Project pulse"
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
              <article key={project.id} className="task-card-vnext">
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
                      {projectSections.length} section{projectSections.length === 1 ? "" : "s"} |{" "}
                      {completedCount}/{projectLinks.length} tasks complete
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
