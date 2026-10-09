"use client";

import { useEffect, useState } from "react";
import { getDeadlinesWithCourse } from "@/lib/store";

interface ExamState {
  title: string;
  course: string | null;
  type: string;
  days: number;
}

function compute(): ExamState | null {
  const now = Date.now();
  const next = getDeadlinesWithCourse()
    .filter((d) => !d.is_done && new Date(d.due_at).getTime() > now)
    .sort((a, b) => a.due_at.localeCompare(b.due_at))[0];
  if (!next) return null;
  const days = Math.max(
    0,
    Math.ceil((new Date(next.due_at).getTime() - now) / 86400000)
  );
  return { title: next.title, course: next.course_name, type: next.type, days };
}

function typeLabel(type: string): string {
  if (type === "exam") return "考试";
  if (type === "homework") return "作业";
  if (type === "project") return "项目";
  return "事项";
}

export default function ExamCountdown() {
  const [exam, setExam] = useState<ExamState | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExam(compute());
  }, []);

  if (!exam) return null;

  const urgent = exam.days <= 7;
  const digits = String(exam.days).padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-4 rounded-3xl border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 ${
        urgent
          ? "bg-gradient-to-r from-candy-500 to-peachy-400 text-white"
          : "bg-gradient-to-r from-sunny-300 to-peachy-200 text-ink"
      }`}
    >
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-card text-3xl">
        {urgent ? "⏰" : "⏳"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-black uppercase tracking-wider opacity-70">
          最近的{typeLabel(exam.type)}{exam.course ? ` · ${exam.course}` : ""}
        </div>
        <div className="truncate text-lg font-extrabold">{exam.title}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-3xl font-black leading-none">{digits}</div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
          {urgent ? "天，冲！" : "天后"}
        </div>
      </div>
    </div>
  );
}