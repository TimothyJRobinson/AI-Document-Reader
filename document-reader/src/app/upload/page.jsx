"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/context/DocumentContext";
import UploadZone from "@/components/UploadZone";
import ChatSidebar from "@/components/ChatSidebar";

export default function UploadPage() {
  const router = useRouter();
  const { setDocumentId, setDocumentName } = useDocument();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleUploadSuccess = (documentId, fileName) => {
    setDocumentId(documentId);
    setDocumentName(fileName);
    router.push(`/chat?document_id=${documentId}`);
  };

  function handleSelectSession(docId) {
    router.push(`/chat?document_id=${docId}`);
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950">

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChatSidebar
        open={sidebarOpen}
        currentDocumentId={null}
        onSelect={handleSelectSession}
        onClose={() => setSidebarOpen(false)}
      />

      {/* History toggle button — top left */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="fixed top-4 left-4 z-30 w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        title="Chat history"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <h1 className="text-3xl font-medium text-zinc-100 mb-2">DocuChat</h1>
      <p className="text-sm text-zinc-500 mb-8">What do you want me to look at?</p>
      <UploadZone onUploadSuccess={handleUploadSuccess} />
    </main>
  );
}