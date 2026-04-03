"use client";
import { useState, useRef, useEffect } from "react";
import { useDocument } from "@/context/DocumentContext";
import { askQuestion } from "@/lib/apiClient";
import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const { documentId } = useDocument();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

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

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-center text-zinc-400 text-sm mt-20">Ask a question about your document</p>
          )}
          {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex-shrink-0" />
              <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-100 px-4 py-3 bg-white">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            className="flex-1 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-400 disabled:opacity-50"
            placeholder={documentId ? "Ask a question…" : "No document loaded"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={loading || !documentId}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || !documentId}
            className="bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}