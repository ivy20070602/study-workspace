"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DeadlineWithCourse } from "@/lib/schema";
import { getDashboardStats, type DashboardStats } from "@/lib/store";
import Card from "@/components/ui/Card";

const DAY_LABEL = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function daysLeft(dueAt: string): number {
  const due = new Date(dueAt);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}

export default function TodayOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(getDashboardStats());
  }, []);

  if (!stats) return null;

  const today = new Date();
  const dayName = DAY_LABEL[today.getDay() === 0 ? 6 : today.getDay() - 1];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">今日课程</h2>
            <p className="text-xs text-gray-400">
              {dayName} {dateStr}
              {stats.semesterName ? ` · ${stats.semesterName}` : ""}
            </p>
          </div>
          <Link href="/schedule" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            查看课表 →
          </Link>
        </div>
        {stats.todayCourses.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">今天没有课 🎉</p>
        ) : (
          <ul className="space-y-2">
            {stats.todayCourses.map((s) =>
              s.course ? (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.course.color }} />
                  <span className="font-medium">{s.course.name}</span>
                  <span className="text-xs text-gray-400">
                    第 {s.start_slot}-{s.end_slot} 节
                    {s.course.room ? ` · ${s.course.room}` : ""}
                  </span>
                </li>
              ) : null
            )}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">即将到期</h2>
          <Link href="/deadlines" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            全部截止日期 →
          </Link>
        </div>
        {stats.dueSoon.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">暂无临近截止事项</p>
        ) : (
          <ul className="space-y-2">
            {stats.dueSoon.map((d: DeadlineWithCourse) => {
              const left = daysLeft(d.due_at);
              const overdue = left < 0;
              return (
                <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="truncate">
                    <span className="font-medium">{d.title}</span>
                    {d.course_name && <span className="ml-1 text-xs text-gray-400">· {d.course_name}</span>}
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      overdue ? "text-red-500" : left === 0 ? "text-orange-500" : "text-gray-400"
                    }`}
                  >
                    {overdue ? `已逾期 ${-left} 天` : left === 0 ? "今天" : `${left} 天后`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}