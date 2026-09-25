import type { Metadata } from "next";
import JournalManager from "@/components/journal/JournalManager";

export const metadata: Metadata = { title: "日记" };

export default function JournalPage() {
  return <JournalManager />;
}