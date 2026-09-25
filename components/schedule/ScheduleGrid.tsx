"use client";

import type { Course, Schedule } from "@/lib/schema";

const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function timeOf(slot: number, start: boolean): string {
  const table: [number, string][] = [
    [1, "08:00"], [2, "08:50"], [3, "10:10"], [4, "11:00"],
    [5, "14:00"], [6, "14:50"], [7, "15:40"], [8, "16:30"],
    [9, "19:00"], [10, "19:50"], [11, "20:40"], [12, "21:30"],
  ];
  return table[Math.min(Math.max(slot - 1, 0), 11)][1] + (start ? " 开始" : " 结束");
}

export default function ScheduleGrid({
  slots,
  coursesById,
}: {
  slots: Schedule[];
  coursesById: Map<number, Course>;
}) {
  return (
    <div className="grid grid-cols-[3rem_repeat(7,1fr)] gap-1 text-xs sm:text-sm">
      <div />
      {DAY_NAMES.map((d) => (
        <div key={d} className="pb-1 text-center font-medium text-gray-500 dark:text-gray-400">
          {d}
        </div>
      ))}
      {Array.from({ length: 12 }, (_, i) => i + 1).map((slot) => (
        <div key={slot} className="contents">
          <div className="flex items-center justify-center text-gray-400">
            [{slot}]
          </div>
          {DAY_NAMES.map((_, dayIdx) => {
            const day = dayIdx + 1;
            const matches = slots.filter((s) => s.day_of_week === day && s.start_slot <= slot && s.end_slot >= slot);
            return (
              <div key={day} className="min-h-9 p-0.5">
                {matches.map((s) => {
                  const c = coursesById.get(s.course_id);
                  if (!c) return null;
                  const isStart = s.start_slot === slot;
                  const isEnd = s.end_slot === slot;
                  return (
                    <div
                      key={s.id}
                      className="mb-0.5 min-h-8 rounded-md p-1 leading-tight"
                      style={{ backgroundColor: c.color + "30", borderLeft: `3px solid ${c.color}` }}
                    >
                      <div className="line-clamp-2 font-medium" style={{ color: c.color }}>
                        {c.name}
                      </div>
                      <div className="truncate text-gray-500 dark:text-gray-400">
                        {c.room || ""}
                        {c.room && (isStart || isEnd) ? ` · ${timeOf(slot, isStart)}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}