"use client";

const PUNCT = /[«»"',!.?;:()[\]{}\-–—/\\|@#$%^&*+=<>`~]/g;

export function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query) {
    return <>{text}</>;
  }

  const lower = text.toLowerCase();
  const q = query.toLowerCase().replace(PUNCT, "").trim();
  if (!q) return <>{text}</>;

  const start = lower.indexOf(q);
  if (start === -1) return <>{text}</>;

  const end = start + q.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-yellow-100 px-0.5 text-inherit dark:bg-yellow-900/60">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}
