"use client";

import { useRef, useState } from "react";
import type { Material } from "@/lib/schema";
import { useRepo, nowIso } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

function filetypeOf(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "PDF", ppt: "PPT", pptx: "PPTX", doc: "Word", docx: "Word",
    xls: "Excel", xlsx: "Excel", txt: "文本", md: "Markdown",
    mp3: "音频", mp4: "视频", wav: "音频",
  };
  return map[ext] ?? (ext.toUpperCase() || "文件");
}

export default function MaterialsPanel({ courseId }: { courseId: number }) {
  const materials = useRepo<Material>("materials");
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const courseMaterials = materials.items.filter((m) => m.course_id === courseId);

  function startRename(m: Material) {
    setRenamingId(m.id);
    setRenameValue(m.filename);
  }

  function saveRename() {
    if (renamingId === null) return;
    const name = renameValue.trim();
    if (!name) {
      setRenamingId(null);
      return;
    }
    materials.patch(renamingId, { filename: name });
    setRenamingId(null);
  }

  function upload(file: File) {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      materials.add({
        course_id: courseId,
        filename: file.name,
        filepath: null,
        dataUrl,
        filetype: file.type || filetypeOf(file.name),
        uploaded_at: nowIso(),
      });
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
      alert("读取文件失败");
    };
    reader.readAsDataURL(file);
  }

  function remove(m: Material) {
    if (!confirm(`删除资料「${m.filename}」？`)) return;
    materials.remove(m.id);
    if (previewId === m.id) setPreviewId(null);
  }

  const preview = courseMaterials.find((m) => m.id === previewId) ?? null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <Button disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "上传中…" : "+ 上传课件/资料"}
          </Button>
          <span className="text-xs text-gray-400">支持 PDF、PPT、Word、图片等，保存在本机浏览器</span>
        </div>
      </Card>

      {courseMaterials.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-gray-400">还没有课件资料</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {courseMaterials.map((m) => (
            <Card key={m.id} className="flex items-center gap-3 !p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                {renamingId === m.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="px-2 py-1 text-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div className="truncate text-sm font-medium">{m.filename}</div>
                    <div className="text-xs text-gray-400">
                      {filetypeOf(m.filename)} · {m.uploaded_at.slice(0, 10)}
                    </div>
                  </>
                )}
              </div>
              {renamingId === m.id ? (
                <>
                  <button
                    onClick={saveRename}
                    className="rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setRenamingId(null)}
                    className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-gray-600"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startRename(m)}
                    className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-gray-600"
                  >
                    重命名
                  </button>
                  {m.dataUrl && (
                    <a
                      href={m.dataUrl}
                      download={m.filename}
                      className="rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      下载
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewId(previewId === m.id ? null : m.id)}
                    className={`rounded-lg px-2 py-1 text-sm ${
                      previewId === m.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    预览
                  </button>
                  <button
                    onClick={() => remove(m)}
                    className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-red-500"
                  >
                    删除
                  </button>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {preview && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">{preview.filename}</div>
            <Button variant="ghost" onClick={() => setPreviewId(null)}>
              关闭预览
            </Button>
          </div>
          {(() => {
            const d = preview.dataUrl ?? "";
            const isPdf = preview.filetype === "pdf" || d.startsWith("data:application/pdf");
            const isImage = (preview.filetype ?? "").startsWith("image/") || d.startsWith("data:image/");
            if (isPdf && d) {
              return (
                <iframe
                  src={d}
                  className="h-150 w-full rounded-lg border border-gray-200 dark:border-gray-700"
                  title={preview.filename}
                />
              );
            }
            if (isImage && d) {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d}
                  alt={preview.filename}
                  className="mx-auto max-h-150 rounded-lg"
                />
              );
            }
            return (
              <p className="py-8 text-center text-sm text-gray-400">
                该格式暂不支持在线预览，请下载查看。
              </p>
            );
          })()}
        </Card>
      )}
    </div>
  );
}