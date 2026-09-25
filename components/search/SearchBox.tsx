"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { SearchResult } from "@/lib/schema";
import { searchAll } from "@/lib/store";

const KIND_LABEL: Record<string, string> = {
  course: "课程",
  note: "笔记",
  exercise: "练习",
  journal: "日记",
  deadline: "截止日期",
  material: "资料",
  todo: "待办",
};

const KIND_COLOR: Record<string, string> = {
  course: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  note: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  exercise: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  journal: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  deadline: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  material: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  todo: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setResults(searchAll(query));
    setSearched(true);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索课程、笔记、练习、日记、截止日期…"
          className="flex-1"
          autoFocus
        />
        <Button type="submit" disabled={!query.trim()}>
          搜索
        </Button>
      </form>

      {searched && (
        <>
          <p className="text-sm text-gray-400">找到 {results.length} 条结果</p>
          {results.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm text-gray-400">
                没有找到与「{query}」相关的内容
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <Link key={`${r.kind}-${r.id}-${i}`} href={r.href}>
                  <Card className="transition hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700">
                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${KIND_COLOR[r.kind]}`}>
                        {KIND_LABEL[r.kind]}
                      </span>
                      <span className="truncate text-sm font-medium">{r.title}</span>
                    </div>
                    {(r.snippet || r.courseName) && (
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {r.courseName ? `${r.courseName} · ` : ""}
                        {r.snippet}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}