"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course, Exercise, Material, Note, Schedule, Semester } from "@/lib/schema";
import { useRepo } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import SemesterSwitcher from "./SemesterSwitcher";
import ScheduleGrid from "./ScheduleGrid";
import CourseForm from "./CourseForm";
import SlotEditor from "./SlotEditor";

type SlotById = Record<number, Schedule[]>;

function groupByCourse(slots: Schedule[]): SlotById {
  const map: SlotById = {};
  for (const s of slots) {
    (map[s.course_id] ??= []).push(s);
  }
  return map;
}

function formatSlots(slots: Schedule[]): string {
  const dayLabel = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return slots
    .slice()
    .sort((a, b) => a.day_of_week - b.day_of_week || a.start_slot - b.start_slot)
    .map((s) => `${dayLabel[s.day_of_week - 1]} ${s.start_slot}-${s.end_slot}节`)
    .join("、");
}

export default function ScheduleManager() {
  const semesters = useRepo<Semester>("semesters");
  const courses = useRepo<Course>("courses");
  const schedule = useRepo<Schedule>("schedule");
  const notes = useRepo<Note>("notes");
  const materials = useRepo<Material>("materials");
  const exercises = useRepo<Exercise>("exercises");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [slotEditor, setSlotEditor] = useState<Course | null>(null);

  const semester = semesters.items.find((s) => s.is_active === 1) ?? semesters.items[0] ?? null;
  const semesterCourses = semester
    ? courses.items.filter((c) => c.semester_id === semester.id)
    : [];
  const semesterCourseIds = new Set(semesterCourses.map((c) => c.id));
  const slots = schedule.items.filter((s) => semesterCourseIds.has(s.course_id));

  const byCourse = groupByCourse(slots);
  const coursesById = new Map(semesterCourses.map((c) => [c.id, c]));

  function switchSemester(id: number) {
    semesters.items.forEach((s) => {
      const v = s.id === id ? 1 : 0;
      if (s.is_active !== v) semesters.patch(s.id, { is_active: v });
    });
  }

  function createSemester(name: string, start: string, end: string) {
    semesters.items.forEach((s) => {
      if (s.is_active === 1) semesters.patch(s.id, { is_active: 0 });
    });
    semesters.add({ name, start_date: start || null, end_date: end || null, is_active: 1 });
  }

  function saveCourse(data: Omit<Course, "id">, id?: number) {
    if (id !== undefined) courses.patch(id, data);
    else courses.add(data);
  }

  function deleteCourse(course: Course) {
    if (!confirm(`确定删除课程「${course.name}」？其笔记、课件、练习也会一并删除。`)) return;
    schedule.removeWhere((s) => s.course_id === course.id);
    notes.removeWhere((n) => n.course_id === course.id);
    materials.removeWhere((m) => m.course_id === course.id);
    exercises.removeWhere((e) => e.course_id === course.id);
    courses.remove(course.id);
  }

  function addSlot(day: number, start: number, end: number) {
    if (!slotEditor) return;
    schedule.add({ course_id: slotEditor.id, day_of_week: day, start_slot: start, end_slot: end });
  }

  function deleteSlot(id: number) {
    schedule.remove(id);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">我的课表</h1>
            {semester && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {semester.start_date ?? "—"} ~ {semester.end_date ?? "—"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SemesterSwitcher
              semesters={semesters.items}
              activeId={semester?.id ?? null}
              onSwitch={switchSemester}
              onCreate={createSemester}
            />
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>+ 添加课程</Button>
          </div>
        </div>
      </Card>

      {semester === null ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            还没有学期。请先「新建学期」，再添加课程。
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <ScheduleGrid slots={slots} coursesById={coursesById} />
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">课程列表</h2>
            <div className="space-y-2">
              {semesterCourses.map((c) => {
                const courseSlots = byCourse[c.id] ?? [];
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700"
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link href="/courses" className="font-medium hover:underline">
                          {c.name}
                        </Link>
                        <span className="text-xs text-gray-400">{c.credits ? `${c.credits}学分` : ""}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                        {c.teacher ? `${c.teacher} · ` : ""}
                        {courseSlots.length > 0 ? formatSlots(courseSlots) : "未排课"}
                        {c.room ? ` · ${c.room}` : ""}
                      </div>
                    </div>
                    <Button variant="ghost" className="!px-2 text-sm" onClick={() => setSlotEditor(c)}>
                      排课
                    </Button>
                    <Button variant="ghost" className="!px-2 text-sm" onClick={() => setEditing(c)}>
                      编辑
                    </Button>
                    <Button variant="ghost" className="!px-2 text-sm" onClick={() => deleteCourse(c)}>
                      删除
                    </Button>
                  </div>
                );
              })}
              {semesterCourses.length === 0 && (
                <p className="text-sm text-gray-400">这个学期还没有课程。</p>
              )}
            </div>
          </Card>
        </>
      )}

      {showForm && semester && (
        <Modal open onClose={() => setShowForm(false)} title="添加课程">
          <CourseForm
            semester={semester}
            onSaved={() => setShowForm(false)}
            onSave={saveCourse}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
      {editing && semester && (
        <Modal open onClose={() => setEditing(null)} title="编辑课程">
          <CourseForm
            semester={semester}
            initial={editing}
            onSaved={() => setEditing(null)}
            onSave={saveCourse}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
      {slotEditor && (
        <SlotEditor
          course={slotEditor}
          slots={byCourse[slotEditor.id] ?? []}
          onAdd={addSlot}
          onDelete={deleteSlot}
          onClose={() => setSlotEditor(null)}
        />
      )}
    </div>
  );
}