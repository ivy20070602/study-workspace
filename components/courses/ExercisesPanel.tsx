"use client";

import { FormEvent, useState } from "react";
import type { Exercise } from "@/lib/schema";
import { useRepo, nowIso } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

export default function ExercisesPanel({ courseId }: { courseId: number }) {
  const exercises = useRepo<Exercise>("exercises");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);

  const courseExercises = exercises.items.filter((e) => e.course_id === courseId);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    exercises.add({
      course_id: courseId,
      title: title.trim(),
      content,
      is_done: 0,
      created_at: nowIso(),
    });
    setTitle("");
    setContent("");
    setAdding(false);
  }

  function toggle(e: Exercise) {
    exercises.patch(e.id, { is_done: e.is_done ? 0 : 1 });
  }

  function remove(e: Exercise) {
    if (!confirm(`删除练习「${e.title}」？`)) return;
    exercises.remove(e.id);
  }

  const done = courseExercises.filter((e) => e.is_done).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          共 {courseExercises.length} 项 · 已完成 {done} 项
        </p>
        <Button variant="secondary" onClick={() => setAdding(!adding)}>
          {adding ? "收起" : "+ 添加练习"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={onSubmit} className="space-y-2">
          <Card className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="练习标题，如：第3课课后练习 P.45"
            />
            <Textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="补充说明（选填）"
            />
            <Button type="submit" disabled={!title.trim()}>添加</Button>
          </Card>
        </form>
      )}

      {courseExercises.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-gray-400">还没有练习项</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {courseExercises.map((e) => (
            <Card key={e.id} className="flex items-center gap-3 !p-3">
              <button
                onClick={() => toggle(e)}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 ${
                  e.is_done
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                aria-label="完成"
              >
                {e.is_done && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${e.is_done ? "line-through opacity-50" : ""}`}>
                  {e.title}
                </div>
                {e.content && <div className="mt-0.5 text-xs text-gray-400">{e.content}</div>}
              </div>
              <span className="text-xs text-gray-400">{e.created_at.slice(0, 10)}</span>
              <button
                onClick={() => remove(e)}
                className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-red-500"
              >
                删除
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}