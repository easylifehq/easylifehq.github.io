# Root plan comparison

Wave 8 production plan:

- create 75;
- update 11;
- delete 181;
- unchanged 5;
- preserved 2 (`CNAME`, `.nojekyll`).

Wave 7 authoritative clean-checkout plan had the same counts. The production candidate replaces Wave 7's fail-closed review bundle with the approved production-configured bundle, so application asset hashes and filenames differ. The source application version remains `4.37.1`, and no ownership boundary changed.

All creates/updates/deletes are one of the six fixed generated paths, `assets/**`, or `icons/**`. Deletes are stale generated assets accumulated in the existing root. No plan entry targets source, tests, docs, Functions, Firestore rules, Git metadata, `old-site`, `CNAME`, `.nojekyll`, or an unknown root path.

The pre-apply and guarded-apply JSON plans are retained beside this record. `CNAME` hashes matched before and after apply. Independent regeneration and the applied root share inventory SHA-256 `5BB5AA54E4340ECC5515EEED67398678B3EB5DB30BD037AAEF21F7606923FC7B`. The final metadata records committed preserved blobs and LF-canonical managed text, matching both Windows and hosted Linux regeneration.
