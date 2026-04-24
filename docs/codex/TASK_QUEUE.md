\# EasyLife Overnight Task Queue



\## Guardrails



Codex may:

\- edit app-vNext source files

\- improve UI copy, spacing, small layout details, and docs

\- run builds

\- commit to a codex branch



Codex may NOT:

\- deploy

\- push to main

\- merge to main

\- touch Firebase rules

\- touch auth provider setup

\- touch billing, DNS, secrets, API keys, or production config

\- rewrite the whole app

\- delete major features

\- modify old-site unless explicitly asked



\## Tasks



\## Tasks



\- \[ ] EasyList tiny cleanup: inspect EasyList UI files and make one copy-only or spacing-only improvement. Do not change logic, routing, auth, Firebase, or data structure.



\- \[ ] EasyCalendar tiny cleanup: inspect EasyCalendar UI files and make one copy-only or spacing-only improvement. Do not change calendar logic, event logic, routing, auth, Firebase, or data structure.



\- \[ ] Docs cleanup: improve docs/codex/TASK\_BOARD.md or docs/codex/LOOP.md so the Codex workflow is clearer. Do not touch app code for this task.



\## Nightly rules



For each task:

1\. Inspect before editing.

2\. Make the smallest safe change.

3\. Run app-vNext build.

4\. Review the diff for bugs, broken mobile behavior, and scope creep.

5\. Fix issues found during review.

6\. Only mark the task complete if build passes.

7\. Append notes to docs/codex/NIGHTLY\_REPORT.md.

