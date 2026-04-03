const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function askQuestion(documentId, question) {
  const res = await fetch(`${BASE}/ask`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId, question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json(); // { answer, sources, document_id }
}