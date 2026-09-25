"use client";

import { FormEvent, useState } from "react";
import type { Course, Semester } from "@/lib/schema";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ColorPicker from "./ColorPicker";

export default function CourseForm({
  semester,
  initial,
  onSaved,
  onSave,
  onCancel,
}: {
  semester: Semester;
  initial?: Course | null;
  onSaved: () => void;
  onSave: (data: Omit<Course, "id">, id?: number) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [teacher, setTeacher] = useState(initial?.teacher ?? "");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [credits, setCredits] = useState(String(initial?.credits ?? 0));
  const [color, setColor] = useState(initial?.color ?? "#2563eb");
  const [code, setCode] = useState(initial?.code ?? "");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("请填写课程名称");
      return;
    }
    onSave(
      {
        semester_id: semester.id,
        name: name.trim(),
        teacher: teacher.trim() || null,
        room: room.trim() || null,
        credits: Number(credits) || 0,
        color,
        code: code.trim() || null,
      },
      initial?.id
    );
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">课程名称 *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：德语精读（三）" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">老师</label>
          <Input value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="选填" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">教室</label>
          <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="如：二教423" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">学分</label>
          <Input type="number" min="0" step="0.5" value={credits} onChange={(e) => setCredits(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">课程代码</label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="选填" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">颜色</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit">
          {initial ? "保存修改" : "添加课程"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
}