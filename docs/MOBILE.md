# Mobile App Plan

EasyLife `4.0.0` starts with the path that helps fastest: installable iPhone home-screen support from the current web app. Capacitor and store-readiness can layer on top when distribution needs get bigger.

## Current Target

- Priority: iPhone home-screen use for the owner and friends.
- Secondary: keep the app structured so TestFlight, Android, and App Store work are still possible later.
- Current approach: PWA install foundation first, then Capacitor/native wrapping when needed.
- The app now detects browser vs home-screen launch mode and shows install guidance from EasyHQ and Settings.
- The app now remembers the last active app route and offers a resume card from EasyHQ.
- The tester prep guide lives in `docs/TESTER_PREP_4_12.md` and should be used before sharing the app link with friends.

## iPhone Install Path

1. Open the deployed EasyLife site in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch EasyLife from the new home-screen icon.
5. Confirm login, navigation, notes, tasks, calendar, workout, settings, and data export still work.

## App Store Readiness Later

- Add Capacitor iOS and Android projects.
- Choose bundle IDs and signing accounts.
- Generate production icons and splash screens.
- Confirm Firebase auth domains and mobile callback behavior.
- Prepare privacy copy, screenshots, support URL, and review notes.
- Use TestFlight before any public App Store submission.

## Sharing Checklist

1. Confirm the version in Settings matches the release being shared.
2. Open Settings, Distribution and review the share-ready checklist.
3. Open Settings, Install and confirm the iPhone Add to Home Screen path still makes sense.
4. Open Settings, Data and confirm export tools work before a wider test.
5. Send testers the site link with Safari Add to Home Screen instructions.
6. Keep the previous stable git commit available as the rollback point.
7. Run the tester prep guide before expanding beyond personal/friend testing.

## QA Checklist

- Install from Safari on iPhone.
- Open from home screen and confirm it launches without Safari chrome.
- Confirm EasyHQ only shows the install card while running in the browser.
- Confirm EasyHQ shows a resume card after visiting another app screen.
- Confirm Settings shows Browser vs Home screen app and Online vs Offline status.
- Confirm Settings can request notification permission and send a test notification where the browser supports it.
- Confirm notification categories and quiet hours save correctly.
- Confirm Settings, Assistant can enable/disable AI helpers, draft creation, review-before-save, and fallback behavior.
- Confirm EasyProjects AI planning stays hidden until both Assistant draft creation and the Project Planner Lab are enabled.
- Confirm EasyHQ shows notification preview items only after notification categories are enabled.
- Confirm app loading states look intentional during cold launch and auth restore.
- Open the keyboard in notes, tasks, calendar forms, workout fields, and settings fields; confirm save/close actions remain reachable.
- Split one EasyList task into multiple calendar blocks from the task drawer.
- Split one EasyCalendar task block into multiple calendar blocks from the calendar composer.
- Complete a task in each theme and confirm the archive motion feels quick and does not block checking off more tasks.
- Sign in, sign out, and relaunch.
- Create and edit a task.
- Open and edit a note.
- Add or edit a calendar item.
- Start and save a workout.
- Open Settings, Distribution, Install, and Data export.
- Rotate the device and confirm portrait remains comfortable.
- Try weak signal or airplane mode and confirm the app fails gracefully.
