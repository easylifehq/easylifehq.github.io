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
  const currentPlace = [contact.currentCity, contact.region].filter(Boolean).join(" · ");
  const lastKnownIsDifferent = contact.lastKnownPlace && contact.lastKnownPlace !== contact.currentCity;
  const currentPlaceSafe = currentPlace ? [contact.currentCity, contact.region].filter(Boolean).join(" - ") : "";

  return (
    <span className={`contact-place-memory${compact ? " contact-place-memory-compact" : ""}`} aria-label="Place memory">
      {!compact ? <span className="contact-place-memory-label">Place memory</span> : null}
      <strong>{currentPlaceSafe || contact.lastKnownPlace || "No city or region saved"}</strong>
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
  const dueContacts = useMemo(
    () => filteredContacts.filter((contact) => isFollowUpNeeded(contact.nextFollowUpAt)).slice(0, 6),
    [filteredContacts]
  );
  const placeMemoryCount = useMemo(
    () => contacts.filter((contact) => contact.currentCity || contact.region || contact.lastKnownPlace).length,
    [contacts]
  );
  const movedRecentlyCount = useMemo(
    () => contacts.filter((contact) => contact.movedRecently).length,
    [contacts]
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
      <PageSection eyebrow="People + places" title="People memory" description="See who needs attention, where people are, and who might be near a place.">
        {error ? <p className="error-copy">{error}</p> : null}

        <div className="contacts-memory-overview" aria-label="People and place overview">
          <article className="contacts-memory-panel">
            <div className="contacts-memory-panel-top">
              <div>
                <p className="eyebrow">Needs attention</p>
                <h3>{dueContacts.length ? `${dueContacts.length} due now` : "Clear for now"}</h3>
              </div>
              <span className="chip-pill">{contacts.length}</span>
            </div>
            <div className="contacts-overview-list">
              {dueContacts.length ? dueContacts.slice(0, 3).map((contact) => (
                <button key={contact.id} type="button" className="contacts-place-person" onClick={() => setSelectedContact(contact)}>
                  <strong>{contact.fullName || "Unnamed contact"}</strong>
                  <span>{formatRelativeDate(contact.nextFollowUpAt)}</span>
                </button>
              )) : <p className="helper-copy">No one is overdue. Keep the list quiet.</p>}
            </div>
          </article>

          <article className="contacts-memory-panel">
            <div className="contacts-memory-panel-top">
              <div>
                <p className="eyebrow">Where people are</p>
                <h3>{placeMemoryCount} place labels</h3>
              </div>
              <span className="chip-pill">{movedRecentlyCount} moved</span>
            </div>
            <p className="helper-copy">Current city, region, last known place, and visit notes. No exact addresses.</p>
            <div className="contacts-place-mini-list">
              {peopleByPlace.slice(0, 3).map((group) => (
                <span key={group.place}>{group.place}: {group.contacts.length}</span>
              ))}
            </div>
          </article>

          <article className="contacts-memory-panel contacts-memory-panel-wide">
            <div className="contacts-memory-panel-top">
              <div>
                <p className="eyebrow">Visiting somewhere?</p>
                <h3>{placeReviewMatches.length ? `${placeReviewMatches.length} possible match${placeReviewMatches.length === 1 ? "" : "es"}` : "Saved labels only"}</h3>
              </div>
              <span className="chip-pill">Labels only</span>
            </div>
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
            <p className="helper-copy">Uses saved city, region, last known place, and visit notes. No map, geocoding, exact address, or device location.</p>
            <div className="contacts-overview-list">
              {placeReviewMatches.length ? placeReviewMatches.map((contact) => (
                <button key={contact.id} type="button" className="contacts-place-person" onClick={() => setSelectedContact(contact)}>
                  <strong>{contact.fullName || "Unnamed contact"}</strong>
                  <span>{getPlaceSummary(contact)}</span>
                </button>
              )) : <p className="helper-copy">No saved place label match yet.</p>}
            </div>
          </article>
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
            <span>Context</span>
            <input
              value={draft.company}
              onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))}
              placeholder="Friend, gym, class, work"
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
            Add person
          </button>
        </form>
      </PageSection>

      <PageSection
        eyebrow="Places"
        title="People by place"
        description="Review who you know near a city or region before a visit using saved place labels."
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
