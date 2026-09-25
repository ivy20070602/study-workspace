"use client";

import { COLORS } from "@/lib/colors";

export default function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={`h-8 w-8 rounded-full ${value === c.value ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900" : ""}`}
          style={{ backgroundColor: c.value }}
          aria-label={c.name}
          title={c.name}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded-full border border-gray-300"
        title="自定义颜色"
      />
    </div>
  );
}