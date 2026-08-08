# Remaining gates

The production candidate is not deployment-approved.

- physical iPhone installed-PWA result: pending;
- physical Android installed-PWA result: pending;
- explicit Pages approval: pending;
- explicit Firebase approval: pending;
- provider operator custom-claim verification: pending;
- proposed rollback SHA human approval: pending;
- deployment window and named operator: pending;
- hosted draft-PR checks: 4/4 green at candidate commit `18b5d085` ([complete verification](https://github.com/easylifehq/easylifehq.github.io/actions/runs/30865032866), [release checks](https://github.com/easylifehq/easylifehq.github.io/actions/runs/30865032859), [production root integrity](https://github.com/easylifehq/easylifehq.github.io/actions/runs/30865032914)).

No Pages, Firebase, claims, production accounts, or real user data were changed. The draft PR must remain draft.

The in-app browser did not surface a download event for a local blob CSV. Export behavior and content are covered by deterministic application tests; physical-device download/share-sheet behavior remains part of the field checklist.
