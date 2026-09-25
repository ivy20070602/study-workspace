"use client";

import { useState } from "react";
import type { Course, Schedule } from "@/lib/schema";
import NotesPanel from "./NotesPanel";
import MaterialsPanel from "./MaterialsPanel";
import ExercisesPanel from "./ExercisesPanel";

type Tab = "notes" | "materials" | "exercises";

const DAY_LABEL = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const TABS: { key: Tab; label: string }[] = [
  { key: "notes", label: "笔记" },
  { key: "materials", label: "课件与资料" },
  { key: "exercises", label: "练习" },
];

export default function CourseDetail({
  course,
  slotsByCourse,
}: {
  course: Course;
  slotsByCourse: Map<number, Schedule[]>;
}) {
  const [tab, setTab] = useState<Tab>("notes");

  const slots = slotsByCourse.get(course.id) ?? [];
  const timeText = slots
    .map((s) => `${DAY_LABEL[s.day_of_week - 1]} 第 ${s.start_slot}-${s.end_slot}节`)
    .join("、");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: course.color }} />
        <h1 className="text-2xl font-semibold">{course.name}</h1>
        <span className="text-sm text-gray-400">
          {[course.code, course.teacher, course.room].filter(Boolean).join(" · ")}
        </span>
        <span className="text-sm text-gray-400">{course.credits ? `${course.credits} 学分` : ""}</span>
      </div>
      {timeText && <p className="text-sm text-gray-500 dark:text-gray-400">{timeText}</p>}

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm ${
              tab === t.key
                ? "border-blue-600 font-medium text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "notes" && <NotesPanel courseId={course.id} />}
      {tab === "materials" && <MaterialsPanel courseId={course.id} />}
      {tab === "exercises" && <ExercisesPanel courseId={course.id} />}
    </div>
  );
}