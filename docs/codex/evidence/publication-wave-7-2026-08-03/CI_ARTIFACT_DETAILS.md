# Non-deploying CI artifact details

Two read-only paths verify publication without deploying:

1. `Release candidate checks` runs the publication and review-server tests, stages/verifies an isolated candidate, and uploads `easylife-pages-candidate-${{ github.sha }}`.
2. `Publication candidate dry run` runs on relevant pull requests and manual dispatch. It installs Node 24 and Temurin Java 21, runs the complete release gate, stages/verifies the candidate, and uploads `easylife-pages-dry-run-${{ github.sha }}` with the candidate and exact root plan for 14 days.

Both workflows have `contents: read` only. Neither declares `pages: write`, an environment, Firebase credentials, production secrets, a deployment action, a commit, or a push step.

Draft PR #5 hosted result at implementation/evidence SHA `44751371`:

- `Complete verification and staged Pages artifact`: pass in 1m25s ([run](https://github.com/easylifehq/easylifehq.github.io/actions/runs/30846864267/job/91797197187));
- `Web tests and production build`: pass in 54s ([run](https://github.com/easylifehq/easylifehq.github.io/actions/runs/30846864209/job/91797197071));
- `Functions syntax and critical advisory gate`: pass in 12s ([run](https://github.com/easylifehq/easylifehq.github.io/actions/runs/30846864209/job/91797197132)).

All hosted checks were green. The follow-up commit records only this status and does not change application, tooling, workflow, candidate, or test behavior.
