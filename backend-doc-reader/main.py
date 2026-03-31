from flask import Flask
from routes.upload import upload_bp
from routes.ask import ask_bp
from routes.documents import documents_bp
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, ask, documents
from services.storage import init_db
import uuid

app = Flask(__name__)

app.register_blueprint(upload_bp)
app.register_blueprint(ask_bp)
app.register_blueprint(documents_bp)

if __name__ == "__main__":
    os.makedirs("tmp/indexes", exist_ok=True)
    app.run(debug=True)


## `requirements.txt`

flask
pypdf
python-docx
langchain
langchain-community
faiss-cpu
sentence-transformers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def session_middleware(request: Request, call_next):
    session_id = request.cookies.get("session_id")
    response = await call_next(request)
    if not session_id:
        response.set_cookie(
            key="session_id",
            value=str(uuid.uuid4()),
            httponly=True,
            samesite="lax",
            max_age=60 * 60 * 24 * 7,
        )
    return response

@app.on_event("startup")
def startup():
    init_db()

app.include_router(upload.router)
app.include_router(ask.router)
app.include_router(documents.router)
