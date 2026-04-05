"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./UploadZone.module.css";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_SIZE = 20 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function isValidFile(file) {
  const ext = "." + file.name.split(".").pop().toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) && file.size <= MAX_SIZE;
}

export default function UploadZone({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((incoming) => {
    if (!isValidFile(incoming)) {
      setError("Only PDF, DOCX, and TXT files under 20MB are supported.");
      setFile(null);
      return;
    }
    setError("");
    setStatus("");
    setFile(incoming);
  }, []);

  const clearFile = () => {
    setFile(null);
    setError("");
    setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus("Uploading...");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setStatus("Upload successful! Redirecting...");
      // Pass both document_id and the original filename
      onUploadSuccess(data.document_id, file.name);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setStatus("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropZone} ${dragging ? styles.dragging : ""} ${file ? styles.hasFile : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p className={styles.label}>
          Drag and drop your file here or{" "}
          <span className={styles.browse} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            browse
          </span>
        </p>
        <p className={styles.fileTypes}>PDF · DOCX · TXT &nbsp;·&nbsp; max 20MB</p>
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleInputChange} className={styles.hiddenInput} />
      </div>

      {file && (
        <div className={styles.filePreview}>
          <div className={styles.fileIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>{file.name}</p>
            <p className={styles.fileSize}>{formatSize(file.size)}</p>
          </div>
          <button className={styles.removeBtn} onClick={clearFile}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {file && (
        <button className={styles.uploadBtn} onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload document"}
        </button>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}