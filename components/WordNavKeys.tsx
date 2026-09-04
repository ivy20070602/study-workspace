"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function WordNavKeys({ prevId, nextId }: { prevId: number | null; nextId: number | null }) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && prevId !== null) {
        e.preventDefault();
        router.push(`/words/${prevId}`);
      } else if (e.key === "ArrowRight" && nextId !== null) {
        e.preventDefault();
        router.push(`/words/${nextId}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router]);

  return null;
}
