import Link from "next/link";
import TodayOverview from "@/components/dashboard/TodayOverview";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import Card from "@/components/ui/Card";

const quickLinks = [
  { href: "/schedule", label: "课表", desc: "查看本周课程安排", icon: "📅" },
  { href: "/courses", label: "课程", desc: "笔记、课件、练习", icon: "📚" },
  { href: "/todos", label: "待办", desc: "要完成的小事", icon: "✅" },
  { href: "/deadlines", label: "截止日期", desc: "作业、考试提醒", icon: "⏰" },
  { href: "/journal", label: "日记", desc: "记录每天的学习", icon: "📓" },
  { href: "/search", label: "全局搜索", desc: "一搜即达", icon: "🔍" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">我的学习工作台</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              上课、笔记、课件、练习、截止日期，一站式管理。
            </p>
          </div>
          <TodayOverview />
        </div>
        <div>
          <PomodoroTimer />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickLinks.map((q) => (
              <Link key={q.href} href={q.href}>
                <Card className="h-full transition hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700">
                  <div className="text-2xl">{q.icon}</div>
                  <div className="mt-1 font-medium">{q.label}</div>
                  <div className="text-xs text-gray-400">{q.desc}</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}