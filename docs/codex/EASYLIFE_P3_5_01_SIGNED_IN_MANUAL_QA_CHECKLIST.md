# EasyLife P3.5-01 Signed-In Manual QA Checklist

Date: 2026-05-31

Status: P3_5_01_COMPLETE

## Purpose

This checklist is for Spencer's authenticated browser session. It covers the demo path that headless signed-out preview cannot fully prove: Today -> Notes -> Inbox -> Plan -> People -> Workout -> Settings.

Use this as a fast pass/fail run before showing EasyLife. The goal is confidence, not exhaustive QA.

## Setup

- Use the normal signed-in EasyLife browser session.
- Start at `/app/hq?demo=1`.
- Use desktop first, then repeat the screenshot set on a phone-width viewport or the actual phone if available.
- Do not deploy.
- Do not enable live AI, true push, calendar sync, geocoding/maps, email/text sending, contact import/sync, account deletion backend, token storage, automatic scheduling, or external actions.

## Screenshot Set

Capture these screenshots and keep the filenames simple:

- `01-today-demo-path.png` - Today top section and `Demo path`.
- `02-notes-write-first.png` - Notes editor or new-note writing surface.
- `03-inbox-capture-saved.png` - Inbox after adding or reviewing a safe test item.
- `04-plan-safe-edit.png` - Plan day with a block/event editor visible or just after save.
- `05-people-manual-context.png` - People manual label/context area.
- `06-workout-quick-entry.png` - Workout log with set inputs visible.
- `07-settings-trust-privacy.png` - Settings Trust & Privacy and capability boundary copy.
- `08-mobile-today.png` - Phone-width Today.
- `09-mobile-drawer-or-form-actions.png` - Phone-width drawer/form with bottom actions visible.

## Demo Script

1. Open Today.
   - Route: `/app/hq?demo=1`
   - Expected: Today loads without a blank screen or dead end.
   - Expected: `Demo path` or the calm assistant loop is visible.
   - Expected: The story reads as one assistant path, not a bundle of separate apps.
   - Screenshot: `01-today-demo-path.png`
   - Fail if: Today blanks, signs out unexpectedly, strands you without navigation, or claims live AI/sync/sending.

2. Open Notes.
   - Route/action: use the Today demo path Notes link, or open `/app/easynotes?demo=1`.
   - Expected: Writing is the obvious first action.
   - Expected: Save state is visible when writing or editing.
   - Expected: Browser-only recovery copy does not imply sync, AI, export, or hidden writes.
   - Screenshot: `02-notes-write-first.png`
   - Fail if: New note creates duplicate blank notes rapidly, writing has no save/recovery feedback, or recovery copy overclaims.

3. Open Inbox.
   - Route/action: use the Today demo path Inbox link, or open `/app/easylist/add?demo=1`.
   - Expected: Quick capture starts with the task text.
   - Expected: Empty submit is disabled.
   - Expected: Saved feedback appears after a safe test capture.
   - Expected: Provider/assistant copy stays review-first and no-live-AI.
   - Screenshot: `03-inbox-capture-saved.png`
   - Fail if: capture loses a draft on navigation, saves without clear feedback, or implies a model/provider call ran.

4. Open Plan.
   - Route/action: use the Today demo path Plan link, or open `/app/easycalendar/day?demo=1`.
   - Expected: Plan day loads without a route dead end.
   - Expected: Time entry explains 15-minute rounding and same-day limits where relevant.
   - Expected: Editing a block/event preserves a safe duration and does not jump the page badly after save.
   - Screenshot: `04-plan-safe-edit.png`
   - Fail if: `/app/plan` or Plan day strands you, typed time behaves unpredictably, or copy implies external calendar sync.

5. Open People.
   - Route/action: open `/app/people?demo=1` or the visible People route.
   - Expected: People loads as manual context.
   - Expected: Place labels are clearly manual labels only.
   - Expected: Follow-up information is visible when present and does not imply email/text/calendar automation.
   - Screenshot: `05-people-manual-context.png`
   - Fail if: People implies live location, maps, geocoding, contact import/sync, automatic follow-up sending, or calendar writes.

6. Open Workout.
   - Route/action: open `/app/workout?demo=1`, then use the safe landing to dashboard/log if needed.
   - Expected: `/app/workout` is a safe landing, not a blank route.
   - Expected: Workout set inputs are easy to type in quickly.
   - Expected: Remove set/delete actions are visually separated from Finish/Done actions, with undo-before-save where applicable.
   - Screenshot: `06-workout-quick-entry.png`
   - Fail if: set inputs duplicate unexpectedly, deletion is too close to finish actions, or the route strands you.

7. Open Settings.
   - Route/action: open `/app/settings?demo=1` or `/settings?demo=1`.
   - Expected: Trust & Privacy is easy to find.
   - Expected: Copy states that live AI/provider calls, true push, calendar sync, geocoding/maps, email/text sending, contact import/sync, account deletion backend, hidden writes, token storage, automatic scheduling, and external actions are not live unless separately approved.
   - Expected: There is one obvious sign-out action.
   - Screenshot: `07-settings-trust-privacy.png`
   - Fail if: Settings copy makes a live-capability promise, shows duplicate logout confusion, or exposes a dangerous action as live.

## Mobile And Keyboard Pass

Run this after the desktop pass:

- Set the browser to a phone-width viewport or use the phone.
- Re-open `/app/hq?demo=1`.
- Confirm the Today top section is readable and not crowded.
- Open one drawer or long form, preferably Plan, Inbox, or Workout.
- Confirm final actions stay reachable above the safe area.
- Tab through one modal/drawer on desktop and confirm focus stays inside until close.
- Press Escape on a drawer/menu and confirm it closes and returns focus to the trigger.
- Screenshots: `08-mobile-today.png`, `09-mobile-drawer-or-form-actions.png`

Fail if: a primary button is hidden behind the browser chrome, a drawer cannot be closed with keyboard, focus disappears, or text overlaps important controls.

## Trust Boundary Pass

During the route pass, explicitly look for these claims. The correct answer is "not live" or "review-first":

- Live AI/provider calls.
- True push/server push.
- Calendar sync or outside calendar read/write.
- Geocoding/maps/live location/exact address lookup.
- Email/text sending or outside draft creation.
- Contact import/sync.
- Account deletion backend.
- Hidden writes, token storage, automatic scheduling, or external actions.

Fail if any visible demo copy says or strongly implies those capabilities are active.

## Pass Criteria

The signed-in demo is passable when:

- All seven core surfaces load without blank screens or dead ends.
- Today -> Notes -> Inbox -> Plan -> People -> Workout -> Settings feels coherent as one assistant loop.
- The screenshot set is captured.
- No route claims a capability that is not live.
- No core input flow loses obvious user work during the short demo path.
- Mobile and keyboard checks reveal no demo-blocking reachability/focus issue.

## Result

Checklist prepared for Spencer-run signed-in QA. No app code changed in this task.

