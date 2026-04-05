"use client";
import { createContext, useContext, useState } from "react";

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [documentId, setDocumentId] = useState(null);
  const [documentName, setDocumentName] = useState("");
  return (
    <DocumentContext.Provider value={{ documentId, setDocumentId, documentName, setDocumentName }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}