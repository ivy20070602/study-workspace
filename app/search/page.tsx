import type { Metadata } from "next";
import SearchBox from "@/components/search/SearchBox";

export const metadata: Metadata = { title: "搜索" };

export default function SearchPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">全局搜索</h1>
      <SearchBox />
    </div>
  );
}