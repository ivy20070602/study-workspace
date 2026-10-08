import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import BackgroundFX from "@/components/layout/BackgroundFX";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "飞猪多学习工作台",
    template: "%s | 飞猪多",
  },
  description: "飞猪多个人学习工作台：每日例行、课表、课件、笔记、练习、日记与截止日期管理。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <BackgroundFX />
        <ThemeProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}