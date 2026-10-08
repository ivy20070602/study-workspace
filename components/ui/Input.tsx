import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const base =
  "w-full rounded-2xl border-2 border-ink/60 bg-card px-3.5 py-2 text-sm text-ink placeholder:text-ink/40 transition focus:border-candy-400 focus:outline-none focus:ring-2 focus:ring-candy-300/50 dark:border-ink/30 dark:focus:border-candy-400 dark:focus:ring-candy-500/40";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={base} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} font-mono`} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={base} {...props} />;
}