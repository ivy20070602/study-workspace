"use client";

import { useState } from "react";
import type { Course, Schedule, Semester } from "@/lib/schema";
import { useRepo } from "@/lib/store";
import Modal from "@/components/ui/Modal";
import CourseDetail from "@/components/courses/CourseDetail";

const DAY_LABEL = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default function CoursesPage() {
  const semesters = useRepo<Semester>("semesters");
  const courses = useRepo<Course>("courses");
  const schedule = useRepo<Schedule>("schedule");
  const [selected, setSelected] = useState<Course | null>(null);

  const semester = semesters.items.find((s) => s.is_active === 1) ?? semesters.items[0] ?? null;
  const courseList = semester
    ? courses.items.filter((c) => c.semester_id === semester.id)
    : [];
  const slotsByCourse = new Map<number, Schedule[]>();
  for (const s of schedule.items) {
    const list = slotsByCourse.get(s.course_id) ?? [];
    list.push(s);
    slotsByCourse.set(s.course_id, list);
  }

  if (!semester) {
    return <p className="text-gray-500">请先到「课表」页创建一个学期。</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">课程</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {semester.name} · 共 {courseList.length} 门
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courseList.map((c) => {
          const courseSlots = slotsByCourse.get(c.id) ?? [];
          const timeText = courseSlots
            .map((s) => `${DAY_LABEL[s.day_of_week - 1]} ${s.start_slot}-${s.end_slot}节`)
            .join("、");
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="group rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                <div className="font-semibold group-hover:underline">{c.name}</div>
              </div>
              <div className="mt-2 space-y-0.5 text-sm text-gray-500 dark:text-gray-400">
                {c.teacher && <div>老师：{c.teacher}</div>}
                {c.room && <div>教室：{c.room}</div>}
                {timeText && <div>{timeText}</div>}
                {!timeText && <div className="text-gray-400">未排课</div>}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <Modal open onClose={() => setSelected(null)} title="">
          <CourseDetail course={selected} slotsByCourse={slotsByCourse} />
        </Modal>
      )}
    </div>
  );
}