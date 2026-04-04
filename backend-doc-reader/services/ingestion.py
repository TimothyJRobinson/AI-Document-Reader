from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

import os
from pathlib import Path

INDEXES_DIR = "indexes"
INDEX_DIR = "tmp/indexes"

os.makedirs(INDEXES_DIR, exist_ok=True)
os.makedirs(INDEX_DIR, exist_ok=True)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def get_loader(file_path: str, ext: str):
    if ext == ".pdf":
        return PyPDFLoader(file_path)
    elif ext == ".docx":
        return Docx2txtLoader(file_path)
    elif ext == ".txt":
        return TextLoader(file_path, encoding="utf-8")
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

def ingest_document_from_path(file_path: str, document_id: str, ext: str):
    loader = get_loader(file_path, ext)
    docs = loader.load()

    if not docs:
        raise ValueError("Document appears to be empty or could not be parsed")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    chunks = splitter.split_documents(docs)

    if not chunks:
        raise ValueError("No chunks were produced from the document")

    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(os.path.join(INDEXES_DIR, document_id))

    return document_id

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

def ingest_document(file, document_id: str):
    ext = file.filename.rsplit(".", 1)[1].lower()
    parser = PARSERS.get(ext)

    if not parser:
        raise ValueError(f"Unsupported file type: {ext}")

    raw_text = parser(file)
    if not raw_text.strip():
        raise ValueError("Document appears to be empty or unreadable")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""],
    )

    chunks = splitter.create_documents([raw_text])

    vectorstore = FAISS.from_documents(chunks, embeddings)

    index_path = os.path.join(INDEX_DIR, document_id)
    Path(index_path).mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(index_path)

    return document_id