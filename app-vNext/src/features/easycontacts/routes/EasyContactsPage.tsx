import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { ContactDrawer } from "@/features/easycontacts/components/ContactDrawer";
import { useEasyContacts } from "@/features/easycontacts/EasyContactsContext";
import type { ContactDraft, ContactRecord } from "@/lib/firestore/contacts";

function isFollowUpNeeded(value: string) {
  if (!value) return false;
  return value <= new Date().toISOString().split("T")[0];
}

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

function formatRelativeDate(value: string) {
  if (!value) return "No follow-up set";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `In ${diffDays} days`;
}

export function EasyContactsPage() {
  const { contacts, isLoading, error, addContact, saveContact, archiveCurrentContact } = useEasyContacts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  const contactParam = searchParams.get("contact");
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
  const bubbleContacts = useMemo(() => filteredContacts.slice(0, 18), [filteredContacts]);
  const dueContacts = useMemo(
    () => filteredContacts.filter((contact) => isFollowUpNeeded(contact.nextFollowUpAt)).slice(0, 6),
    [filteredContacts]
  );
  const warmContacts = useMemo(
    () => filteredContacts.filter((contact) => contact.status === "warm" || contact.status === "active").slice(0, 6),
    [filteredContacts]
  );
  const recentContacts = useMemo(
    () =>
      [...filteredContacts]
        .sort((left, right) => (right.updatedAt?.getTime() || 0) - (left.updatedAt?.getTime() || 0))
        .slice(0, 8),
    [filteredContacts]
  );
  const activeThisMonth = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return contacts.filter((contact) => {
      if (!contact.lastContactedAt) return false;
      const contactDate = new Date(contact.lastContactedAt);
      return !Number.isNaN(contactDate.getTime()) && contactDate >= monthStart;
    }).length;
  }, [contacts]);

  useEffect(() => {
    if (!contactParam) return;
    const matchingContact = contacts.find((contact) => contact.id === contactParam);
    if (matchingContact) {
      setSelectedContact(matchingContact);
    }
  }, [contactParam, contacts]);

  function closeContactDrawer() {
    setSelectedContact(null);
    if (!contactParam) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("contact");
    setSearchParams(nextParams, { replace: true });
  }

  async function handleQuickAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.fullName.trim()) return;
    await addContact({
      ...draft,
      fullName: draft.fullName.trim(),
      relationship: draft.relationship.trim(),
      company: draft.company.trim(),
      role: draft.role.trim(),
      notes: draft.notes.trim(),
    });
    setDraft(emptyDraft);
  }

  return (
    <>
      <PageSection eyebrow="Network" title="Contacts" description="Keep follow-ups visible, capture people fast, and make your network feel like something you can actually maintain.">
        {error ? <p className="error-copy">{error}</p> : null}

        <div className="stats-grid">
          <article className="stat-card-vnext"><span>Total contacts</span><strong>{contacts.length}</strong></article>
          <article className="stat-card-vnext"><span>Follow-ups due</span><strong>{contacts.filter((contact) => isFollowUpNeeded(contact.nextFollowUpAt)).length}</strong></article>
          <article className="stat-card-vnext"><span>Active this month</span><strong>{activeThisMonth}</strong></article>
          <article className="stat-card-vnext"><span>Companies</span><strong>{new Set(contacts.map((contact) => contact.company).filter(Boolean)).size}</strong></article>
        </div>

        <form className="contacts-command-strip" onSubmit={handleQuickAdd}>
          <label className="field-stack">
            <span>Name</span>
            <input
              value={draft.fullName}
              onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Add a person"
              required
            />
          </label>
          <label className="field-stack">
            <span>Company or context</span>
            <input
              value={draft.company}
              onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))}
              placeholder="Google, gym, soccer, class"
            />
          </label>
          <label className="field-stack">
            <span>Relationship</span>
            <input
              value={draft.relationship}
              onChange={(event) => setDraft((current) => ({ ...current, relationship: event.target.value }))}
              placeholder="Recruiter, friend, mentor"
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
          <button type="submit" className="primary-button">
            Add contact
          </button>
        </form>

        <div className="contacts-focus-strip" aria-label="Contact focus">
          <span>{dueContacts.length ? `${dueContacts.length} follow-up${dueContacts.length === 1 ? "" : "s"} need attention` : "No follow-ups due right now"}</span>
          <span>{warmContacts.length ? `${warmContacts.length} warm relationships in play` : "No warm relationships yet"}</span>
          <span>{recentContacts.length ? `${recentContacts.length} recently touched contacts` : "No recent contact activity yet"}</span>
        </div>
      </PageSection>

      <PageSection eyebrow="Today" title="Relationship hub" description="Lead with who needs attention, keep warm people close, and let the full directory live below.">
        <div className="contacts-focus-grid">
          <article className="contacts-focus-panel">
            <div className="contacts-focus-panel-top">
              <div>
                <p className="eyebrow">Follow up</p>
                <h3>Due now</h3>
              </div>
              <span className="chip-pill">{dueContacts.length}</span>
            </div>
            <div className="contacts-focus-list">
              {dueContacts.length ? dueContacts.map((contact) => (
                <button key={contact.id} type="button" className="contact-row-card" onClick={() => setSelectedContact(contact)}>
                  <strong>{contact.fullName || "Unnamed contact"}</strong>
                  <span>{contact.company || contact.relationship || "Contact"}</span>
                  <small>{formatRelativeDate(contact.nextFollowUpAt)}</small>
                </button>
              )) : <div className="empty-card-vnext">Nothing overdue. Your network is caught up.</div>}
            </div>
          </article>

          <article className="contacts-focus-panel">
            <div className="contacts-focus-panel-top">
              <div>
                <p className="eyebrow">Keep warm</p>
                <h3>Active relationships</h3>
              </div>
              <span className="chip-pill">{warmContacts.length}</span>
            </div>
            <div className="contacts-focus-list">
              {warmContacts.length ? warmContacts.map((contact) => (
                <button key={contact.id} type="button" className="contact-row-card" onClick={() => setSelectedContact(contact)}>
                  <strong>{contact.fullName || "Unnamed contact"}</strong>
                  <span>{contact.company || contact.relationship || "Contact"}</span>
                  <small>{contact.role || contact.status}</small>
                </button>
              )) : <div className="empty-card-vnext">Add a few people you want to stay in touch with.</div>}
            </div>
          </article>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Browse"
        title="Contact map"
        description="A quick visual pass over your network when you want to remember who is in the mix."
      >
        <div className="contacts-bubble-map" role="list" aria-label="Contact map">
          {bubbleContacts.length ? (
            bubbleContacts.map((contact, index) => (
              <button
                key={contact.id}
                type="button"
                role="listitem"
                className={`contact-bubble contact-bubble-${(index % 5) + 1}`}
                onClick={() => setSelectedContact(contact)}
              >
                <strong>{contact.fullName || "Unnamed"}</strong>
                <span>{contact.company || contact.relationship || "Contact"}</span>
              </button>
            ))
          ) : (
            <div className="empty-card-vnext">No contacts to map yet.</div>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="Directory" title="Your network" description="Search, scan, and open any person when you want the full details.">
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
              <div className="contact-card-meta-row">
                <small>{formatRelativeDate(contact.nextFollowUpAt)}</small>
                <small>{contact.lastContactedAt ? `Last touch ${contact.lastContactedAt}` : "No contact logged yet"}</small>
              </div>
            </button>
          )) : <div className="empty-card-vnext">No contacts match this filter yet.</div>}
        </div>
      </PageSection>

      <ContactDrawer
        contact={selectedContact}
        isOpen={Boolean(selectedContact)}
        onClose={closeContactDrawer}
        onSave={saveContact}
        onArchive={archiveCurrentContact}
      />
    </>
  );
}
