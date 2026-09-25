"use client";

import { FormEvent, useState } from "react";
import type { JournalEntry } from "@/lib/schema";
import { useRepo, nowIso } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

const MOODS = ["😊", "😌", "😐", "😔", "😫"];

export default function JournalManager() {
  const journal = useRepo<JournalEntry>("journal");
  const [active, setActive] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [editing, setEditing] = useState(false);

  function newEntry() {
    setActive(null);
    setTitle("");
    setContent("");
    setMood(null);
    setMode("edit");
    setEditing(true);
  }

  function load(e: JournalEntry) {
    setActive(e);
    setEditing(false);
    setMode("preview");
  }

  function save() {
    if (active) {
      journal.patch(active.id, { title: title || null, content_md: content, mood });
    } else {
      journal.add({ title: title || null, content_md: content, mood, created_at: nowIso() });
      setEditing(false);
    }
  }

  function remove() {
    if (!active) return;
    if (!confirm("确定删除这篇日记？")) return;
    journal.remove(active.id);
    setActive(null);
    setEditing(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card className="p-2">
        <Button className="w-full" onClick={newEntry}>
          + 写日记
        </Button>
        <ul className="mt-2 space-y-0.5">
          {journal.items.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => load(e)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  active?.id === e.id
                    ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <div className="truncate">
                  {e.mood && <span className="mr-1">{e.mood}</span>}
                  {e.title || "（无标题）"}
                </div>
                <div className="text-xs opacity-60">{e.created_at.slice(0, 10)}</div>
              </button>
            </li>
          ))}
          {journal.items.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">还没有日记</li>
          )}
        </ul>
      </Card>

      {(editing) ? (
        <Card>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题（选填）" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">心情：</span>
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? null : m)}
                  className={`rounded-lg border px-2 py-1 text-lg ${
                    mood === m ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`rounded-lg border px-3 py-1 ${
                  mode === "edit" ? "border-blue-500 text-blue-600" : "border-gray-300 text-gray-400"
                }`}
              >
                源码
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`rounded-lg border px-3 py-1 ${
                  mode === "preview" ? "border-blue-500 text-blue-600" : "border-gray-300 text-gray-400"
                }`}
              >
                预览
              </button>
            </div>
            {mode === "preview" ? (
              <div className="min-h-64 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <Textarea
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="今天发生了什么？"
              />
            )}
            <div className="flex gap-2">
              <Button type="submit">保存</Button>
              {active && <Button variant="danger" onClick={remove} type="button">删除</Button>}
            </div>
          </form>
        </Card>
      ) : active ? (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                {active.mood && <span className="mr-2">{active.mood}</span>}
                {active.title || "（无标题）"}
              </div>
              <div className="text-xs text-gray-400">{active.created_at}</div>
            </div>
            <Button variant="secondary" type="button" onClick={() => { setMode("edit"); setEditing(true); }}>
              编辑
            </Button>
          </div>
          <MarkdownRenderer content={active.content_md} />
        </Card>
      ) : (
        <Card>
          <p className="py-8 text-center text-sm text-gray-400">
            从左侧选择一篇日记，或点「+ 写日记」。
          </p>
        </Card>
      )}
    </div>
  );
}