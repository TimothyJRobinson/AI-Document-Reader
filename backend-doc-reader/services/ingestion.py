from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

INDEXES_DIR = "indexes"
os.makedirs(INDEXES_DIR, exist_ok=True)

# Reuse the same embedding model across calls — avoids reloading every time
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def get_loader(file_path: str, ext: str):
    if ext == ".pdf":
        return PyPDFLoader(file_path)
    elif ext == ".docx":
        return Docx2txtLoader(file_path)
    elif ext == ".txt":
        return TextLoader(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

def ingest_document(file_path: str, document_id: str, ext: str):
    # Load the document
    loader = get_loader(file_path, ext)
    docs = loader.load()

    if not docs:
        raise ValueError("Document appears to be empty or could not be parsed")

    # Chunk the text
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = splitter.split_documents(docs)

    if not chunks:
        raise ValueError("No chunks were produced from the document")

    # Embed and save FAISS index
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(os.path.join(INDEXES_DIR, document_id))

    return document_id