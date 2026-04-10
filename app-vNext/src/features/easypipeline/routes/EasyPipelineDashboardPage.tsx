import { useMemo, useState } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { ApplicationDrawer } from "@/features/easypipeline/components/ApplicationDrawer";
import { useEasyPipeline } from "@/features/easypipeline/EasyPipelineContext";
import type { ApplicationDraft, ApplicationRecord, ApplicationStatus } from "@/lib/firestore/applications";

const statusOrder: Array<{ key: ApplicationStatus; label: string }> = [
  { key: "need_to_apply", label: "Need to Apply" },
  { key: "applied", label: "Applied" },
  { key: "follow_up", label: "Follow Up" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "archived", label: "Archived" },
];

const emptyDraft: ApplicationDraft = {
  company: "",
  title: "",
  status: "need_to_apply",
  priority: "medium",
  offerResponse: "",
  dateApplied: "",
  nextFollowUp: "",
  location: "",
  link: "",
  notes: "",
  contactName: "",
  contactEmail: "",
};

function isFollowUpDue(nextFollowUp: string) {
  if (!nextFollowUp) return false;
  const today = new Date().toISOString().split("T")[0];
  return nextFollowUp <= today;
}

export function EasyPipelineDashboardPage() {
  const { applications, isLoading, error, addApplication, saveApplication, deleteApplication } =
    useEasyPipeline();
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);
  const grouped = useMemo(
    () =>
      statusOrder.map(({ key, label }) => ({
        key,
        label,
        items: applications.filter((application) => application.status === key),
      })),
    [applications]
  );
  const followUpsDue = applications.filter((application) => isFollowUpDue(application.nextFollowUp)).length;

  async function handleAddApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addApplication(draft);
    setDraft(emptyDraft);
  }

  return (
    <>
      <PageSection
        eyebrow="Momentum"
        title="Pipeline board"
        description="Track applications by stage, keep follow-ups visible, and edit details without leaving the board."
      >
        {error ? <p className="error-copy">{error}</p> : null}

        <div className="stats-grid">
          <article className="stat-card-vnext">
            <span>Total applications</span>
            <strong>{applications.length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Follow-ups due</span>
            <strong>{followUpsDue}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Interviewing</span>
            <strong>{applications.filter((application) => application.status === "interviewing").length}</strong>
          </article>
          <article className="stat-card-vnext">
            <span>Offers</span>
            <strong>{applications.filter((application) => application.status === "offer").length}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Add"
        title="Capture a new application"
        description="Keep this fast on mobile, then fill in more detail later from the board."
      >
        <form className="task-composer" onSubmit={handleAddApplication}>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Company</span>
              <input
                value={draft.company}
                onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))}
                required
              />
            </label>
            <label className="field-stack">
              <span>Role</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>
            <label className="field-stack">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, status: event.target.value as ApplicationStatus }))
                }
              >
                {statusOrder.map((status) => (
                  <option key={status.key} value={status.key}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span>Priority</span>
              <select
                value={draft.priority}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, priority: event.target.value as ApplicationDraft["priority"] }))
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="field-stack">
              <span>Date applied</span>
              <input
                type="date"
                value={draft.dateApplied}
                onChange={(event) => setDraft((current) => ({ ...current, dateApplied: event.target.value }))}
              />
            </label>
            <label className="field-stack">
              <span>Next follow-up</span>
              <input
                type="date"
                value={draft.nextFollowUp}
                onChange={(event) => setDraft((current) => ({ ...current, nextFollowUp: event.target.value }))}
              />
            </label>
            <label className="field-stack field-stack-wide">
              <span>Notes</span>
              <textarea
                value={draft.notes}
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Add application
          </button>
        </form>
      </PageSection>

      <PageSection
        eyebrow="Board"
        title="Status lanes"
        description="Tap any application to update details or archive it."
      >
        {isLoading ? <p className="helper-copy">Loading applications...</p> : null}

        <div className="pipeline-board-grid">
          {grouped.map((group) => (
            <section key={group.key} className="pipeline-column">
              <header className="pipeline-column-header">
                <strong>{group.label}</strong>
                <span>{group.items.length}</span>
              </header>

              <div className="pipeline-card-stack">
                {group.items.length ? (
                  group.items.map((application) => (
                    <button
                      key={application.id}
                      type="button"
                      className="pipeline-card"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div>
                        <strong>{application.title || "Untitled role"}</strong>
                        <p>{application.company || "Unknown company"}</p>
                      </div>
                      <div className="pipeline-card-meta">
                        <span className={`chip-pill priority-${application.priority}`}>{application.priority}</span>
                        {application.nextFollowUp ? <span className="chip-pill">{application.nextFollowUp}</span> : null}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="empty-card-vnext">Nothing here yet.</div>
                )}
              </div>
            </section>
          ))}
        </div>
      </PageSection>

      <ApplicationDrawer
        application={selectedApplication}
        isOpen={Boolean(selectedApplication)}
        onClose={() => setSelectedApplication(null)}
        onSave={saveApplication}
        onDelete={deleteApplication}
      />
    </>
  );
}
