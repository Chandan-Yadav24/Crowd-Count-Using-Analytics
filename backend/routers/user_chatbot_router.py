from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.models import User, Video, Zone, AnalysisResult
import os
from groq import Groq

router = APIRouter(prefix="/api/user-chatbot", tags=["user-chatbot"])

class UserChatRequest(BaseModel):
    message: str
    username: str

def get_user_database_context(db: Session, username: str) -> str:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return f"User '{username}' not found."
    
    user_id = user.id
    videos = db.query(Video).filter(Video.user_id == user_id).all()
    zones = db.query(Zone).filter(Zone.user_id == user_id).all()
    analyses = db.query(AnalysisResult).filter(AnalysisResult.user_id == user_id).all()
    
    context = f"User Information:\n- Username: {user.username}\n- Email: {user.email}\n- Role: {user.role}\n\n"
    context += f"Videos ({len(videos)} total):\n"
    for v in videos[:5]:
        context += f"- {v.filename} (ID: {v.id}, Status: {v.status})\n"
    
    context += f"\nZones ({len(zones)} total):\n"
    for z in zones[:5]:
        context += f"- {z.name} (Video ID: {z.video_id})\n"
    
    context += f"\nAnalyses ({len(analyses)} total):\n"
    for a in analyses[:5]:
        context += f"- Video ID: {a.video_id}, Count: {a.crowd_count}, Status: {a.status}\n"
    
    return context

@router.post("/chat")
async def user_chat(request: UserChatRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == request.username).first()
        if not user:
            return {"response": "User not found. Please log in again."}
        
        user_id = user.id
        context = get_user_database_context(db, request.username)
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            try:
                client = Groq(api_key=groq_api_key)
                system_prompt = f"""You are Crowdy, a personal assistant for {request.username}. 
You can ONLY access and discuss data belonging to {request.username}. 
Never show information about other users or system-wide statistics.

{context}

Answer questions about:
- Their videos, zones, and analyses only
- Their personal statistics only
- Help with their account

If asked about other users or system data, politely decline and say you can only access their personal data."""

                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.message}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                return {"response": completion.choices[0].message.content}
            except Exception:
                pass
        
        # Fallback pattern matching
        msg = request.message.lower()
        
        if any(word in msg for word in ["user", "total user", "all user", "how many user"]):
            return {"response": "I can only access your personal data. I cannot provide information about other users or system statistics."}
        
        if "video" in msg:
            videos = db.query(Video).filter(Video.user_id == user_id).all()
            return {"response": f"You have {len(videos)} video(s) uploaded."}
        
        if "zone" in msg:
            zones = db.query(Zone).filter(Zone.user_id == user_id).all()
            return {"response": f"You have {len(zones)} zone(s) configured."}
        
        if "analys" in msg or "result" in msg:
            analyses = db.query(AnalysisResult).filter(AnalysisResult.user_id == user_id).all()
            return {"response": f"You have {len(analyses)} analysis result(s)."}
        
        return {"response": "I can help you with your videos, zones, analyses, and personal statistics. What would you like to know?"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
