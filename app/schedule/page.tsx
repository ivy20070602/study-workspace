import type { Metadata } from "next";
import ScheduleManager from "@/components/schedule/ScheduleManager";

export const metadata: Metadata = { title: "课表" };

export default function SchedulePage() {
  return <ScheduleManager />;
}