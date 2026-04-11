# OpenAI Task Analyzer Setup

EasyList's brain dump analyzer calls a Firebase Function so the OpenAI API key never ships in the public React bundle.

## 1. Install function dependencies

```powershell
cd functions
npm install
```

## 2. Set the OpenAI key as a Firebase secret

This is where you paste your OpenAI key. Do not put the key in React, `VITE_` env vars, GitHub Pages files, or any file that gets committed.

```powershell
firebase functions:secrets:set OPENAI_API_KEY
```

The Firebase CLI will prompt you to enter the secret value. Paste the OpenAI key there. Firebase stores it securely and the browser never sees it.

You can optionally choose a different model by setting the function environment variable `OPENAI_MODEL`. The default is `gpt-5-mini`.

## 3. Deploy the function

```powershell
firebase deploy --only functions
```

## 4. Point the React app at the function

Create `app-vNext/.env.local` and add:

```text
VITE_TASK_ANALYZER_URL=https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/analyzeTaskBrainDump
```

Then rebuild the React app and sync the deployed files:

```powershell
cd app-vNext
npm run build
Copy-Item -Path '.\dist\*' -Destination '..' -Recurse -Force
Copy-Item -Path '..\index.html' -Destination '..\404.html' -Force
```

If the endpoint is not configured or the AI call fails, EasyList falls back to the local parser so task entry still works.

## Why users should not enter their own keys

For EasyLifeHQ, use one app-owned OpenAI key stored as a Firebase secret. Asking each user to bring their own key would make onboarding annoying, push account/security work onto users, and still would not let us safely call OpenAI directly from the browser. Later, if usage grows, add per-user limits or billing controls around the Firebase Function instead.
