"use client";
import { createContext, useContext, useState } from "react";

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [documentId, setDocumentId] = useState(null);
  return (
    <DocumentContext.Provider value={{ documentId, setDocumentId }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}