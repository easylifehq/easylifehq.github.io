# Firebase Rules Verification

This is the 4.6.0 verification record for EasyLife Firestore rules, app data paths, and mobile-sharing readiness. It is a practical safety pass, not a claim that the app is impossible to attack.

## Current Rule Shape

- `firestore.rules` allows authenticated users to read and write only `users/{uid}` and anything beneath their own user document.
- `firestore.rules` denies every other document path with the final catch-all rule.
- `firebase.json` points Firestore deploys at `firestore.rules`.
- The verified rules were deployed to `pipeline-2f422` with `firebase deploy --only firestore:rules --project pipeline-2f422`.

## Verified Client Data Paths

All current frontend Firestore helpers use owner-scoped paths under `users/{userId}`:

- `applications`
- `generatedDrafts`
- `calendarEvents`
- `calendarTaskBlocks`
- `categories`
- `contacts`
- `notes`
- `noteFolders`
- `projects`
- `projectSections`
- `projectTaskLinks`
- `appPreferences/shell`
- `tasks`
- `workoutExercises`
- `workoutRoutines`
- `workoutSessions`

No current app Firestore helper uses a root-level shared collection, `collectionGroup`, or an unscoped document path.

## Cloud Function Check

- `analyzeTaskBrainDump` requires a Firebase ID token in the `Authorization: Bearer ...` header before calling OpenAI.
- `planProjectWithAi` requires a Firebase ID token in the `Authorization: Bearer ...` header before calling OpenAI.
- `OPENAI_API_KEY` is read from Firebase secrets, not from the frontend bundle.
- CORS is limited in `functions/index.js` to known EasyLife origins and local development origins.

## Manual Rules Test Plan

Use the Firebase Emulator Suite when available, or a controlled staging project before broader sharing.

1. Signed out user cannot read `users/{ownerUid}`.
2. Signed out user cannot create `users/{ownerUid}/tasks/{taskId}`.
3. Signed in owner can create, read, update, and delete `users/{ownerUid}/tasks/{taskId}`.
4. Signed in owner can read and write each verified collection path listed above.
5. Signed in user A cannot read `users/{userB}/tasks/{taskId}`.
6. Signed in user A cannot update or delete `users/{userB}/notes/{noteId}`.
7. Signed in user A cannot read a root-level path such as `tasks/{taskId}`.
8. Signed in user A cannot write a root-level path such as `calendarEvents/{eventId}`.
9. AI endpoints reject requests without an ID token.
10. AI endpoints reject requests with an invalid ID token.

## Deploy Checklist

- Confirm `firebase.json` still contains `"rules": "firestore.rules"`.
- Review any new Firestore helper added since this document was last updated.
- Deploy rules intentionally with `firebase deploy --only firestore:rules --project pipeline-2f422`.
- After deploy, run one owner account and one second-user smoke test before broader sharing.
- Update this document if any collection moves outside `users/{uid}`.
