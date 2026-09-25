# Study Workspace

A personal study companion — schedule, course materials, notes, homework, journal, deadlines, to-dos, and a pomodoro timer, all in one. **Local-first and private**: all data lives in your own browser's `localStorage`. English UI, suitable for self-use.

Live demo: [ivy20070602.github.io/study-workspace](https://ivy20070602.github.io/study-workspace/)

## Tech Stack

- **Next.js 16** (App Router, `output: "export"`) + **React 19** + TypeScript (strict)
- **Tailwind CSS v4**
- **No backend** — fully static, deployed to GitHub Pages; data persists in browser `localStorage`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/study-workspace](http://localhost:3000/study-workspace) (the `basePath` is `/study-workspace` to match GitHub Pages).

## Deploy

```bash
npm run build   # static export to out/
```

Push the contents of `out/` to the `gh-pages` branch and enable GitHub Pages for that branch. The site is served at `/study-workspace/`.

## Data & Sync

- All data (semester, courses, schedule, notes, materials, journal, deadlines, to-dos, pomodoro logs) is stored in browser `localStorage` under the `sw:` prefix — nothing is sent to any server.
- **Backup / migrate devices**: Settings → 导出 (download a JSON backup) → on the other device Settings → 导入.
- Uploaded course materials are stored as base64 in `localStorage` (mind the browser storage quota for very large files).

## Features

- **Schedule** — semester management, course list with colors/rooms/teachers, and a weekly grid (day × period) with per-course time slots.
- **Courses** — per-course three tabs:
  - **Notes** — Markdown notes with source/preview toggle
  - **Materials** — upload course files (PDF/PPT/Word/images/audio…), preview PDFs & images inline, download, rename, delete
  - **Exercises** — track assignments/tasks, check off completion
- **Journal** — daily journal entries with mood and Markdown
- **Deadlines** — homework/exam/project items with due time, overdue & due-soon highlighting, completion checkbox
- **To-dos** — a simple, filterable checklist (all / active / done)
- **Pomodoro timer** — 25/5/15 focus timer, optional course tagging, completion notification, logs
- **Overview dashboard** — today's classes and upcoming deadlines at a glance
- **Global search** — search across courses, notes, exercises, journals, deadlines, materials, and to-dos
- **Dark mode** — toggle persisted to `localStorage`, respects system preference
- **Data export/import** — JSON backup & restore from Settings

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Static development mode |
| `npm run build` | Static export to `out/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | Next typegen + TypeScript check |

## Directory Structure

```
app/          — page routes (App Router)
components/   — UI components (schedule, courses, journal, deadlines, todos, pomodoro, search, dashboard)
lib/          — client storage layer (store.ts), schema types, client-safe colors
data/         — local-only data (gitignored): SQLite mirrors, exports, uploaded files from older versions
```

## License

[MIT](./LICENSE)