"use client";

import { useState } from "react";
import type { Course, Schedule } from "@/lib/schema";
import { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const DAY_LABEL = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default function SlotEditor({
  course,
  slots,
  onAdd,
  onDelete,
  onClose,
}: {
  course: Course;
  slots: Schedule[];
  onAdd: (day: number, start: number, end: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  const [day, setDay] = useState(1);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(2);
  const [busy, setBusy] = useState(false);

  return (
    <Modal open onClose={onClose} title={`排课：${course.name}`}>
      <div className="space-y-3">
        <div>
          <div className="mb-2 text-sm font-medium">已有上课时间</div>
          {slots.length === 0 ? (
            <p className="text-sm text-gray-400">暂无排课</p>
          ) : (
            <ul className="space-y-1">
              {slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-sm dark:bg-gray-700">
                  <span>
                    {DAY_LABEL[s.day_of_week - 1]}　第 {s.start_slot}-{s.end_slot} 节
                  </span>
                  <Button
                    variant="danger"
                    className="!px-2 !py-0.5 text-xs"
                    onClick={async () => {
                      setBusy(true);
                      await onDelete(s.id);
                      setBusy(false);
                    }}
                  >
                    删除
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm text-gray-500">星期</label>
            <Select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {DAY_LABEL[d - 1]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">开始节</label>
            <Select value={start} onChange={(e) => setStart(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  第 {s} 节
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">结束节</label>
            <Select value={end} onChange={(e) => setEnd(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  第 {s} 节
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Button
          disabled={busy || end < start}
          onClick={async () => {
            setBusy(true);
            await onAdd(day, start, end);
            setBusy(false);
          }}
        >
          添加时间段
        </Button>
      </div>
    </Modal>
  );
}