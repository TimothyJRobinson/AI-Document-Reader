"use client";
import { useState } from "react";

export default function SourceChunks({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
      >
        {open ? "▾" : "▸"} {sources.length} source{sources.length !== 1 ? "s" : ""}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {sources.map((s, i) => (
            <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
              <p className="text-xs text-zinc-400 mb-1">
                Chunk {i + 1}{s.metadata?.page != null ? ` · p.${s.metadata.page + 1}` : ""}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}