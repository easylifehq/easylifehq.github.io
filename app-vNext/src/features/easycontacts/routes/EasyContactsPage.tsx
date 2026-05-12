import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { ContactDrawer } from "@/features/easycontacts/components/ContactDrawer";
import { useEasyContacts, type EasyContactRecord } from "@/features/easycontacts/EasyContactsContext";
import type { ContactDraft } from "@/lib/firestore/contacts";

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

function getPlaceSummary(contact: EasyContactRecord) {
  const place = contact.currentCity || contact.region || contact.lastKnownPlace;
  if (!place) return "Place memory not set";
  if (contact.movedRecently && contact.lastKnownPlace) {
    return `${place} now; last known ${contact.lastKnownPlace}`;
  }
  return place;
}

function PlaceMemoryBlock({ contact, compact = false }: { contact: EasyContactRecord; compact?: boolean }) {
  const currentPlace = [contact.currentCity, contact.region].filter(Boolean).join(" / ");
  const lastKnownIsDifferent = contact.lastKnownPlace && contact.lastKnownPlace !== contact.currentCity;

  return (
    <span className={`contact-place-memory${compact ? " contact-place-memory-compact" : ""}`} aria-label="Place memory">
      <span className="contact-place-memory-label">Place memory</span>
      <strong>{currentPlace || contact.lastKnownPlace || "No city or region saved"}</strong>
      {contact.movedRecently && contact.lastKnownPlace ? <small>Moved recently from {contact.lastKnownPlace}</small> : null}
      {!contact.movedRecently && lastKnownIsDifferent ? <small>Last known near {contact.lastKnownPlace}</small> : null}
      {contact.visitNote ? <small>Visit note: {contact.visitNote}</small> : null}
      {!compact ? <small>No exact address needed.</small> : null}
    </span>
  );
}

export function EasyContactsPage() {
  const { contacts, isLoading, error, addContact, saveContact, archiveCurrentContact } = useEasyContacts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [placeReviewQuery, setPlaceReviewQuery] = useState("Portland, OR");
  const [selectedContact, setSelectedContact] = useState<EasyContactRecord | null>(null);
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  const contactParam = searchParams.get("contact");
  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;

    return contacts.filter((contact) =>
      [
        contact.fullName,
        contact.company,
        contact.role,
        contact.email,
        contact.relationship,
        contact.notes,
        contact.currentCity,
        contact.region,
        contact.lastKnownPlace,
        contact.visitNote,
      ]
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
  const peopleByPlace = useMemo(() => {
    const groups = new Map<string, EasyContactRecord[]>();

    filteredContacts.forEach((contact) => {
      const place = contact.currentCity || contact.region || (contact.movedRecently ? contact.lastKnownPlace : "") || "Needs place update";
      groups.set(place, [...(groups.get(place) || []), contact]);
    });

    return [...groups.entries()]
      .map(([place, groupContacts]) => ({ place, contacts: groupContacts }))
      .sort((left, right) => {
        if (left.place === "Needs place update") return 1;
        if (right.place === "Needs place update") return -1;
        return left.place.localeCompare(right.place);
      });
  }, [filteredContacts]);
  const placeReviewMatches = useMemo(() => {
    const query = placeReviewQuery.trim().toLowerCase();
    if (!query) return [];

    return filteredContacts
      .filter((contact) =>
        [contact.currentCity, contact.region, contact.lastKnownPlace, contact.visitNote]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 3);
  }, [filteredContacts, placeReviewQuery]);
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
      <PageSection eyebrow="People memory" title="Contacts" description="Keep people close, remember where they are, and know who to check in with when a place comes up.">
        {error ? <p className="error-copy">{error}</p> : null}

        <div className="stats-grid">
          <article className="stat-card-vnext"><span>Total contacts</span><strong>{contacts.length}</strong></article>
          <article className="stat-card-vnext"><span>Follow-ups due</span><strong>{contacts.filter((contact) => isFollowUpNeeded(contact.nextFollowUpAt)).length}</strong></article>
          <article className="stat-card-vnext"><span>Active this month</span><strong>{activeThisMonth}</strong></article>
          <article className="stat-card-vnext"><span>Companies</span><strong>{new Set(contacts.map((contact) => contact.company).filter(Boolean)).size}</strong></article>
        </div>

        <div className="contacts-focus-strip" aria-label="People and place memory">
          <span>{contacts.filter((contact) => contact.currentCity || contact.region).length} with place memory</span>
          <span>{contacts.filter((contact) => contact.movedRecently).length} moved recently</span>
          <span>No exact addresses required</span>
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
          <span>{warmContacts.length ? `${warmContacts.length} people to keep close` : "No warm people yet"}</span>
          <span>{recentContacts.length ? `${recentContacts.length} recently touched contacts` : "No recent contact activity yet"}</span>
        </div>
      </PageSection>

      <PageSection eyebrow="Today" title="People to check on" description="Lead with who needs attention, remember where people are, and keep the larger list below.">
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
                  <PlaceMemoryBlock contact={contact} compact />
                  <small>{formatRelativeDate(contact.nextFollowUpAt)}</small>
                </button>
              )) : <div className="empty-card-vnext">Nothing overdue. Your people list is caught up.</div>}
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
                  <PlaceMemoryBlock contact={contact} compact />
                  <small>{contact.role || contact.status}</small>
                </button>
              )) : <div className="empty-card-vnext">Add a few people you want to stay in touch with.</div>}
            </div>
          </article>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Assistant prompt"
        title="Visiting somewhere?"
        description="Ask who you know near a place using saved freeform labels only. No live location, map, or geocoding."
      >
        <div className="contacts-place-prompt" aria-label="Who do I know near this place">
          <div className="contacts-place-prompt-main">
            <label className="field-stack">
              <span>Place to review</span>
              <input
                value={placeReviewQuery}
                onChange={(event) => setPlaceReviewQuery(event.target.value)}
                placeholder="Try Portland, Denver, or Pacific Northwest"
              />
            </label>
            <div className="contacts-place-prompt-chips" aria-label="Example place prompts">
              {["Portland, OR", "Denver, CO", "Pacific Northwest"].map((place) => (
                <button key={place} type="button" className="ghost-button" onClick={() => setPlaceReviewQuery(place)}>
                  {place}
                </button>
              ))}
            </div>
          </div>
          <div className="contacts-place-prompt-result">
            <p className="eyebrow">Saved labels only</p>
            <strong>{placeReviewMatches.length ? `${placeReviewMatches.length} possible ${placeReviewMatches.length === 1 ? "person" : "people"} near ${placeReviewQuery}` : "No saved place label match yet"}</strong>
            <span>This checks current city, region, last known place, and visit notes. It does not use exact addresses or device location.</span>
            <div className="contacts-place-prompt-list">
              {placeReviewMatches.map((contact) => (
                <button key={contact.id} type="button" className="contacts-place-person" onClick={() => setSelectedContact(contact)}>
                  <strong>{contact.fullName || "Unnamed contact"}</strong>
                  <span>{getPlaceSummary(contact)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Places"
        title="People by place"
        description="Review who you know near a city or region before a visit. Map view stays future-only."
      >
        <div className="contacts-place-groups" aria-label="People grouped by place">
          {peopleByPlace.length ? peopleByPlace.map((group) => (
            <article key={group.place} className="contacts-place-group">
              <div className="contacts-place-group-top">
                <div>
                  <p className="eyebrow">{group.place === "Needs place update" ? "Place unknown" : "City or region"}</p>
                  <h3>{group.place}</h3>
                </div>
                <span className="chip-pill">{group.contacts.length}</span>
              </div>
              <div className="contacts-place-people">
                {group.contacts.map((contact) => (
                  <button key={contact.id} type="button" className="contacts-place-person" onClick={() => setSelectedContact(contact)}>
                    <strong>{contact.fullName || "Unnamed contact"}</strong>
                    <span>{contact.visitNote || getPlaceSummary(contact)}</span>
                    {contact.movedRecently ? <small>Moved recently</small> : null}
                  </button>
                ))}
              </div>
            </article>
          )) : <div className="empty-card-vnext">No place memory to group yet.</div>}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Browse"
        title="Future map preview"
        description="A light place-label preview for now. This is not a live map, geocoded view, or exact-address tool."
      >
        <div className="contacts-bubble-map" role="list" aria-label="Future people place map preview">
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
                <span>{getPlaceSummary(contact)}</span>
              </button>
            ))
          ) : (
            <div className="empty-card-vnext">No contacts to map yet.</div>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="People" title="People you know" description="Search, scan, and open anyone when you want the fuller memory card.">
        <div className="toolbar-row">
          <input className="search-input" aria-label="Search contacts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" />
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
              <PlaceMemoryBlock contact={contact} />
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
