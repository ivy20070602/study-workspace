"use client";

import { useState } from "react";
import type { Note } from "@/lib/schema";
import { useRepo, nowIso } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

export default function NotesPanel({ courseId }: { courseId: number }) {
  const notes = useRepo<Note>("notes");
  const [active, setActive] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [dirty, setDirty] = useState(false);

  const courseNotes = notes.items.filter((n) => n.course_id === courseId);

  function loadNote(n: Note) {
    if (dirty && !confirm("当前笔记有未保存的修改，确定离开？")) return;
    setActive(n);
    setTitle(n.title);
    setContent(n.content_md);
    setCreating(false);
    setMode("preview");
    setDirty(false);
  }

  function newNote() {
    if (dirty && !confirm("当前笔记有未保存的修改，确定新建？")) return;
    setActive(null);
    setCreating(true);
    setTitle("");
    setContent("");
    setMode("edit");
    setDirty(false);
  }

  function save() {
    const ts = nowIso();
    if (active) {
      notes.patch(active.id, { title, content_md: content, updated_at: ts });
    } else {
      notes.add({
        course_id: courseId,
        title: title || "无标题",
        content_md: content,
        created_at: ts,
        updated_at: ts,
      });
      setCreating(false);
    }
    setDirty(false);
  }

  function remove() {
    if (!active) return;
    if (!confirm(`删除笔记「${active.title}」？`)) return;
    notes.remove(active.id);
    setActive(null);
    setCreating(false);
    setDirty(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <Card className="p-2">
        <Button className="w-full" onClick={newNote}>
          + 新建笔记
        </Button>
        <ul className="mt-2 space-y-0.5">
          {courseNotes.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => loadNote(n)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  active?.id === n.id
                    ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <div className="truncate">{n.title}</div>
                <div className="text-xs opacity-60">{n.updated_at.slice(0, 10)}</div>
              </button>
            </li>
          ))}
          {courseNotes.length === 0 && !creating && (
            <li className="px-3 py-2 text-sm text-gray-400">还没有笔记</li>
          )}
        </ul>
      </Card>

      {(creating || active) ? (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
                placeholder="笔记标题"
                className="flex-1"
              />
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setMode("edit")}
                  className={`rounded-lg border px-3 py-1 ${
                    mode === "edit"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-gray-300 text-gray-400 dark:border-gray-700"
                  }`}
                >
                  源码
                </button>
                <button
                  onClick={() => setMode("preview")}
                  className={`rounded-lg border px-3 py-1 ${
                    mode === "preview"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-gray-300 text-gray-400 dark:border-gray-700"
                  }`}
                >
                  预览
                </button>
                <span className={`ml-2 ${dirty ? "text-orange-500" : "text-gray-400"}`}>
                  {dirty ? "● 未保存" : "已保存"}
                </span>
              </div>
            </div>
            {mode === "preview" ? (
              <div className="min-h-64 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <Textarea
                rows={14}
                value={content}
                onChange={(e) => { setContent(e.target.value); setDirty(true); }}
                placeholder={"支持 Markdown：# 标题、**加粗**、- 列表、> 引用、`代码`"}
              />
            )}
            <div className="flex gap-2">
              <Button onClick={save}>保存</Button>
              {active && (
                <Button variant="danger" onClick={remove}>
                  删除
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="py-8 text-center text-sm text-gray-400">
            选择左侧笔记，或新建一篇笔记。
          </p>
        </Card>
      )}
    </div>
  );
}