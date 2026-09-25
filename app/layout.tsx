import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "学习工作台",
    template: "%s | 学习工作台",
  },
  description: "个人学习工作台：课表、课件、笔记、练习、日记与截止日期管理。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}