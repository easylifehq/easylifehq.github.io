# EasyCalendar Research Notes (4.28.0)

This research pass is the planning baseline for the next EasyCalendar implementation release.

## Sources Reviewed

- Google Calendar help: day, week, month views and navigation.
- Google Calendar help: tasks in calendar with start time, deadline, recurrence, and pending tasks.
- Google Tasks help: quick capture, subtasks, and task availability across products.
- Sunsama manual: task projections, guided daily planning, and planning-time controls.
- Todoist help: multiple calendar-style layouts, week/month choice, and calendar-backed task visualization.

## What Strong Calendar Tools Do Well

1. Open with a familiar primary view.
   - Google Calendar keeps month, week, and day views easy to switch and easy to navigate.
   - On mobile, picking a date from the month and then moving around nearby days is very fast.

2. Keep navigation lightweight.
   - The best products make it easy to jump to today, choose a date, and move forward/backward without extra chrome.
   - The user always knows where they are in time.

3. Separate item types clearly.
   - Google treats tasks differently from events.
   - Sunsama distinguishes flexible planned work from fixed events.
   - The lesson: deadlines, scheduled events, and work blocks should not all look the same.

4. Support flexible planning.
   - Sunsama's projected-task approach is useful because it keeps users in control while still visualizing workload.
   - EasyCalendar should keep task blocks editable and easy to move instead of making planning feel rigid.

5. Make repeat behavior simple.
   - Recurrence needs to feel normal for classes and standing events, not buried.

6. Keep settings tied to visible behavior.
   - Week start, visible day range, wake time, and default planning window should directly affect what the user sees.

## Best-Fit Directions For EasyCalendar

### Keep

- Month-first entry into EasyCalendar.
- Tap into a day from the month.
- Swipe or move through nearby days once inside day detail.
- Quick distinction between event, deadline, and work block.

### Improve In 4.29.0

- Make the month view denser and more Google-like.
- Add a clearer selected-day strip above the day detail.
- Make the day detail read like one timeline with stronger visual separation between:
  - fixed events
  - deadlines
  - scheduled task blocks
- Add easier reschedule actions for task blocks and deadlines.
- Keep week context visible while focused on a day.
- Reduce extra buttons and repeated controls.
- Make the quick-create flow smarter about item type.

### Avoid

- Turning every task into a fixed calendar block automatically.
- Overloading the main calendar with too many simultaneous control rows.
- Hiding key navigation behind deep drawers when it should be one tap away.

## Implementation Plan For 4.29.0

1. Tighten month view density and scan speed.
2. Improve selected-day navigation and nearby-day movement.
3. Strengthen event/deadline/task-block visual language.
4. Add simpler rescheduling and editing actions.
5. Keep settings-driven behavior visible in the calendar itself.
