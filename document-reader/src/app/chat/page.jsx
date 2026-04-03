"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDocument } from "@/context/DocumentContext";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { documentId, setDocumentId } = useDocument();

  useEffect(() => {
    const id = searchParams.get("document_id");
    if (id && !documentId) {
      setDocumentId(id);
    } else if (!id && !documentId) {
      router.replace("/upload");
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      <ChatWindow />
    </div>
  );
}