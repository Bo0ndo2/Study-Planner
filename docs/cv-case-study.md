# CV Case Study: Study Planner Pro

## One-Line Pitch

Study Planner Pro is a portfolio-grade Next.js dashboard that proves practical experience with React architecture, server-state management, API boundaries, schema-driven forms, and testable Pomodoro-based scheduling logic.

## Problem

Students often plan manually around deadlines, availability, missed days, and subject progress. The project solves that by generating a Pomodoro-based study plan automatically while still allowing manual schedule changes.

## Technical Highlights

- Next.js App Router powers the app shell, API route, metadata, and production build.
- React Query owns the planner snapshot, loading states, cache updates, and save mutations.
- Axios is isolated in a dedicated API client instead of being called from components.
- Formik manages subject/settings form state.
- Yup centralizes validation rules and user-facing form errors.
- Context API is used only for cross-cutting theme preference.
- TypeScript contracts define subjects, sessions, planner data, summaries, and API payloads.
- Pure planner services generate the schedule without depending on React or browser APIs.
- The scheduler uses distributed practice, deadline pressure, interleaving, priority weighting, and 25-minute Pomodoro focus blocks.
- Vitest covers scheduler behavior, date helpers, and planner domain actions.

## Architecture Decision Record

### React Query

Used for planner data because it behaves like server state: it can be fetched from `/api/planner`, cached, updated with mutations, and hydrated from localStorage as a fallback.

### Axios

Used only at the data access boundary. Components and pure planner logic do not know how HTTP requests are made.

### Formik and Yup

Used for subject creation, subject editing, and settings because those flows need controlled values, validation, submit handling, and readable error messages.

### Context API

Used only for app-wide preferences, currently theme mode. Planner data is not stored in Context because React Query is a better fit for async/cache state.

### Pure Domain Logic

Schedule generation, planner actions, selectors, and form mapping are kept outside components so they can be tested and reused. The schedule engine splits work into 25-minute Pomodoro blocks, spreads work across available days, and rotates subjects when multiple tasks compete for the same day.

## Suggested CV Entry

**Study Planner Pro - Next.js / React Portfolio Project**

Built a feature-first study planning dashboard using Next.js, React, TypeScript, React Query, Axios, Formik, Yup, Context API, Tailwind CSS, and Vitest. Implemented a pure Pomodoro-based scheduling engine, schema-validated planner forms, API-backed persistence, localStorage hydration fallback, focused app preference context, and unit-tested domain logic.

## Suggested LinkedIn/GitHub Description

A professional Next.js study planner demonstrating React Query server-state management, Axios API isolation, Formik/Yup form validation, focused Context API usage, and pure testable Pomodoro scheduling logic.

## Interview Talking Points

- Why planner data belongs in React Query instead of Context.
- How Formik and Yup improve form consistency and validation readability.
- How API calls are isolated behind a feature API module.
- How the schedule engine remains pure and testable.
- How localStorage hydration works as a fallback while preserving API sync.
- How the feature-first folder structure makes the codebase easier to scale.
