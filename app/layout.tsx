import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Deutsch Lernen",
    template: "%s | Deutsch Lernen",
  },
  description:
    "A focused German vocabulary learning companion — German-only definitions, CEFR levels, and examples.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Deutsch Lernen
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100">
                Vocabulary
              </Link>
              <Link href="/words" className="hover:text-gray-900 dark:hover:text-gray-100">
                Browse
              </Link>
              <Link href="/practice" className="hover:text-gray-900 dark:hover:text-gray-100">
                Practice
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
