from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, ask, documents
from services.storage import init_db
import os
import uuid

app = FastAPI()

# Ensure folder exists
os.makedirs("tmp/indexes", exist_ok=True)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware
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

# Startup event
@app.on_event("startup")
def startup():
    init_db()

# Routers
app.include_router(upload.router)
app.include_router(ask.router)
app.include_router(documents.router)