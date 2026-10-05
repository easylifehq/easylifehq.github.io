# Easy Workout legacy contract hardening — normal Codex repair

- Start: 2026-10-04T17:30:28.3726009-06:00
- End: 2026-10-04T17:43:05.2538119-06:00
- Wall time: approximately 12 minutes 37 seconds
- Model/API usage telemetry: not exposed for the active normal-Codex session; no additional Claude/model subprocess was launched.
- Escalation reason: independent review rejected the Claude candidate after its single correction allowance was spent. The owner explicitly requested a bounded normal-Codex repair rather than another Claude turn or managed-Orca Codex worker.

## Bounded repair

- Added failing tests first for year 0099, label-only weeks, empty-set warnings, coded/bounded JSON errors, dropped-field warnings, duplicate hashes, bodyweight omitted/null load, mixed-precision source ordering, and reviewed alias mappings.
- Preserved raw `sourceName` verbatim. Added optional owner-reviewed `seriesKey`/`seriesLabel`; equipment and load convention remain hard grouping boundaries.
- Updated the read-only panel to show reviewed labels/source headings and render missing bodyweight load as `Not recorded`, never zero.
- Updated the extractor contract with full field constraints.
- Added 390px and desktop assertions to the existing synthetic browser journey.

## Verification

- Initial focused RED: missing parser export plus trend/mapping/order/bodyweight failures.
- Focused GREEN: 34/34.
- Full unit suite: 241/241.
- Typecheck: passed.
- Production build: passed, 229 modules transformed.
- Browser: first run 4/6 due to assertion scope; assertion-only repair; final run 6/6 at 390x844 and 1280x800 with no horizontal overflow.

No persistence, Firestore/rules, real-account write, deployment, commit or merge occurred.
