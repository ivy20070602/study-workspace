import type { Metadata } from "next";
import StatsDashboard from "@/components/dashboard/StatsDashboard";

export const metadata: Metadata = { title: "学习小数据" };

export default function StatsPage() {
  return (
    <div className="space-y-4">
      <StatsDashboard />
    </div>
  );
}