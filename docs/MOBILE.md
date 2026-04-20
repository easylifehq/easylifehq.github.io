# Mobile App Plan

EasyLife `4.0.0` starts with the path that helps fastest: installable iPhone home-screen support from the current web app. Capacitor and store-readiness can layer on top when distribution needs get bigger.

## Current Target

- Priority: iPhone home-screen use for the owner and friends.
- Secondary: keep the app structured so TestFlight, Android, and App Store work are still possible later.
- Current approach: PWA install foundation first, then Capacitor/native wrapping when needed.
- The app now detects browser vs home-screen launch mode and shows install guidance from EasyHQ and Settings.
- The app now remembers the last active app route and offers a resume card from EasyHQ.

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

## QA Checklist

- Install from Safari on iPhone.
- Open from home screen and confirm it launches without Safari chrome.
- Confirm EasyHQ only shows the install card while running in the browser.
- Confirm EasyHQ shows a resume card after visiting another app screen.
- Confirm Settings shows Browser vs Home screen app and Online vs Offline status.
- Confirm Settings can request notification permission and send a test notification where the browser supports it.
- Confirm notification categories and quiet hours save correctly.
- Sign in, sign out, and relaunch.
- Create and edit a task.
- Open and edit a note.
- Add or edit a calendar item.
- Start and save a workout.
- Open Settings and data export.
- Rotate the device and confirm portrait remains comfortable.
- Try weak signal or airplane mode and confirm the app fails gracefully.
