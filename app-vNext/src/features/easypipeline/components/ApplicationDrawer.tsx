import { useEffect, useMemo, useState } from "react";
import type { ApplicationDraft, ApplicationRecord } from "@/lib/firestore/applications";

type ApplicationDrawerProps = {
  application: ApplicationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (applicationId: string, draft: ApplicationDraft) => Promise<void>;
  onDelete: (applicationId: string) => Promise<void>;
};

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

function toDraft(application: ApplicationRecord): ApplicationDraft {
  return {
    company: application.company,
    title: application.title,
    status: application.status,
    priority: application.priority,
    offerResponse: application.offerResponse,
    dateApplied: application.dateApplied,
    nextFollowUp: application.nextFollowUp,
    location: application.location,
    link: application.link,
    notes: application.notes,
    contactName: application.contactName,
    contactEmail: application.contactEmail,
  };
}

export function ApplicationDrawer({
  application,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ApplicationDrawerProps) {
  const initialDraft = useMemo(
    () => (application ? toDraft(application) : emptyDraft),
    [application]
  );
  const [draft, setDraft] = useState<ApplicationDraft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  if (!application) return null;
  const currentApplication = application;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    await onSave(currentApplication.id, draft);
    setIsSaving(false);
    onClose();
  }

  async function handleDelete() {
    setIsSaving(true);
    await onDelete(currentApplication.id);
    setIsSaving(false);
    onClose();
  }

  return (
    <>
      <div
        className={`drawer-backdrop-vnext${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`task-drawer-vnext${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-header-vnext">
          <div>
            <p className="eyebrow">EasyPipeline</p>
            <h2>{currentApplication.title || "Edit application"}</h2>
          </div>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
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
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, status: event.target.value as ApplicationDraft["status"] }))
                }
              >
                <option value="need_to_apply">Need to Apply</option>
                <option value="applied">Applied</option>
                <option value="follow_up">Follow Up</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="archived">Archived</option>
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
          </div>
          <div className="task-composer-grid">
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
          </div>
          <label className="field-stack">
            <span>Location</span>
            <input
              value={draft.location}
              onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
            />
          </label>
          <label className="field-stack">
            <span>Link</span>
            <input
              value={draft.link}
              onChange={(event) => setDraft((current) => ({ ...current, link: event.target.value }))}
            />
          </label>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Contact name</span>
              <input
                value={draft.contactName}
                onChange={(event) => setDraft((current) => ({ ...current, contactName: event.target.value }))}
              />
            </label>
            <label className="field-stack">
              <span>Contact email</span>
              <input
                value={draft.contactEmail}
                onChange={(event) => setDraft((current) => ({ ...current, contactEmail: event.target.value }))}
              />
            </label>
          </div>
          {draft.status === "offer" ? (
            <label className="field-stack">
              <span>Offer response</span>
              <select
                value={draft.offerResponse}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, offerResponse: event.target.value as ApplicationDraft["offerResponse"] }))
                }
              >
                <option value="">Undecided</option>
                <option value="yes">Accepted</option>
                <option value="maybe">Considering</option>
                <option value="no">Declined</option>
              </select>
            </label>
          ) : null}
          <label className="field-stack">
            <span>Notes</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              rows={5}
            />
          </label>

          <div className="drawer-actions-vnext">
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" className="button-secondary" onClick={() => void handleDelete()} disabled={isSaving}>
              Delete application
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
