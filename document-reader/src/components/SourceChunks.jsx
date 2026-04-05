"use client";
import { useState } from "react";

export default function SourceChunks({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? "rotate-90" : "rotate-0"}`}
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        {sources.length} source{sources.length !== 1 ? "s" : ""}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {sources.map((s, i) => (
            <div
              key={i}
              className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2"
            >
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1 uppercase tracking-wide">
                Chunk {i + 1}{s.metadata?.page != null ? ` · page ${s.metadata.page + 1}` : ""}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {s.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}