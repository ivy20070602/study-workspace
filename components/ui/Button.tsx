import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "border-ink bg-gradient-to-r from-candy-500 via-candy-400 to-peachy-400 text-white shadow-[2px_2px_0_0_var(--color-ink)] hover:shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5",
  secondary:
    "border-ink bg-card text-ink shadow-[2px_2px_0_0_var(--color-ink)] hover:shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5",
  danger:
    "border-ink bg-gradient-to-r from-red-500 to-candy-600 text-white shadow-[2px_2px_0_0_var(--color-ink)] hover:shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5",
  ghost:
    "border-transparent text-ink/70 hover:bg-candy-100 dark:hover:bg-night-700",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}