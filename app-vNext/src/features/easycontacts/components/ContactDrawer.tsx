import { useEffect, useMemo, useState } from "react";
import type { ContactDraft, ContactRecord } from "@/lib/firestore/contacts";

type ContactDrawerProps = {
  contact: ContactRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactId: string, draft: ContactDraft) => Promise<void>;
  onArchive: (contactId: string) => Promise<void>;
};

const emptyDraft: ContactDraft = {
  fullName: "",
  relationship: "",
  company: "",
  role: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  source: "",
  status: "active",
  relatedOpportunityIds: [],
  lastContactedAt: "",
  nextFollowUpAt: "",
  notes: "",
  archived: false,
};

function toDraft(contact: ContactRecord): ContactDraft {
  return {
    fullName: contact.fullName,
    relationship: contact.relationship,
    company: contact.company,
    role: contact.role,
    email: contact.email,
    phone: contact.phone,
    linkedinUrl: contact.linkedinUrl,
    source: contact.source,
    status: contact.status,
    relatedOpportunityIds: contact.relatedOpportunityIds,
    lastContactedAt: contact.lastContactedAt,
    nextFollowUpAt: contact.nextFollowUpAt,
    notes: contact.notes,
    archived: contact.archived,
  };
}

export function ContactDrawer({ contact, isOpen, onClose, onSave, onArchive }: ContactDrawerProps) {
  const initialDraft = useMemo(
    () => (contact ? toDraft(contact) : emptyDraft),
    [contact]
  );
  const [draft, setDraft] = useState<ContactDraft>(initialDraft);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  if (!contact) return null;
  const currentContact = contact;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(currentContact.id, draft);
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
            <p className="eyebrow">EasyContacts</p>
            <h2>{currentContact.fullName || "Edit contact"}</h2>
          </div>
          <button type="button" className="button-secondary" onClick={onClose} aria-label="Close contact editor">
            Close
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <label className="field-stack">
            <span>Name</span>
            <input
              value={draft.fullName}
              onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
          </label>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Relationship</span>
              <input
                value={draft.relationship}
                onChange={(event) => setDraft((current) => ({ ...current, relationship: event.target.value }))}
              />
            </label>
            <label className="field-stack">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ContactDraft["status"] }))}
              >
                <option value="active">Active</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </label>
          </div>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Company</span>
              <input
                value={draft.company}
                onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))}
              />
            </label>
            <label className="field-stack">
              <span>Role</span>
              <input
                value={draft.role}
                onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))}
              />
            </label>
          </div>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Email</span>
              <input
                value={draft.email}
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="field-stack">
              <span>Phone</span>
              <input
                value={draft.phone}
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </div>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Last contacted</span>
              <input
                type="date"
                value={draft.lastContactedAt}
                onChange={(event) => setDraft((current) => ({ ...current, lastContactedAt: event.target.value }))}
              />
            </label>
            <label className="field-stack">
              <span>Next follow-up</span>
              <input
                type="date"
                value={draft.nextFollowUpAt}
                onChange={(event) => setDraft((current) => ({ ...current, nextFollowUpAt: event.target.value }))}
              />
            </label>
          </div>
          <label className="field-stack">
            <span>Notes</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              rows={5}
            />
          </label>
          <div className="drawer-actions-vnext">
            <button type="submit" className="primary-button">
              Save changes
            </button>
            <button type="button" className="button-secondary" onClick={() => void onArchive(currentContact.id).then(onClose)}>
              Archive contact
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
