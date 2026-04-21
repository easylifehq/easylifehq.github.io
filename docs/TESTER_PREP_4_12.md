# EasyLife 4.12 Tester Prep

Use this guide before sending EasyLife to friends or using it as a phone-first daily app for a longer stretch. The goal is to prove the PWA install path is comfortable now and to keep the later native wrapper path clear.

## Tester Install Path

1. Open the deployed EasyLife site in Safari on iPhone.
2. Sign in once through the normal website flow.
3. Tap Safari Share.
4. Choose Add to Home Screen.
5. Open EasyLife from the new home-screen icon.
6. Confirm the app opens to EasyHQ, the selected startup page, or the last active app route.
7. Keep Safari available as the fallback if the home-screen app behaves differently.

## First Five Minutes

- Confirm the version in Settings matches `4.12.0`.
- Confirm Settings, Install says whether the app is running in Browser or Home screen mode.
- Confirm Settings, Data can create an export before heavy testing.
- Confirm Quick Add opens and closes without fighting the keyboard.
- Confirm the app can be used with one hand on the main phone.

## Core Flow Checklist

- Login: sign in, close the app, reopen, and confirm the session restores.
- Startup: set a custom startup page, close the app, reopen, and confirm the selected page loads.
- EasyHQ: open the resume card after visiting another app.
- EasyList: add a one-word task, add a deadline, switch lists, complete an item, bulk edit, and recover a deleted task.
- EasyCalendar: create an event, deadline, and scheduled task block; edit each one; check day, week, and month views.
- EasyNotes: create a note, type a long note, leave and return, search, and use add/edit controls from the notes home.
- EasyWorkout: start workout mode, type a custom exercise, add notes, save, and return to history.
- EasyProjects: create a project, add a section, and link or route a task.
- EasyPipeline: add a pipeline item and update its status.
- EasyStatistics: open the overview and confirm it loads without crowding daily-use pages.
- Settings: change theme, startup page, notifications, calendar wake time, app visibility, and export data.
- Logout: sign out, reopen, and confirm private app routes require login.

## Phone Friction Checklist

- Close buttons stay reachable below the notch, browser chrome, and bottom home indicator.
- Drawers scroll from their body instead of trapping the header.
- Text inputs keep save actions reachable when the keyboard is open.
- Quick Add is easy to tap and does not block important page controls.
- The header is useful but does not accidentally steal scroll gestures.
- Cards, buttons, and list rows fit without horizontal scrolling.
- Offline or weak signal states give calm fallback messaging.

## Share Message

Use this short message for personal testers:

> Open EasyLife in Safari, sign in, then use Share > Add to Home Screen. Try adding a task, calendar item, note, and workout from your phone. Send me anything that feels confusing, cramped, slow, or hard to tap.

## Native Wrapper Notes

These items still belong to a later native/TestFlight pass:

- Capacitor iOS and Android project scaffolding.
- Bundle IDs, signing certificates, and store developer accounts.
- Native splash screens and platform icon sets.
- Push notification support beyond browser/PWA limits.
- Firebase auth callback checks inside a native WebView.
- App Store screenshots, privacy details, support URL, and review notes.
- Firebase rule changes only if the native wrapper introduces new data paths.

## Go / No-Go

Use the PWA with friends if login, startup routing, task entry, calendar editing, notes typing, workout saving, settings, export, and logout all pass on the real iPhone.

Hold wider testing if the app loses sessions, opens to the wrong page repeatedly, hides close/save actions behind phone chrome, or fails basic Firestore saves.
