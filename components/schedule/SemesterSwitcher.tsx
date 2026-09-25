"use client";

import { useState } from "react";
import type { Semester } from "@/lib/schema";
import { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SemesterSwitcher({
  semesters,
  activeId,
  onSwitch,
  onCreate,
}: {
  semesters: Semester[];
  activeId: number | null;
  onSwitch: (id: number) => void;
  onCreate: (name: string, start: string, end: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={activeId ?? ""}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v) onSwitch(v);
        }}
        className="w-auto"
      >
        {semesters.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
            {s.is_active === 1 ? "（当前）" : ""}
          </option>
        ))}
      </Select>
      {!creating ? (
        <Button type="button" variant="secondary" onClick={() => setCreating(true)}>
          新建学期
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="学期名称"
            className="w-40"
          />
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-36" />
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-36" />
          <Button
            type="button"
            disabled={!name.trim()}
            onClick={async () => {
              await onCreate(name.trim(), start, end);
              setCreating(false);
              setName("");
              setStart("");
              setEnd("");
            }}
          >
            创建
          </Button>
          <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
            取消
          </Button>
        </div>
      )}
    </div>
  );
}