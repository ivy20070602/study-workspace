"use client";

import { FormEvent, useState } from "react";
import type { Todo } from "@/lib/schema";
import { useRepo, nowIso } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Filter = "all" | "active" | "done";

export default function TodosManager() {
  const todos = useRepo<Todo>("todos");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = content.trim();
    if (!value) return;
    todos.add({
      content: value,
      is_done: 0,
      created_at: nowIso(),
      completed_at: null,
    });
    setContent("");
  }

  function toggle(t: Todo) {
    const done = t.is_done ? 0 : 1;
    todos.patch(t.id, { is_done: done, completed_at: done ? nowIso() : null });
  }

  function remove(t: Todo) {
    if (!confirm(`删除待办「${t.content}」？`)) return;
    todos.remove(t.id);
  }

  const shown = todos.items.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.is_done === 1 : t.is_done === 0
  );
  const doneCount = todos.items.filter((t) => t.is_done === 1).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">待办</h1>
        <p className="text-sm text-gray-400">
          {todos.items.length} 项 · 已完成 {doneCount} 项
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="添加一个待办事项…"
          className="flex-1"
          autoFocus
        />
        <Button type="submit" disabled={!content.trim()}>
          添加
        </Button>
      </form>

      <div className="flex gap-1 text-sm">
        {(["all", "active", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1 ${
              filter === f
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {f === "all" ? "全部" : f === "active" ? "未完成" : "已完成"}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-gray-400">
            {filter === "all" ? "还没有待办事项" : filter === "done" ? "还没有已完成事项" : "没有未完成事项"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {shown.map((t) => (
            <Card key={t.id} className="flex items-center gap-3 !p-3">
              <button
                onClick={() => toggle(t)}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 ${
                  t.is_done ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 dark:border-gray-600"
                }`}
                aria-label="完成"
              >
                {t.is_done === 1 && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${t.is_done === 1 ? "line-through opacity-50" : ""}`}>
                  {t.content}
                </div>
                <div className="text-xs text-gray-400">
                  {t.is_done === 1 && t.completed_at
                    ? `完成于 ${t.completed_at.slice(0, 10)}`
                    : `创建于 ${t.created_at.slice(0, 10)}`}
                </div>
              </div>
              <button
                onClick={() => remove(t)}
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