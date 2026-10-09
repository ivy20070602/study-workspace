"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Variant = "up" | "left" | "right" | "zoom";

const hiddenStates: Record<Variant, string> = {
  up: "translate-y-6 opacity-0",
  left: "-translate-x-6 opacity-0",
  right: "translate-x-6 opacity-0",
  zoom: "scale-90 opacity-0",
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out will-change-transform ${
        shown
          ? "translate-x-0 translate-y-0 scale-100 opacity-100"
          : hiddenStates[variant]
      } ${className}`}
    >
      {children}
    </div>
  );
}