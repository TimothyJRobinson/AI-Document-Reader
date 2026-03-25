from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

STRICT_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are a document assistant. Answer ONLY using the context below.
If the answer is not in the context, say "I could not find that in the document."

Context: {context}
Question: {question}
Answer:"""
)

def load_llm():
    return HuggingFaceEndpoint(
        repo_id="mistralai/Mistral-7B-Instruct-v0.2",
        huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_TOKEN"),
        max_new_tokens=256,
    )

def answer_question(document_id: str, question: str):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = FAISS.load_local(
        f"indexes/{document_id}",
        embeddings,
        allow_dangerous_deserialization=True
    )

    chain = RetrievalQA.from_chain_type(
        llm=load_llm(),
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        chain_type_kwargs={"prompt": STRICT_PROMPT}
    )

    return chain.invoke(question)