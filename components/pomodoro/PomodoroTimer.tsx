"use client";

import { useEffect, useRef, useState } from "react";
import type { Course, PomodoroLog } from "@/lib/schema";
import { useRepo, nowIso } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";

const FOCUS = "focus";
const SHORT_BREAK = "short";
const LONG_BREAK = "long";

const PRESETS: Record<string, number> = {
  [FOCUS]: 25,
  [SHORT_BREAK]: 5,
  [LONG_BREAK]: 15,
};

const LABEL: Record<string, string> = {
  [FOCUS]: "专注",
  [SHORT_BREAK]: "短休息",
  [LONG_BREAK]: "长休息",
};

type Mode = "focus" | "short" | "long";

export default function PomodoroTimer() {
  const courses = useRepo<Course>("courses");
  const pomodoroLogs = useRepo<PomodoroLog>("pomodoro_logs");
  const [mode, setMode] = useState<Mode>(FOCUS);
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[FOCUS] * 60);
  const [running, setRunning] = useState(false);
  const [courseId, setCourseId] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const completed = pomodoroLogs.items.length;
  const todayFocus = pomodoroLogs.items.filter(
    (l) => l.started_at.slice(0, 10) === nowIso().slice(0, 10)
  ).length;

  function finishMode() {
    if (mode === FOCUS) {
      pomodoroLogs.add({
        course_id: courseId ? Number(courseId) : null,
        started_at: nowIso(),
        duration_min: PRESETS[FOCUS],
      });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("专注结束 🎉", { body: "休息一下吧！" });
      }
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    const nextMode: Mode = mode === FOCUS
      ? (completed + 1) % 4 === 0 ? LONG_BREAK : SHORT_BREAK
      : FOCUS;
    setMode(nextMode);
    setSecondsLeft(PRESETS[nextMode] * 60);
    setRunning(false);
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          finishMode();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }

  function start() {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setRunning(true);
  }

  function switchMode(m: Mode) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    setSecondsLeft(PRESETS[m] * 60);
    setRunning(false);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">🍅 番茄钟</h2>
        <div className="flex gap-1 text-xs">
          {(Object.keys(LABEL) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`rounded-lg px-2 py-1 ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {LABEL[m]}
            </button>
          ))}
        </div>
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold tabular-nums tracking-wider">
          {mm}:{ss}
        </div>
        <div className="mt-1 text-sm text-gray-400">
          累计完成 {completed} 个专注 · 今日 {todayFocus} 个
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-44"
          disabled={running}
        >
          <option value="">不限课程</option>
          {courses.items.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        {!running ? (
          <Button onClick={start}>{secondsLeft === 0 ? "重新开始" : "开始"}</Button>
        ) : (
          <Button variant="secondary" onClick={pause}>暂停</Button>
        )}
      </div>
    </Card>
  );
}