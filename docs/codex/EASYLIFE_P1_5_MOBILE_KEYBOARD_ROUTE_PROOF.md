# EasyLife P1.5 Mobile, Keyboard, And Route Proof

Date: 2026-05-31

Scope: P1.5-06 audit carryover proof for mobile sticky actions, keyboard close behavior, focus return, canonical route recovery, `/app/easycalendar/day`, and invalid app-route fallback.

## Verdict

`P1_5_MOBILE_KEYBOARD_ROUTE_PROOF_READY`

This is a proof update, not a feature expansion. No live AI, true push notifications, calendar sync, geocoding, email/text sending, account deletion backend, external sync, hidden writes, package changes, deploy changes, or Firebase/auth/rules/functions/billing/DNS/secrets/env changes were added.

## Proof Checks

### Mobile Sticky Actions

- Source checked: `app-vNext/src/styles/globals.css`.
- Mobile rules keep drawer actions, Plan preview/apply actions, Inbox composer actions, and Workout log actions sticky near the bottom with `env(safe-area-inset-bottom, 0px)`.
- Mobile content receives bottom breathing room where sticky actions could otherwise overlap final form controls, including contacts command strip and Settings mobile layout padding.
- Buttons inside sticky action groups stretch to full width on narrow screens.

### Keyboard Close And Focus

- Source checked: `app-vNext/src/lib/a11y/useFocusTrap.ts`, `ProductsMenu.tsx`, `UniversalCapture.tsx`, `TaskDrawer.tsx`, `CalendarTaskBlockDrawer.tsx`, `CalendarEventDrawer.tsx`, `ContactDrawer.tsx`, `ApplicationDrawer.tsx`, and `EasyCalendarDayPage.tsx`.
- Drawer/sheet close controls are native `button` elements, so Enter and Space activation follows browser button behavior.
- App menu and Quick Capture pass explicit `returnFocusRef` values.
- Drawers and Plan quick-create preserve focus using `useFocusTrap`; when no explicit return target is passed, the hook returns focus to the previously active element if it still exists.
- Escape closes the app menu, Quick Capture, drawers, and Plan quick-create panels through the shared focus-trap path.

### Route Recovery

- Source checked: `app-vNext/src/app/router/index.tsx`.
- Demo aliases preserve query strings:
  - `/app/today` -> `/app/hq`
  - `/app/inbox` -> `/app/easylist/add`
  - `/app/notes` -> `/app/easynotes`
  - `/app/people` -> `/app/easycontacts`
- `/app/plan` and `/app/workout` render safe landing states with clear next actions instead of blank shells.
- Unknown `/app/*` routes render the route-safety fallback with `Return to Today`, `Open Inbox`, and copy that says nothing was changed or saved.

### Plan Day Loading

- Source checked: `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx`.
- `/app/easycalendar/day` is the canonical working Plan day route.
- The day page shows inline `Loading today...` while calendar data is loading, preserving the surrounding page structure instead of a blank or dead-end state.
- Day navigation uses native buttons and route navigation with explicit dates.

## Build Proof

Passed with `npm.cmd run build` from `app-vNext` on 2026-05-31.
