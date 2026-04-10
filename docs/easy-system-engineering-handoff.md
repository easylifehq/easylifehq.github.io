# Easy System Engineering Handoff

## Purpose

This document turns the Easy product spec into an implementation plan for the next version of the product ecosystem.

The current repository is still a static HTML/CSS/JS site with Firebase wired into specific pages. The next phase should move the app experience to a shared React + Firebase architecture while preserving the existing brand direction and product boundaries:

- EasyHQ = control center
- EasyList = task system
- EasyCalendar = time system

This handoff is designed to answer:

- what we are building first
- how the app should be structured
- what data model to use
- how the planning engine should work at MVP level
- how to migrate safely from the current repo

---

## Build Decision

### Recommended direction

Build the next version as a single React app with shared auth, shared design tokens, shared Firestore access, and product-level route separation.

### Why

- shared login is simpler
- shared Firestore listeners are easier to manage
- EasyHQ can aggregate EasyList and EasyCalendar data without duplication
- linked task blocks and planning logic will be much easier to maintain
- future products can plug into the same shell

### Important rule

Even if the React app shares one codebase, EasyList and EasyCalendar should stay conceptually separate products.

Do not merge them into one generic productivity screen.

---

## Recommended App Structure

### Top-level routes

```text
/
/login
/app
/app/hq
/app/easylist
/app/easylist/inbox
/app/easylist/today
/app/easylist/upcoming
/app/easylist/archive
/app/easycalendar
/app/easycalendar/day
/app/easycalendar/week
/app/easycalendar/planning/day
/app/easycalendar/planning/week
/app/settings
```

### Route behavior

- `/` = public marketing site
- `/login` = auth entry
- `/app` should redirect to `/app/hq`
- `/app/hq` = post-login landing dashboard
- `/app/easylist/*` = task product
- `/app/easycalendar/*` = calendar product
- `/app/settings` = profile, preferences, defaults

---

## Recommended Frontend Layout

### Shared logged-in app shell

Create one shared authenticated shell with:

- left nav or adaptive top/side nav
- product switcher
- account menu
- responsive layout

### Shared shell sections

- app brand area
- product navigation
- context actions
- user menu
- optional quick-create button

### Product nav model

```text
EasyHQ
EasyList
EasyCalendar
Settings
```

Inside each product, use secondary navigation:

#### EasyList secondary nav

- Inbox
- Today
- Upcoming
- Archive

#### EasyCalendar secondary nav

- Day
- Week
- Plan My Day
- Plan My Week

---

## Suggested React Folder Structure

```text
src/
  app/
    router/
    providers/
    layouts/
  features/
    auth/
    hq/
    easylist/
    easycalendar/
    settings/
  components/
    ui/
    forms/
    navigation/
    feedback/
  lib/
    firebase/
    firestore/
    dates/
    planning/
    categories/
  styles/
    tokens/
    globals/
```

### Suggested feature breakdown

#### `features/auth`

- login page
- auth guard
- shared auth state hooks

#### `features/hq`

- today snapshot
- top tasks card
- fixed events preview
- open time summary

#### `features/easylist`

- task views
- task creation
- task detail drawer
- archive/history
- schedule-to-calendar action

#### `features/easycalendar`

- week view
- day view
- event CRUD
- linked task blocks
- planning panels

#### `features/settings`

- user defaults
- week-start preference
- default duration
- category management

---

## Shared Component List

### Core UI components

- `AppShell`
- `AuthenticatedRoute`
- `ProductSwitcher`
- `SecondaryNav`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `StatusBadge`
- `CategoryBadge`
- `PriorityBadge`
- `ConfirmDialog`
- `Drawer`
- `Modal`

### Form components

- `TextField`
- `TextAreaField`
- `DateField`
- `DurationField`
- `PrioritySelect`
- `CategorySelect`
- `ToggleField`

### EasyList components

- `TaskList`
- `TaskRow`
- `TaskCard`
- `TaskComposer`
- `TaskDetailDrawer`
- `TaskArchiveSection`
- `TaskFilterBar`
- `DraftTasksPanel`

### EasyCalendar components

- `CalendarGrid`
- `CalendarDayColumn`
- `FixedEventBlock`
- `TaskBlock`
- `GapHighlight`
- `PlanSummaryPanel`
- `OverloadWarning`
- `EventEditorModal`
- `TaskBlockEditorModal`

### EasyHQ components

- `DailySnapshotCard`
- `TopTasksCard`
- `OpenTimeCard`
- `TodayEventsCard`
- `QuickLaunchCard`

---

## Firestore Data Model

### Collection structure

```text
users/{userId}
  profile
  settings
  categories/{categoryId}
  tasks/{taskId}
  calendarEvents/{eventId}
  calendarTaskBlocks/{blockId}
```

### `users/{userId}/profile`

Suggested fields:

```ts
type UserProfile = {
  displayName: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `users/{userId}/settings/defaults`

Suggested fields:

```ts
type UserSettings = {
  weekStartsOn: "sunday" | "monday";
  defaultTaskDurationMinutes: number;
  calendarDensity: "comfortable" | "compact";
  timezone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `users/{userId}/categories/{categoryId}`

```ts
type Category = {
  name: string;
  color: string;
  type?: string | null;
  isDefault?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### Default categories

Seed if missing:

- School
- Work
- Gym
- Personal
- Social
- To-Do

### `users/{userId}/tasks/{taskId}`

```ts
type TaskStatus = "active" | "completed" | "archived";
type TaskSource = "manual" | "calendar_followup" | "planner" | "notes";

type Task = {
  title: string;
  notes: string;
  status: TaskStatus;
  priorityRank: 1 | 2 | 3 | 4 | 5;
  priorityLabel: string;
  categoryId: string | null;
  durationMinutes: number | null;
  dueDate: Timestamp | null;
  linkedCalendarBlockIds: string[];
  source: TaskSource;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `users/{userId}/calendarEvents/{eventId}`

```ts
type EventType = "class" | "work" | "appointment" | "personal" | "other";

type CalendarEvent = {
  title: string;
  description: string;
  categoryId: string | null;
  startAt: Timestamp;
  endAt: Timestamp;
  allDay: boolean;
  isRecurring: boolean;
  recurrenceRule: string | null;
  eventType: EventType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `users/{userId}/calendarTaskBlocks/{blockId}`

```ts
type PlanningState = "suggested" | "scheduled" | "accepted";

type CalendarTaskBlock = {
  taskId: string;
  titleSnapshot: string;
  categoryId: string | null;
  startAt: Timestamp;
  endAt: Timestamp;
  isFlexible: true;
  planningState: PlanningState;
  userAdjusted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

---

## Data Rules

### Task rules

- task source of truth lives in `tasks`
- tasks can exist with no calendar block
- tasks can be active without a due date
- if `durationMinutes` is missing, app should assume `30` for planning but still prompt user to set a real duration

### Calendar event rules

- calendar events are fixed commitments
- planning engine should never silently move them

### Calendar task block rules

- deleting a task block does not delete the task
- moving a task block only updates that block
- completing a task should dim or remove active future task blocks tied to it
- uncategorized task blocks should render as To-Do category

---

## EasyList MVP Screen Spec

### Inbox

Purpose:

- master list of active tasks
- sortable/filterable
- quick add

Should show:

- title
- category
- priority
- duration
- due date
- linked calendar status

Actions:

- edit
- complete
- archive
- send to calendar

### Today

Purpose:

- focus list for what matters now

Should include:

- overdue tasks
- due today tasks
- manually important tasks

### Upcoming

Purpose:

- due-soon planning view

Should group by:

- overdue
- tomorrow
- next 7 days
- later
- no due date

### Archive

Purpose:

- completion history

Should preserve:

- task title
- category
- due date if present
- completion date
- notes preview optional

---

## EasyCalendar MVP Screen Spec

### Day view

Should show:

- fixed events
- linked task blocks
- open gaps
- overload warning

### Week view

Should show:

- all day/week structure
- fixed recurring commitments
- linked task blocks
- visible category colors

### Plan My Day panel

Should show:

- suggested blocks
- overload summary
- accept / ignore / rerun actions

### Plan My Week panel

Should show:

- tentative distribution of task blocks
- warnings for overloaded days
- tasks left unscheduled

---

## EasyHQ MVP Screen Spec

### Required sections

- current date and greeting
- next 3 fixed events
- top 3 tasks
- open time summary
- quick launch cards
- plan my day button

### Recommended card layout

```text
Greeting / date
Today’s next events
Top tasks
Open time
Quick launch
```

### Example messages

- "You have two open windows today."
- "Three high-priority tasks are still open."
- "Your afternoon is packed."

---

## Shared Query Strategy

### Use real-time listeners for

- active tasks
- current week calendar events
- current week task blocks
- HQ summary inputs

### Use one-time or paged fetches for

- large archive history
- old completed tasks
- settings bootstrap if needed

### Suggested query groups

#### EasyList

- active tasks ordered by due date then updatedAt
- completed tasks ordered by completedAt desc

#### EasyCalendar

- events where `startAt` is within visible range
- task blocks where `startAt` is within visible range

#### EasyHQ

- today’s events
- urgent active tasks
- today and week task blocks

---

## Planning Engine MVP

### Goal

Generate hypothetical schedules from EasyList tasks into EasyCalendar open time.

### Inputs

- fixed events in target window
- active tasks
- task durations
- due dates
- priority ranks
- existing task blocks
- current date/time

### Output

Suggested `calendarTaskBlocks` with `planningState = "suggested"` unless user accepts them.

### Ranking order

1. overdue tasks
2. due today / due tomorrow
3. high priority
4. duration fit
5. remaining tasks

### Gap detection

#### Day planning

1. take start and end of day
2. subtract fixed events
3. subtract accepted scheduled task blocks
4. calculate remaining gaps

#### Week planning

1. repeat gap detection by day
2. prefer earlier placement for urgent work
3. avoid overfilling one day if nearby days have room

### MVP pseudocode

```ts
function planDay({
  fixedEvents,
  acceptedTaskBlocks,
  activeTasks,
  dayStart,
  dayEnd,
}: PlanDayInput): PlanResult {
  const occupiedRanges = mergeRanges([
    ...fixedEvents.map(toRange),
    ...acceptedTaskBlocks.map(toRange),
  ]);

  const openGaps = invertRanges(dayStart, dayEnd, occupiedRanges);

  const rankedTasks = rankTasks(activeTasks);
  const suggestions = [];
  const unscheduled = [];

  for (const task of rankedTasks) {
    const duration = task.durationMinutes ?? 30;
    const gap = findBestGap(openGaps, duration);

    if (!gap) {
      unscheduled.push(task);
      continue;
    }

    const block = createSuggestedTaskBlock(task, gap.start, duration);
    suggestions.push(block);
    reserveGap(openGaps, block.startAt, block.endAt);
  }

  return {
    suggestions,
    unscheduled,
    overloadWarning: unscheduled.length > 0,
  };
}
```

### Week pseudocode

```ts
function planWeek(days: DayPlanInput[]): WeekPlanResult {
  const allSuggestions = [];
  const carryoverTasks = [];

  for (const day of days) {
    const result = planDay(day);
    allSuggestions.push(...result.suggestions);
    carryoverTasks.push(...result.unscheduled);
  }

  return {
    suggestions: allSuggestions,
    unscheduled: carryoverTasks,
    overloadedDays: findOverloadedDays(days, allSuggestions),
  };
}
```

### Acceptance rules

- suggested blocks should be visibly different from accepted ones
- user can accept all, accept some, move them, or delete them
- planner should not finalize anything dangerous without user action

---

## Visual Rules

### Category color treatment

Use full block color in calendar, not dots only.

### Fixed event blocks

- stronger fill
- more authoritative
- read as locked

### Flexible task blocks

- softer fill or border treatment
- still category-colored
- clearly movable

### EasyList tone

- clean with some personality

### EasyCalendar tone

- cleaner and more restrained than EasyList
- clarity over decoration

---

## Migration Plan From Current Repo

### Phase 0: preserve current app

Do not delete the current static app until the React version has core parity.

### Phase 1: create React app alongside existing pages

Recommended new folder:

```text
app-vNext/
```

Inside that folder:

- React app
- Firebase app config
- shared routes
- shared shell

### Phase 2: connect auth and Firestore

Build:

- login flow
- auth guard
- provider structure
- typed Firestore helpers

### Phase 3: rebuild EasyList first

Why first:

- current task data already exists
- EasyCalendar depends on task quality
- task schema is the foundation for planning

### Phase 4: build EasyCalendar

Build:

- event CRUD
- week/day layout
- linked task blocks
- gap detection

### Phase 5: build EasyHQ

Once EasyList and EasyCalendar have live data, build HQ from their shared queries.

### Phase 6: optional redirect strategy

Once stable:

- route logged-in users into React app
- keep public marketing pages in current site or migrate later

---

## Recommended Technical Priorities

### Priority 1

Shared infrastructure:

- React scaffold
- router
- Firebase provider setup
- auth guard
- shared Firestore helpers

### Priority 2

EasyList:

- schema normalization
- CRUD
- list views
- archive
- task detail

### Priority 3

EasyCalendar:

- events
- task blocks
- week/day views
- linked task actions

### Priority 4

Planning engine MVP:

- day planning
- week planning
- overload warnings

### Priority 5

EasyHQ:

- snapshot
- launch cards
- open-time summary

---

## Recommended Initial Files To Create In React App

```text
app-vNext/
  src/
    main.tsx
    App.tsx
    app/router/index.tsx
    app/providers/AppProviders.tsx
    lib/firebase/client.ts
    lib/firebase/auth.ts
    lib/firestore/tasks.ts
    lib/firestore/calendarEvents.ts
    lib/firestore/calendarTaskBlocks.ts
    lib/firestore/categories.ts
    features/auth/routes/LoginPage.tsx
    features/hq/routes/HQPage.tsx
    features/easylist/routes/EasyListInboxPage.tsx
    features/easylist/routes/EasyListTodayPage.tsx
    features/easylist/routes/EasyListUpcomingPage.tsx
    features/easylist/routes/EasyListArchivePage.tsx
    features/easycalendar/routes/EasyCalendarWeekPage.tsx
    features/easycalendar/routes/EasyCalendarDayPage.tsx
```

---

## Explicit MVP Non-Goals

Do not spend time on these yet:

- Google Calendar sync
- Apple Calendar sync
- multi-user collaboration
- team workspaces
- advanced analytics
- AI chat assistant
- complex recurring rules beyond practical basics
- deep offline conflict resolution

---

## Recommended Next Task

The next practical step is:

### Create the React app shell without replacing the current site yet

That task should include:

- initialize React app in `app-vNext/`
- set up router
- connect Firebase auth
- add authenticated shell
- add placeholder routes for HQ, EasyList, and EasyCalendar
- add typed Firestore access layer

This gives the project a stable base before migrating product logic.

---

## Definition Of Success For This Handoff

This handoff is successful if the next build step results in:

- one shared React app foundation
- one auth flow
- one consistent Firestore model
- clear product separation
- easy path to migrate EasyList first
- easy path to build EasyCalendar correctly instead of bolting it on later

