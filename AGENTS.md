<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Work State

## Project
Personal study workspace (self-use, open-sourced on GitHub as `study-workspace`, deployed to GitHub Pages). English UI; Chinese content. **Fully static** Next.js 16 App Router (`output: "export"`, `basePath: "/study-workspace"`) + Tailwind v4. No backend, no API routes, no SQLite. All data lives in browser `localStorage` under the `sw:` prefix (10 collections). Local-only legacy data (old SQLite, uploads, exports) stays in `data/` (gitignored).

## Data
- Client storage layer: `lib/store.ts` — `useRepo(name)` hook (add/patch/remove/removeWhere/replace/refresh), `readCollection`/`writeCollection`, `exportAll`/`importAll`/`resetAll`, `searchAll`, `getDashboardStats`, `getDeadlinesWithCourse`, `nowIso`.
- 10 collections (keys `sw:*`): semesters, courses, schedule, notes, materials, exercises, journal, deadlines, pomodoro_logs, todos. Entities are typed in `lib/schema.ts` (`Material.dataUrl` holds base64 content).
- No seed data committed — fresh clones start empty. Data migrates between browsers via Settings → 导出/导入 (JSON).

## Checks
- `npm run typecheck` and `npm run lint` must pass. `npm run build` builds green (static export to `out/`).
- Strict ESLint: `react-hooks/set-state-in-effect` — put `// eslint-disable-next-line react-hooks/set-state-in-effect` directly ABOVE the  setState call inside effects (placing it below yields an error + unused-directive warning); `react-hooks/immutability` — functions used before declaration flagged.

## Where things are
- `lib/store.ts` — client storage layer (all data-access + search/dashboard helpers); `lib/schema.ts` — types; `lib/colors.ts` — client-safe color constants.
- All data-modifying components are `"use client"` and use `useRepo` from `lib/store`; nothing imports server-only modules (better-sqlite3 is NOT a dependency).
- `components/` — `schedule/` (ScheduleManager, ScheduleGrid, SlotEditor, CourseForm…), `courses/` (CourseDetail, NotesPanel, MaterialsPanel, ExercisesPanel), `journal/`, `deadlines/`, `todos/`, `pomodoro/PomodoroTimer`, `search/SearchBox`, `dashboard/TodayOverview`, `layout/`, `ui/`, `markdown/MarkdownRenderer`.
- **No `app/api/`** — the app is a static export; course detail is a client-side modal on `/courses` (no `[id]` route).

## Deployment
- `npm run build` produces `out/`; deploy its contents to the `gh-pages` branch. GitHub Pages serves the site at `/study-workspace/`. Local dev preview: `npx serve` a folder named `study-workspace` around `out/`, or `npm run dev` (basePath applies).
- Origin: `https://github.com/ivy20070602/study-workspace` (public). github.com is blocked directly on this machine — git pushes must use the local proxy `http://127.0.0.1:7888` (set as repo-local `http.proxy`). Never leave critical work uncommitted: an earlier `main` reset repeatedly wiped uncommitted files.

