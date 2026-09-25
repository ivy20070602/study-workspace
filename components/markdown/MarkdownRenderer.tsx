import { ReactNode } from "react";

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-700"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderBlock(line: string, key: number): ReactNode {
  if (line.startsWith("### ")) {
    return (
      <h3 key={key} className="mt-3 text-base font-semibold">
        {renderInline(line.slice(4))}
      </h3>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h2 key={key} className="mt-4 text-lg font-semibold">
        {renderInline(line.slice(3))}
      </h2>
    );
  }
  if (line.startsWith("# ")) {
    return (
      <h1 key={key} className="mt-4 text-xl font-semibold">
        {renderInline(line.slice(2))}
      </h1>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <li key={key} className="ml-5 list-disc">
        {renderInline(line.slice(2))}
      </li>
    );
  }
  if (/^\d+\.\s/.test(line)) {
    return (
      <li key={key} className="ml-5 list-decimal">
        {renderInline(line.replace(/^\d+\.\s/, ""))}
      </li>
    );
  }
  if (line.startsWith("> ")) {
    return (
      <blockquote key={key} className="border-l-2 border-gray-300 pl-3 text-gray-600 dark:border-gray-600 dark:text-gray-400">
        {renderInline(line.slice(2))}
      </blockquote>
    );
  }
  if (line.trim() === "") {
    return <div key={key} className="h-2" />;
  }
  return (
    <p key={key} className="my-1">
      {renderInline(line)}
    </p>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  return <div className="text-sm leading-relaxed">{lines.map(renderBlock)}</div>;
}