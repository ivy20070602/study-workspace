import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border-2 border-ink bg-card p-4 shadow-[3px_3px_0_0_var(--color-ink)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)] ${className}`}
    >
      {children}
    </div>
  );
}