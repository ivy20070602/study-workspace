import type { Metadata } from "next";
import DeadlinesManager from "@/components/deadlines/DeadlinesManager";

export const metadata: Metadata = { title: "截止日期" };

export default function DeadlinesPage() {
  return <DeadlinesManager />;
}