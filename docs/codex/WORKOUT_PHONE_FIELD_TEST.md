# Workout Phone Field Test

STATUS: EMULATED_PHONE_PASS_PHYSICAL_PHONE_PENDING

## Browser evidence completed

The production bundle was served locally and exercised at a 390 x 844 phone viewport. The test used the deterministic `weekend-14-week-v1` demo fixture, which is synthetic and performs no Firebase writes.

- Launch from Workout dashboard: PASS. Start/resume, Routines, and Workout progress are visible without horizontal overflow.
- Routine start: PASS. The selected Upper routine loads Bench Press plus its collapsed companion exercises.
- Local autosave: PASS. The announced state advances from saving to `Saved on this device`.
- Set type: PASS. Set 1 was changed to Warm-up.
- Set removal and undo: PASS. Set 3 was removed and restored before save.
- Copy previous set: PASS. A fourth working set was created from the preceding set.
- Route away/back: PASS. Session notes, weights, active exercise, and sets restored exactly.
- Offline final save: PASS. Chrome DevTools Protocol network emulation produced `Couldn't sync—draft retained`; the page remained editable and the Save action remained available.
- Reconnect and retry: PASS. One in-memory demo session was created and the draft cleared only after its ID was confirmed.
- Post-workout review: PASS. Duration, compatible working sets, weighted workload, muscles trained, exact records, and one transparent next observation rendered.
- Reload safety: PASS for deterministic fixture sessions and demo-added sessions in the same browser tab; demo additions use session storage only.
- Low-data state: PASS. An unknown exercise route renders `Not enough data yet` without fabricated trends.
- Browser console: PASS in a fresh production-preview tab; zero warnings/errors.

## Physical-device checklist still required

1. Install or open the production PWA on an actual phone.
2. Start a routine, lock the screen for at least two minutes, background the app, and return.
3. Switch apps during an active workout and verify the draft, timer, notes, and active exercise.
4. Disable connectivity, attempt final save, reconnect, and retry.
5. Confirm touch ergonomics with one hand and system text scaling.
6. Record OS/browser/PWA installation state and any service-worker update behavior.

Physical phone evidence is a release gate and was not available in this Codex environment; no claim of a physical-device pass is made.
