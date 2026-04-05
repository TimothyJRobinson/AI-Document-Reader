"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/context/DocumentContext";
import { askQuestion } from "@/lib/apiClient";
import MessageBubble from "./MessageBubble";
import ChatSidebar from "./ChatSidebar";

export default function ChatWindow() {
  const { documentId, setDocumentId, documentName } = useDocument();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const router = useRouter();

  // Load messages for this session from localStorage
  useEffect(() => {
    if (!documentId) return;
    const saved = localStorage.getItem(`chat_${documentId}`);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch {}
    }
  }, [documentId]);

  // Persist messages and update history index
  useEffect(() => {
    if (!documentId || messages.length === 0) return;
    localStorage.setItem(`chat_${documentId}`, JSON.stringify(messages));

    const raw = localStorage.getItem("chat_history");
    const history = raw ? JSON.parse(raw) : [];
    const exists = history.find(h => h.documentId === documentId);
    if (!exists) {
      history.unshift({
        documentId,
        startedAt: new Date().toISOString(),
        preview: documentName || "Untitled document",
      });
      localStorage.setItem("chat_history", JSON.stringify(history.slice(0, 20)));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const q = input.trim();
    if (!q || loading || !documentId) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const data = await askQuestion(documentId, q);
      setMessages(prev => [...prev, { role: "ai", content: data.answer, sources: data.sources }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", content: `Error: ${e.message}`, sources: [] }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectSession(docId, docName) {
    setDocumentId(docId);
    setMessages([]);
    setSidebarOpen(false);
    router.push(`/chat?document_id=${docId}`);
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden">

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChatSidebar
        open={sidebarOpen}
        currentDocumentId={documentId}
        onSelect={handleSelectSession}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
  <div className="flex items-center gap-3">
    <button
      onClick={() => setSidebarOpen(o => !o)}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      title="Chat history"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <span className="text-sm font-semibold tracking-tight">
      {documentName || "Document Chat"}
    </span>
    
    <button
      onClick={() => router.push("/upload")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      New document
    </button>
  </div>
</header>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-20 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">Ask anything about your document</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed">I'll search the relevant sections and answer based on what's in the file.</p>
              </div>
            )}

            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}

            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-zinc-800 dark:bg-zinc-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                  A
                </div>
                <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-900 flex-shrink-0">
          <div className="max-w-2xl mx-auto flex gap-2 items-center">
            <input
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 transition-colors"
              placeholder={documentId ? "Ask a question about your document…" : "No document loaded"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading || !documentId}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading || !documentId}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}