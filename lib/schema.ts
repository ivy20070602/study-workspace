export interface Semester {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: number; // 0 or 1
}

export interface Course {
  id: number;
  semester_id: number;
  name: string;
  teacher: string | null;
  room: string | null;
  color: string;
  code: string | null;
  credits: number;
}

export interface Schedule {
  id: number;
  course_id: number;
  day_of_week: number; // 1=Mon ... 7=Sun
  start_slot: number;
  end_slot: number;
}

export interface Note {
  id: number;
  course_id: number;
  title: string;
  content_md: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: number;
  course_id: number;
  filename: string;
  filepath: string | null;
  dataUrl: string | null;
  filetype: string | null;
  uploaded_at: string;
}

export interface Exercise {
  id: number;
  course_id: number;
  title: string;
  content: string;
  is_done: number; // 0 or 1
  created_at: string;
}

export interface JournalEntry {
  id: number;
  title: string | null;
  content_md: string;
  mood: string | null;
  created_at: string;
}

export interface Deadline {
  id: number;
  course_id: number | null;
  title: string;
  due_at: string;
  type: string; // "homework" | "exam" | "project" | "other"
  is_done: number; // 0 or 1
  created_at: string;
}

export interface PomodoroLog {
  id: number;
  course_id: number | null;
  started_at: string;
  duration_min: number;
}

export interface Todo {
  id: number;
  content: string;
  is_done: number; // 0 or 1
  created_at: string;
  completed_at: string | null;
}

export type NewSemester = Omit<Semester, "id">;
export type NewCourse = Omit<Course, "id">;
export type NewSchedule = Omit<Schedule, "id">;
export type NewNote = Omit<Note, "id" | "created_at" | "updated_at">;
export type NewMaterial = Omit<Material, "id" | "uploaded_at">;
export type NewExercise = Omit<Exercise, "id" | "created_at" | "is_done">;
export type NewJournalEntry = Omit<JournalEntry, "id" | "created_at">;
export type NewDeadline = Omit<Deadline, "id" | "created_at" | "is_done">;
export type NewPomodoroLog = Omit<PomodoroLog, "id">;
export type NewTodo = Omit<Todo, "id" | "created_at" | "is_done" | "completed_at">;

export interface DeadlineWithCourse extends Deadline {
  course_name: string | null;
}

export interface ScheduleWithCourse extends Schedule {
  course: Course | null;
}

export interface SearchResult {
  id: number;
  kind: "course" | "note" | "exercise" | "journal" | "deadline" | "material" | "todo";
  title: string;
  snippet: string;
  courseName: string | null;
  href: string;
}