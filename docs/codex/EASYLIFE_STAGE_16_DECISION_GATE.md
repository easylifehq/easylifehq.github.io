# EasyLife Stage 16 - People + Places Memory

Stage 16 is approved as People + Places Memory.

## Mission

Upgrade EasyContacts from a generic contact surface into assistant people/place memory: who lives where, who moved, and who to remember when visiting a place.

## Source Plan

- `docs/codex/EASYLIFE_PEOPLE_PLACES_MEMORY_PLAN.md`

## Stage 16 Scope

Stage 16 may work only on privacy-light EasyContacts people/place memory.

Allowed first-version place fields:

- current city
- region
- last known place
- moved recently
- visit note

Do not require exact street addresses.

## Owned Product Surfaces

- `app-vNext/src/features/easycontacts/EasyContactsContext.tsx`
- `app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx`
- `app-vNext/src/features/easycontacts/components/ContactDrawer.tsx`
- `app-vNext/src/features/easycontacts/layouts/EasyContactsLayout.tsx`
- `app-vNext/src/styles/globals.css`

## Hard Boundaries

- No exact street address requirement.
- No real map API.
- No geocoding.
- No device location.
- No background enrichment from contacts, email, calendar, or location.
- No backend changes.
- No auth changes.
- No Firebase rules/config changes.
- No dependencies.
- No package file changes.
- No deploy config changes.
- No generated output.
- No secrets.
- No real personal data in fixtures or docs.

## Stage 16 Task Packet

`docs/codex/NEXT_5_TASKS.md` contains exactly five Stage 16 Task Contract V2 tasks:

1. Contact place memory fields.
2. Place memory block on contact detail/list.
3. People by Place grouped view.
4. Visiting somewhere prompt.
5. People + Places proof packet.

## Done Signal

Stage 16 is done only after a proof packet says People + Places Memory is useful, personal, not CRM-like, privacy-light, and ready for human review.

## Stage 17

The broader decision gate has moved to `docs/codex/EASYLIFE_STAGE_17_DECISION_GATE.md`.
