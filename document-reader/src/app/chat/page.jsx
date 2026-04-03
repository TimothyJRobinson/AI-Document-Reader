"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDocument } from "@/context/DocumentContext";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { documentId, setDocumentId } = useDocument();

  // Pick up document_id from URL if context is empty (e.g. hard refresh)
  useEffect(() => {
    const id = searchParams.get("document_id");
    if (id && !documentId) setDocumentId(id);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      <ChatWindow />
    </div>
  );
}