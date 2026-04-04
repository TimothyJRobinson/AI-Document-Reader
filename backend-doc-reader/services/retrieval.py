from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import requests
import os

load_dotenv()

HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"
HF_MODEL = "openai/gpt-oss-20b:groq"

def query_llm(context: str, question: str) -> str:
    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": HF_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a document assistant. Answer ONLY using the provided context. If the answer is not in the context, say 'I could not find that in the document.'"
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}"
            }
        ],
        "max_tokens": 256,
        "stream": False,
    }

    response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)

    if not response.ok:
        print("HF ERROR:", response.text)
        response.raise_for_status()

    result = response.json()
    return result["choices"][0]["message"]["content"].strip()


def answer_question(document_id: str, question: str):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.load_local(
        f"indexes/{document_id}",
        embeddings,
        allow_dangerous_deserialization=True
    )

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    docs = retriever.invoke(question)
    context = "\n\n".join(doc.page_content for doc in docs)

    answer = query_llm(context, question)

    return {
        "result": answer,
        "source_documents": [doc.page_content for doc in docs]
    }