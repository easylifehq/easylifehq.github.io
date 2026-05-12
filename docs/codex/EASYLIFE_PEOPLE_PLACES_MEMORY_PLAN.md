# EasyLife People + Places Memory Plan

This is the approved Stage 16 direction for EasyContacts. Implementation must still follow the bounded task packet in `docs/codex/NEXT_5_TASKS.md`.

## Mission

Help EasyLife remember where people live or are moving so the user can answer:

- Who do I know near this place?
- Where did this friend move?
- Who should I check in with when I visit a city?
- Which friendships need a location update?

Frame this as assistant people/place memory, not a generic CRM.

## User Pain

Friends move, lives spread out, and remembering who lives where becomes emotionally useful but hard to keep in your head. EasyLife should help preserve that context without turning people into sales records or requiring exact addresses.

## Safe Field Ideas

Start with privacy-light, user-entered fields:

- `currentCity`: freeform city or area, such as `Portland, OR`
- `region`: broader area, such as `Pacific Northwest`
- `lastKnownPlace`: useful when a person may have moved
- `movedRecently`: simple yes/no or note-style flag
- `moveNote`: short context, such as `Moved after graduation`
- `visitNote`: reminder like `Check in next time I am in Denver`
- `placeUpdatedAt`: when the user last reviewed the place

Do not require exact street addresses. Exact addresses should remain optional and out of the first version unless separately approved with stronger privacy rules.

## First Useful Surfaces

- Contact detail: show a quiet `Place memory` block with current city/region, last known place, and visit note.
- People by place: grouped list of people by city/region.
- Visiting prompt: a local/static review surface for `People near this place`.
- Move review: a small queue of contacts marked `moved recently` or `place unknown`.

## Optional Future Map View

A map view may be useful later, but it is not part of the first plan.

Map view must stay optional until the project explicitly approves:

- map API provider
- geocoding rules
- privacy handling
- billing/secrets handling
- whether exact coordinates are stored

The first version can use freeform place labels and grouped lists without maps or geocoding.

## Guardrails

- No real map API.
- No geocoding.
- No backend changes.
- No auth changes.
- No Firebase rules/config changes.
- No dependencies or package file changes.
- No deploy config changes.
- No generated output.
- No secrets.
- No real personal data in fixtures or docs.
- No exact address requirement.
- No automatic location inference.
- No background enrichment from contacts, email, calendar, or device location.

## Stage 16 Fit

This is now Stage 16 because the user explicitly chose People + Places as the next useful behavior.

Continue this direction while review notes say:

- EasyLife should remember people better.
- EasyContacts feels too generic or hidden under More.
- The user wants a practical reason to return to the app before adding external AI.
- A privacy-light place memory system feels more valuable than visual polish.

Pause or redirect this direction if review says:

- Today/Inbox/Notes still feel untrustworthy.
- The saved task/note loop is confusing.
- The product needs visual trust polish first.
- The feature would require exact addresses, map APIs, geocoding, or backend/schema work immediately.

## Evidence Needed Before Implementation

- Human review notes approving People + Places as the next direction.
- A bounded Stage 16 task packet with exact EasyContacts files.
- A privacy decision on whether place fields are freeform only.
- A proof plan that uses fictional contacts and fictional places only.
- Confirmation that the first implementation does not add maps, geocoding, dependencies, backend changes, or exact address requirements.

## First Implementation Shape Later

If approved later, begin with one narrow local UI slice:

- Add visible place-memory copy and static/fixture-backed fields in EasyContacts.
- Show people grouped by current city/region using existing local data shape only if available.
- Keep map view as future.
- Keep exact addresses out of scope.

Stage 16 has been chosen. Use the five-task packet in `docs/codex/NEXT_5_TASKS.md` before implementation.
