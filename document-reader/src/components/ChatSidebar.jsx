"use client";
import { useEffect, useState } from "react";

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ChatSidebar({ open, currentDocumentId, onSelect, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("chat_history");
    if (raw) {
      try { setHistory(JSON.parse(raw)); } catch {}
    }
  }, [open]);

  function deleteSession(e, docId) {
    e.stopPropagation();
    const updated = history.filter(h => h.documentId !== docId);
    setHistory(updated);
    localStorage.setItem("chat_history", JSON.stringify(updated));
    localStorage.removeItem(`chat_${docId}`);
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-250 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          History
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2">
        {history.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-8 px-4 leading-relaxed">
            No previous chats yet. Upload a document to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {history.map(h => (
              <li
                key={h.documentId}
                onClick={() => onSelect(h.documentId)}
                className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  h.documentId === currentDocumentId
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                {/* Icon */}
                <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 flex-shrink-0 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                    {h.preview || "Document chat"}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {timeAgo(h.startedAt)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={e => deleteSession(e, h.documentId)}
                  className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all flex-shrink-0"
                  title="Remove"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}