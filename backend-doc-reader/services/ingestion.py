import os
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

INDEX_DIR = "tmp/indexes"

# --- Parsers ---
def parse_pdf(file) -> str:
    from pypdf import PdfReader
    reader = PdfReader(file)
    return "\n".join(page.extract_text() or "" for page in reader.pages)

def parse_docx(file) -> str:
    from docx import Document
    doc = Document(file)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

def parse_txt(file) -> str:
    return file.read().decode("utf-8", errors="ignore")

PARSERS = {
    "pdf": parse_pdf,
    "docx": parse_docx,
    "txt": parse_txt,
}

# --- Main Pipeline ---
def ingest_document(file, document_id: str):
    ext = file.filename.rsplit(".", 1)[1].lower()
    parser = PARSERS.get(ext)

    if not parser:
        raise ValueError(f"Unsupported file type: {ext}")

    # 1. Parse
    raw_text = parser(file)
    if not raw_text.strip():
        raise ValueError("Document appears to be empty or unreadable")

    # 2. Chunk
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    chunks = splitter.create_documents([raw_text])

    # 3. Embed
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # 4. Build + Save FAISS index
    vectorstore = FAISS.from_documents(chunks, embeddings)
    index_path = os.path.join(INDEX_DIR, document_id)
    Path(index_path).mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(index_path)