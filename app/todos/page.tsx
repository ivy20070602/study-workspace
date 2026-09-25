import type { Metadata } from "next";
import TodosManager from "@/components/todos/TodosManager";

export const metadata: Metadata = { title: "待办" };

export default function TodosPage() {
  return <TodosManager />;
}