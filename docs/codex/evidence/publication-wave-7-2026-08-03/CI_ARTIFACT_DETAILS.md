# Non-deploying CI artifact details

Two read-only paths verify publication without deploying:

1. `Release candidate checks` runs the publication and review-server tests, stages/verifies an isolated candidate, and uploads `easylife-pages-candidate-${{ github.sha }}`.
2. `Publication candidate dry run` runs on relevant pull requests and manual dispatch. It installs Node 24 and Temurin Java 21, runs the complete release gate, stages/verifies the candidate, and uploads `easylife-pages-dry-run-${{ github.sha }}` with the candidate and exact root plan for 14 days.

Both workflows have `contents: read` only. Neither declares `pages: write`, an environment, Firebase credentials, production secrets, a deployment action, a commit, or a push step.

The hosted result is recorded in the Wave 7 receipt after the draft PR is opened. A local green result does not substitute for hosted checks.
