\# CODEX.md



\## Project

This is the EasyLife HQ repo. It is a hybrid repo:

\- The deployed static site output lives at the repo root.

\- The real React/Vite/TypeScript source app lives in `app-vNext/`.

\- Firebase Cloud Functions live in `functions/`.

\- `old-site/` is archived and should not be modified unless explicitly requested.



\## Main working area

Most app changes should happen inside:



`app-vNext/`



Do not manually edit generated/deployed root files like `index.html`, `assets/`, `sw.js`, or `manifest.webmanifest` unless the user explicitly asks to update production build output.



\## Local development

For the main app:



```bash

cd app-vNext

npm install

npm run dev

