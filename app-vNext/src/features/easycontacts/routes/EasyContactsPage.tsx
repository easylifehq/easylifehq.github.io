import { useMemo, useState } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { ContactDrawer } from "@/features/easycontacts/components/ContactDrawer";
import { useEasyContacts } from "@/features/easycontacts/EasyContactsContext";
import type { ContactDraft, ContactRecord } from "@/lib/firestore/contacts";

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

function isFollowUpNeeded(value: string) {
  if (!value) return false;
  return value <= new Date().toISOString().split("T")[0];
}

export function EasyContactsPage() {
  const { contacts, isLoading, error, addContact, saveContact, archiveCurrentContact } = useEasyContacts();
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;

    return contacts.filter((contact) =>
      [contact.fullName, contact.company, contact.role, contact.email, contact.relationship, contact.notes]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [contacts, search]);

  async function handleAddContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addContact(draft);
    setDraft(emptyDraft);
  }

  return (
    <>
      <PageSection eyebrow="Network" title="Contacts" description="Filter the people in your search, keep follow-ups visible, and separate relationship tracking from the application board.">
        {error ? <p className="error-copy">{error}</p> : null}

        <div className="stats-grid">
          <article className="stat-card-vnext"><span>Total contacts</span><strong>{contacts.length}</strong></article>
          <article className="stat-card-vnext"><span>Follow-ups due</span><strong>{contacts.filter((contact) => isFollowUpNeeded(contact.nextFollowUpAt)).length}</strong></article>
          <article className="stat-card-vnext"><span>Active this month</span><strong>{contacts.filter((contact) => Boolean(contact.lastContactedAt)).length}</strong></article>
          <article className="stat-card-vnext"><span>Companies</span><strong>{new Set(contacts.map((contact) => contact.company).filter(Boolean)).size}</strong></article>
        </div>
      </PageSection>

      <PageSection eyebrow="Add" title="Capture a contact" description="Keep it lightweight up front and edit deeper detail later.">
        <form className="task-composer" onSubmit={handleAddContact}>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Name</span>
              <input value={draft.fullName} onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))} required />
            </label>
            <label className="field-stack">
              <span>Relationship</span>
              <input value={draft.relationship} onChange={(event) => setDraft((current) => ({ ...current, relationship: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Company</span>
              <input value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} />
            </label>
            <label className="field-stack">
              <span>Role</span>
              <input value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} />
            </label>
            <label className="field-stack field-stack-wide">
              <span>Notes</span>
              <textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} rows={4} />
            </label>
          </div>
          <button type="submit" className="primary-button">Add contact</button>
        </form>
      </PageSection>

      <PageSection eyebrow="Browse" title="Your network" description="Tap a card to edit contact details or archive it.">
        <div className="toolbar-row">
          <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" />
        </div>

        {isLoading ? <p className="helper-copy">Loading contacts...</p> : null}

        <div className="contacts-grid-vnext">
          {filteredContacts.length ? filteredContacts.map((contact) => (
            <button key={contact.id} type="button" className="contact-card-vnext" onClick={() => setSelectedContact(contact)}>
              <div className="contact-card-top-vnext">
                <strong>{contact.fullName || "Unnamed contact"}</strong>
                <span className="chip-pill">{contact.status}</span>
              </div>
              <p>{contact.company || "No company"}{contact.role ? ` | ${contact.role}` : ""}</p>
              <p>{contact.relationship || "No relationship label yet"}</p>
            </button>
          )) : <div className="empty-card-vnext">No contacts match this filter yet.</div>}
        </div>
      </PageSection>

      <ContactDrawer
        contact={selectedContact}
        isOpen={Boolean(selectedContact)}
        onClose={() => setSelectedContact(null)}
        onSave={saveContact}
        onArchive={archiveCurrentContact}
      />
    </>
  );
}
