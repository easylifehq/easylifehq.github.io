# EasyLife physical PWA field test

Candidate: `codex/easylife-production-candidate-wave-8-20260803`
Generated-output commit: `af89fe0acd6c25edb276704c3951c0294fe511fd`
Inventory SHA-256: `BF3887E03E988D1E6663BBB50D1F7A2DA0DAA5B287FBADBE05A8B934ED8046A8`

Status: pending on both physical platforms. Desktop emulation is evidence, not a substitute.

## Preconditions

- [ ] Draft deployment PR head and inventory hash match this record.
- [ ] Hosted checks are green.
- [ ] Test operator understands that no real user data should be entered.
- [ ] Dedicated synthetic/test identity is approved if authentication testing is included.
- [ ] Existing production PWA data is not cleared without the device owner's explicit permission.

## iPhone / iOS

Device/model: ____________________  iOS: ____________________  Safari: ____________________  Tester: ____________________

- [ ] Open the production candidate URL after approved publication or an approved device-accessible staging endpoint.
- [ ] Add to Home Screen; icon, name, safe areas, and launch display correctly.
- [ ] Landing, login, Today, Capture, My Week, Plan, Workout, Progress, and Settings fit without horizontal scrolling.
- [ ] Text inputs remain visible above the software keyboard; focus order and labels are understandable.
- [ ] Create a synthetic workout draft, background the PWA, return, and confirm draft recovery.
- [ ] Complete and save a synthetic workout only in an approved test account; confirm one session and no duplicate after retry.
- [ ] Confirm Workout Progress low-data and populated states, accessible tables, and source links.
- [ ] Confirm focused Review progress survives navigation and relaunch.
- [ ] Confirm whole-account export is explicitly initiated and does not upload data.
- [ ] Turn connectivity off, reload a previously visited app route, and confirm the offline shell; restore connectivity and confirm recovery.
- [ ] Install/update from a prior build if available; confirm the current service worker converges without trapping stale assets.
- [ ] Inspect for clipped controls, inaccessible dialogs, unexpected permission prompts, console/network failures available through device tooling, or production writes outside the approved test identity.

Result: [ ] pass  [ ] fail  [ ] blocked
Notes/evidence paths: ______________________________________________________________________

## Android

Device/model: ____________________  Android: ____________________  Chrome: ____________________  Tester: ____________________

- [ ] Install the PWA; icon, name, status/navigation bars, and launch display correctly.
- [ ] Landing, login, Today, Capture, My Week, Plan, Workout, Progress, and Settings fit without horizontal scrolling.
- [ ] Text inputs remain visible above the software keyboard; focus order and labels are understandable.
- [ ] Create a synthetic workout draft, background/terminate the PWA, return, and confirm recovery.
- [ ] Complete and save a synthetic workout only in an approved test account; confirm one session and no duplicate after retry.
- [ ] Confirm Workout Progress low-data and populated states, accessible tables, and source links.
- [ ] Confirm focused Review progress survives navigation and relaunch.
- [ ] Confirm whole-account export is explicitly initiated and does not upload data.
- [ ] Turn connectivity off, reload a previously visited app route, and confirm the offline shell; restore connectivity and confirm recovery.
- [ ] Install/update from a prior build if available; confirm the current service worker converges without trapping stale assets.
- [ ] Inspect for clipped controls, inaccessible dialogs, unexpected permission prompts, console/network failures available through remote debugging, or production writes outside the approved test identity.

Result: [ ] pass  [ ] fail  [ ] blocked
Notes/evidence paths: ______________________________________________________________________

## Sign-off

- iPhone result accepted by: ____________________  Date/time: ____________________
- Android result accepted by: ____________________  Date/time: ____________________
- Release owner: ____________________  Date/time: ____________________

Until both platform results and release-owner acceptance are recorded, deployment approval remains blocked.
