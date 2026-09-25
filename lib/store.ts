"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Course,
  Deadline,
  DeadlineWithCourse,
  Exercise,
  JournalEntry,
  Material,
  Note,
  PomodoroLog,
  Schedule,
  ScheduleWithCourse,
  SearchResult,
  Semester,
  Todo,
} from "@/lib/schema";

export const STORAGE_PREFIX = "sw:";

export const COLLECTIONS = [
  "semesters",
  "courses",
  "schedule",
  "notes",
  "materials",
  "exercises",
  "journal",
  "deadlines",
  "pomodoro_logs",
  "todos",
] as const;

export type CollectionKey = (typeof COLLECTIONS)[number];

export function collectionKey(name: CollectionKey): string {
  return STORAGE_PREFIX + name;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function readCollection<T>(name: CollectionKey): T[] {
  try {
    const raw = localStorage.getItem(collectionKey(name));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function writeCollection<T>(name: CollectionKey, items: T[]): void {
  try {
    localStorage.setItem(collectionKey(name), JSON.stringify(items));
  } catch {
    // 存储不可用（如隐私模式配额满）时静默失败
  }
}

export function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, it) => Math.max(max, it.id), 0) + 1;
}

interface WithId {
  id: number;
}

export function useRepo<T extends WithId>(name: CollectionKey) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readCollection<T>(name));
  }, [name]);

  const refresh = useCallback(() => {
    setItems(readCollection<T>(name));
  }, [name]);

  const add = useCallback(
    (data: Omit<T, "id">) => {
      const id = nextId(readCollection<T>(name));
      const entity = { ...data, id } as T;
      setItems((prev) => {
        const next = [...prev, entity];
        writeCollection(name, next);
        return next;
      });
      return entity;
    },
    [name]
  );

  const patch = useCallback(
    (id: number, changes: Partial<T>) => {
      setItems((prev) => {
        const next = prev.map((it) => (it.id === id ? { ...it, ...changes } : it));
        writeCollection(name, next);
        return next;
      });
    },
    [name]
  );

  const remove = useCallback(
    (id: number) => {
      setItems((prev) => {
        const next = prev.filter((it) => it.id !== id);
        writeCollection(name, next);
        return next;
      });
    },
    [name]
  );

  const removeWhere = useCallback(
    (match: (it: T) => boolean) => {
      setItems((prev) => {
        const next = prev.filter((it) => !match(it));
        writeCollection(name, next);
        return next;
      });
    },
    [name]
  );

  const replace = useCallback(
    (nextList: T[]) => {
      setItems(nextList);
      writeCollection(name, nextList);
    },
    [name]
  );

  return { items, add, patch, remove, removeWhere, replace, refresh };
}

export interface WorkspaceExport {
  app: string;
  version: number;
  exportedAt: string;
  data: Partial<Record<CollectionKey, unknown[]>>;
}

export function exportAll(): WorkspaceExport {
  const data: Partial<Record<CollectionKey, unknown[]>> = {};
  for (const name of COLLECTIONS) {
    data[name] = readCollection<unknown>(name);
  }
  return { app: "study-workspace", version: 1, exportedAt: nowIso(), data };
}

export function importAll(json: WorkspaceExport): { ok: boolean; error?: string } {
  const data = json && json.data;
  if (!data || typeof data !== "object") return { ok: false, error: "文件格式不正确" };
  for (const name of COLLECTIONS) {
    const value = data[name];
    if (value === undefined) continue;
    if (!Array.isArray(value)) return { ok: false, error: `「${name}」数据不是数组` };
    writeCollection(name, value);
  }
  return { ok: true };
}

export function resetAll(): void {
  for (const name of COLLECTIONS) {
    localStorage.removeItem(collectionKey(name));
  }
}

export function getDeadlinesWithCourse(): DeadlineWithCourse[] {
  const deadlines = readCollection<Deadline>("deadlines");
  const courses = readCollection<Course>("courses");
  const map = new Map(courses.map((c) => [c.id, c.name]));
  return deadlines.map((d) => ({
    ...d,
    course_name: d.course_id != null ? (map.get(d.course_id) ?? null) : null,
  }));
}

export interface DashboardStats {
  semesterName: string | null;
  todayCourses: ScheduleWithCourse[];
  dueSoon: DeadlineWithCourse[];
  courseCount: number;
}

export function getDashboardStats(): DashboardStats {
  const semesters = readCollection<Semester>("semesters");
  const courses = readCollection<Course>("courses");
  const schedule = readCollection<Schedule>("schedule");

  const semester = semesters.find((s) => s.is_active === 1) ?? semesters[0] ?? null;
  const courseById = new Map(courses.map((c) => [c.id, c] as const));
  const todayDay = new Date().getDay() === 0 ? 7 : new Date().getDay();

  const todayCourses = schedule
    .filter((s) => s.day_of_week === todayDay)
    .map((s) => ({ ...s, course: courseById.get(s.course_id) ?? null }))
    .filter((s) => s.course !== null)
    .sort((a, b) => a.start_slot - b.start_slot) as ScheduleWithCourse[];

  const now = Date.now();
  const dueSoon = getDeadlinesWithCourse()
    .filter((d) => !d.is_done && new Date(d.due_at).getTime() - now <= 7 * 86400000)
    .sort((a, b) => a.due_at.localeCompare(b.due_at))
    .slice(0, 6);

  const courseCount = semester
    ? courses.filter((c) => c.semester_id === semester.id).length
    : 0;

  return { semesterName: semester?.name ?? null, todayCourses, dueSoon, courseCount };
}

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];
  const semesters = readCollection<Semester>("semesters");
  const courses = readCollection<Course>("courses");
  const courseById = new Map(courses.map((c) => [c.id, c] as const));
  const semester = semesters.find((s) => s.is_active === 1) ?? semesters[0] ?? null;
  const inActiveSemester = (c: Course) => (semester ? c.semester_id === semester.id : true);

  for (const c of courses) {
    if (!inActiveSemester(c)) continue;
    if (
      c.name.toLowerCase().includes(q) ||
      (c.teacher ?? "").toLowerCase().includes(q) ||
      (c.room ?? "").toLowerCase().includes(q)
    ) {
      results.push({
        id: c.id,
        kind: "course",
        title: c.name,
        snippet: [c.teacher, c.room, c.code].filter(Boolean).join(" · "),
        courseName: null,
        href: "/courses",
      });
    }
  }

  for (const n of readCollection<Note>("notes")) {
    if (n.title.toLowerCase().includes(q) || n.content_md.toLowerCase().includes(q)) {
      results.push({
        id: n.id,
        kind: "note",
        title: n.title,
        snippet: n.content_md.replace(/\n/g, " ").slice(0, 60),
        courseName: courseById.get(n.course_id)?.name ?? null,
        href: "/courses",
      });
    }
  }

  for (const m of readCollection<Material>("materials")) {
    if (m.filename.toLowerCase().includes(q)) {
      results.push({
        id: m.id,
        kind: "material",
        title: m.filename,
        snippet: m.filetype ?? "资料",
        courseName: courseById.get(m.course_id)?.name ?? null,
        href: "/courses",
      });
    }
  }

  for (const e of readCollection<Exercise>("exercises")) {
    if (e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)) {
      results.push({
        id: e.id,
        kind: "exercise",
        title: e.title,
        snippet: e.content.replace(/\n/g, " ").slice(0, 60),
        courseName: courseById.get(e.course_id)?.name ?? null,
        href: "/courses",
      });
    }
  }

  for (const j of readCollection<JournalEntry>("journal")) {
    if ((j.title ?? "").toLowerCase().includes(q) || j.content_md.toLowerCase().includes(q)) {
      results.push({
        id: j.id,
        kind: "journal",
        title: j.title || "（无标题）",
        snippet: j.content_md.replace(/\n/g, " ").slice(0, 60),
        courseName: null,
        href: "/journal",
      });
    }
  }

  for (const d of readCollection<Deadline>("deadlines")) {
    if (d.title.toLowerCase().includes(q)) {
      results.push({
        id: d.id,
        kind: "deadline",
        title: d.title,
        snippet: d.type,
        courseName: courseById.get(d.course_id ?? -1)?.name ?? null,
        href: "/deadlines",
      });
    }
  }

  for (const t of readCollection<Todo>("todos")) {
    if (t.content.toLowerCase().includes(q)) {
      results.push({
        id: t.id,
        kind: "todo",
        title: t.content,
        snippet: t.is_done ? "已完成" : "未完成",
        courseName: null,
        href: "/todos",
      });
    }
  }

  return results;
}

export function useAllRepos() {
  const semesters = useRepo<Semester>("semesters");
  const courses = useRepo<Course>("courses");
  const schedule = useRepo<Schedule>("schedule");
  const notes = useRepo<Note>("notes");
  const materials = useRepo<Material>("materials");
  const exercises = useRepo<Exercise>("exercises");
  const journal = useRepo<JournalEntry>("journal");
  const deadlines = useRepo<Deadline>("deadlines");
  const pomodoroLogs = useRepo<PomodoroLog>("pomodoro_logs");
  const todos = useRepo<Todo>("todos");
  return { semesters, courses, schedule, notes, materials, exercises, journal, deadlines, pomodoroLogs, todos };
}