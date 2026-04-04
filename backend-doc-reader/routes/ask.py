from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.retrieval import answer_question
import traceback
import os

router = APIRouter()

class AskRequest(BaseModel):
    document_id: str
    question: str

@router.post("/ask")
async def ask(request: AskRequest):
    index_path = f"indexes/{request.document_id}"

    if not os.path.exists(index_path):
        raise HTTPException(
            status_code=404,
            detail="Document not found. Please upload a document first."
        )

    try:
        result = answer_question(request.document_id, request.question)
        answer = result.get("result", "") if isinstance(result, dict) else str(result)

        return {
            "answer": answer,
            "document_id": request.document_id,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error answering question: {str(e)}")