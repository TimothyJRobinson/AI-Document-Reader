from fastapi import FastAPI
from routes import upload, ask, documents

app = FastAPI()

app.include_router(upload.router)
app.include_router(ask.router)
app.include_router(documents.router)