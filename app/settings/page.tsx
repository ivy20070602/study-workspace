import type { Metadata } from "next";
import SettingsPage from "./SettingsPage";

export const metadata: Metadata = { title: "设置" };

export default function Page() {
  return <SettingsPage />;
}