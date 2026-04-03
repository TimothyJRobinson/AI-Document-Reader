"use client";

import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";

export default function UploadPage() {
  const router = useRouter();

  const handleUploadSuccess = (documentId) => {
    console.log("document_id received:", documentId);
    alert("Upload worked! document_id: " + documentId);
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "#0f1117"
    }}>
      <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#f0f0f0", marginBottom: "8px" }}>
        Document reader
      </h1>
      <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "2rem" }}>
        Upload a document and ask questions about it
      </p>
      <UploadZone onUploadSuccess={handleUploadSuccess} />
    </main>
  );
}