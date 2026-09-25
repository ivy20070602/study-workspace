"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useTheme } from "@/components/layout/ThemeProvider";
import { exportAll, importAll, resetAll, type WorkspaceExport } from "@/lib/store";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function onExport() {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: "已导出备份文件。" });
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result)) as WorkspaceExport;
        const res = importAll(json);
        setMessage(
          res.ok
            ? { ok: true, text: "导入成功！数据已写入这个浏览器。" }
            : { ok: false, text: res.error ?? "导入失败" }
        );
      } catch {
        setMessage({ ok: false, text: "不是有效的 JSON 备份文件" });
      }
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function onReset() {
    if (!confirm("确定清空这个浏览器里的全部数据？此操作不可撤销，建议先导出备份。")) return;
    resetAll();
    setMessage({ ok: true, text: "已清空全部数据。" });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">设置</h1>

      <Card>
        <h2 className="mb-2 font-semibold">外观</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">深色模式</p>
            <p className="text-xs text-gray-400">跟随系统或手动切换</p>
          </div>
          <Button variant="secondary" onClick={toggle}>
            {theme === "dark" ? "切换到浅色" : "切换到深色"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">数据</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">导出全部数据</p>
              <p className="text-xs text-gray-400">导出为 JSON 文件备份，可导入到其他设备</p>
            </div>
            <Button onClick={onExport}>导出</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">导入备份</p>
              <p className="text-xs text-gray-400">从 JSON 备份恢复（覆盖当前浏览器数据）</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onImportFile}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              导入
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">清空全部数据</p>
              <p className="text-xs text-gray-400">删除这个浏览器里的所有数据</p>
            </div>
            <Button variant="danger" onClick={onReset}>清空</Button>
          </div>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${message.ok ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
        <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-gray-700">
          所有数据保存在当前浏览器本地存储（localStorage）。换设备或浏览器后，请用「导出 → 导入」迁移数据。
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">关于</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          学习工作台 v1.0 · Next.js 16 静态版 · 数据保存在浏览器本地
        </p>
      </Card>
    </div>
  );
}