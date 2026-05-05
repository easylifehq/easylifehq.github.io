# EasyLife Next Variation Brief

## Audience

Spencer, as the signed-in EasyLife user, managing real school, tasks, calendar, notes, workouts, email, planning, and optional life modules.

## Promise

EasyLife helps Spencer know what matters now, capture life quickly, turn scattered inputs into usable plans, and keep deeper tools available without visual overload.

## Product Direction

EasyLife should feel like one calm Life OS, not separate apps. The default experience should be sleek, high-tech, focused, and trustworthy. It should feel powerful because the right thing is easy to reach, not because every capability is visible at once.

## Primary First-Screen Job

Answer:

- What needs my attention now?
- What can I do next?
- What changed since I last checked?
- Where can I quickly capture something?

## Core Modules

- Today: first-screen brief and next action.
- Calendar: time and schedule.
- Tasks: due work and capture.
- Notes: thoughts and memory.
- Coach: workouts, capacity, energy.
- Inbox: email-derived tasks/events/follow-ups.
- More: optional modules and settings.

## Optional Modules

- School
- Money
- People
- Fun / Drinks
- Projects
- Jobs
- Trips
- Future Plans

Optional modules should be discoverable but quiet. They should not compete with Today unless pinned or relevant.

## Visual Direction

Default:

- calm
- precise
- high-tech
- mobile-friendly
- professional
- restrained

Avoid:

- candy overload as the default
- dashboard clutter
- giant all-in-one home screens
- repeated cards and status pills
- visible internal build/process language
- decorative chrome that delays action

## Theme Direction

Themes stay, but they are mood layers over one stable product system.

Themes may change:

- accent colors
- surface tint
- motion/texture intensity
- contrast mode
- atmosphere

Themes must not change:

- navigation model
- layout hierarchy
- primary screen job
- module behavior
- accessibility requirements

## Fleet Guardrails

- Keep work phase-scoped.
- Do not invent future-phase features.
- Do not edit auth, Firebase rules/config, backend, functions, payments, dependencies, deploy config, old-site, generated output, secrets, or root production files.
- Prefer `app-vNext/src` and `docs/codex`.
- Run `npm.cmd run build` from `app-vNext` before completing implementation work.
- If a phase finishes early, improve proof and polish within the phase only.
