import { useMemo, useState } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { ContactDrawer } from "@/features/easycontacts/components/ContactDrawer";
import { useEasyContacts } from "@/features/easycontacts/EasyContactsContext";
import type { ContactRecord } from "@/lib/firestore/contacts";

function isFollowUpNeeded(value: string) {
  if (!value) return false;
  return value <= new Date().toISOString().split("T")[0];
}

export function EasyContactsPage() {
  const { contacts, isLoading, error, saveContact, archiveCurrentContact } = useEasyContacts();
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
  const bubbleContacts = useMemo(() => filteredContacts.slice(0, 18), [filteredContacts]);

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

      <PageSection
        eyebrow="View"
        title="Contact map"
        description="A quick bubble view so you can scan the people in your network without opening every card."
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
