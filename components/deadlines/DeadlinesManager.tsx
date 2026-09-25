"use client";

import { FormEvent, useState } from "react";
import type { Course, Deadline, DeadlineWithCourse } from "@/lib/schema";
import { useRepo, nowIso } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";

const TYPE_LABEL: Record<string, string> = {
  homework: "作业",
  exam: "考试",
  project: "项目",
  other: "其他",
};

const TYPE_COLOR: Record<string, string> = {
  homework: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  exam: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  project: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

function daysLeft(dueAt: string): number {
  const due = new Date(dueAt);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}

export default function DeadlinesManager() {
  const deadlines = useRepo<Deadline>("deadlines");
  const courses = useRepo<Course>("courses");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [type, setType] = useState("homework");
  const [courseId, setCourseId] = useState<string>("");

  const courseNameById = new Map(courses.items.map((c) => [c.id, c.name]));
  const list: DeadlineWithCourse[] = deadlines.items.map((d) => ({
    ...d,
    course_name: d.course_id != null ? (courseNameById.get(d.course_id) ?? null) : null,
  }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueAt) return;
    deadlines.add({
      title: title.trim(),
      due_at: dueAt,
      type,
      course_id: courseId ? Number(courseId) : null,
      is_done: 0,
      created_at: nowIso(),
    });
    setTitle("");
    setDueAt("");
    setCourseId("");
    setType("homework");
    setAdding(false);
  }

  function toggle(d: Deadline) {
    deadlines.patch(d.id, { is_done: d.is_done ? 0 : 1 });
  }

  function remove(d: Deadline) {
    if (!confirm(`删除「${d.title}」？`)) return;
    deadlines.remove(d.id);
  }

  const sorted = [...list].sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done - b.is_done;
    return a.due_at.localeCompare(b.due_at);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">截止日期</h1>
        <Button variant="secondary" onClick={() => setAdding(!adding)}>
          {adding ? "收起" : "+ 添加"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={onSubmit} className="space-y-2">
          <Card className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="事项，如：德语写作 第3单元作文提交"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
              <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">不关联课程</option>
                {courses.items.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={!title.trim() || !dueAt}>添加</Button>
          </Card>
        </form>
      )}

      {sorted.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-gray-400">还没有截止事项</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((d) => {
            const left = daysLeft(d.due_at);
            const overdue = !d.is_done && left < 0;
            const soon = !d.is_done && left >= 0 && left <= 3;
            return (
              <Card
                key={d.id}
                className={`flex items-center gap-3 !p-3 ${overdue ? "border-red-300 dark:border-red-900" : soon ? "border-orange-300 dark:border-orange-900" : ""}`}
              >
                <button
                  onClick={() => toggle(d)}
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 ${
                    d.is_done ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 dark:border-gray-600"
                  }`}
                  aria-label="完成"
                >
                  {d.is_done && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLOR[d.type] ?? TYPE_COLOR.other}`}>
                  {TYPE_LABEL[d.type] ?? "其他"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-medium ${d.is_done ? "line-through opacity-50" : ""}`}>
                    {d.title}
                  </div>
                  {d.course_name && <div className="text-xs text-gray-400">{d.course_name}</div>}
                </div>
                <div className={`shrink-0 text-xs font-medium ${overdue ? "text-red-500" : soon ? "text-orange-500" : "text-gray-400"}`}>
                  {d.is_done ? "已完成" : overdue ? `已逾期 ${-left} 天` : left === 0 ? "今天" : `${left} 天后`}
                </div>
                <span className="shrink-0 text-xs text-gray-400">{d.due_at.slice(0, 16)}</span>
                <button onClick={() => remove(d)} className="shrink-0 rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-red-500">
                  删除
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}