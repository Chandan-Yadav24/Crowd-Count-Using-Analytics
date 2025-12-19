from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import User, Video, Zone, AnalysisResult
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

class ChatRequest(BaseModel):
    message: str
    username: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    data: dict = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_admin_database_context(db: Session):
    """Get global database state for Admin context"""
    try:
        users = db.query(User).all()
        user_details = "\n".join([f"  - {u.username} ({u.email}) - Role: {u.role}" for u in users[:10]])
        
        videos = db.query(Video).order_by(Video.id.desc()).limit(10).all()
        video_details = "\n".join([f"  - {v.filename} (Status: {v.status}, User ID: {v.user_id})" for v in videos])
        
        zones = db.query(Zone).all()
        zone_details = "\n".join([f"  - Zone ID: {z.id}, Video ID: {z.video_id}, Coordinates: {z.coordinates}" for z in zones[:10]])
        
        analyses = db.query(AnalysisResult).all()
        analysis_details = "\n".join([f"  - Video ID: {a.video_id}, Total Count: {a.total_count}, User ID: {a.user_id}" for a in analyses[:10]])
        avg_crowd = sum(a.total_count for a in analyses) / len(analyses) if analyses else 0
        max_crowd = max([a.total_count for a in analyses]) if analyses else 0
        
        return f"""DATABASE SUMMARY (ADMIN ACCESS):

USERS ({len(users)} total):
{user_details}

VIDEOS ({len(videos)} total, showing recent 10):
{video_details}

ZONES ({len(zones)} total):
{zone_details}

ANALYSIS RESULTS ({len(analyses)} total):
{analysis_details}

STATISTICS:
- Average Crowd Count: {avg_crowd:.1f}
- Maximum Crowd Count: {max_crowd}"""
    except Exception as e:
        return f"Database context unavailable: {str(e)}"

def get_user_database_context(db: Session, user: User):
    """Get restricted database state for User context"""
    try:
        videos = db.query(Video).filter(Video.user_id == user.id).all()
        zones = db.query(Zone).filter(Zone.user_id == user.id).all()
        analyses = db.query(AnalysisResult).filter(AnalysisResult.user_id == user.id).all()
        
        video_details = "\n".join([f"  - {v.filename} (Status: {v.status})" for v in videos[:5]])
        zone_details = "\n".join([f"  - {z.label} (Video ID: {z.video_id})" for z in zones[:5]])
        analysis_details = "\n".join([f"  - Video ID: {a.video_id}, Count: {a.total_count}" for a in analyses[:5]])
        
        return f"""DATABASE SUMMARY (USER: {user.username}):

YOUR VIDEOS ({len(videos)} total):
{video_details}

YOUR ZONES ({len(zones)} total):
{zone_details}

YOUR ANALYSIS RESULTS ({len(analyses)} total):
{analysis_details}"""
    except Exception as e:
        return f"Database context unavailable: {str(e)}"

def execute_query(query_type: str, db: Session, user: Optional[User] = None):
    """Execute database queries based on intent and user role"""
    try:
        # Admin / Global Queries
        if not user or user.role in ['admin', 'superadmin']:
            if query_type == "total_users":
                count = db.query(User).count()
                return {"count": count, "type": "users"}
            
            elif query_type == "total_videos":
                count = db.query(Video).count()
                return {"count": count, "type": "videos"}
            
            elif query_type == "total_analyses":
                count = db.query(AnalysisResult).count()
                return {"count": count, "type": "analyses"}
            
            elif query_type == "total_zones":
                count = db.query(Zone).count()
                return {"count": count, "type": "zones"}
            
            elif query_type == "list_users":
                users = db.query(User).all()
                return {"users": [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users]}
            
            elif query_type == "recent_videos":
                videos = db.query(Video).order_by(Video.id.desc()).limit(5).all()
                return {"videos": [{"id": v.id, "filename": v.filename, "status": v.status} for v in videos]}
            
            elif query_type == "avg_crowd_count":
                results = db.query(AnalysisResult).all()
                if results:
                    avg = sum(r.total_count for r in results) / len(results)
                    return {"average": round(avg, 2), "total_analyses": len(results)}
                return {"average": 0, "total_analyses": 0}
            
            elif query_type == "max_crowd_count":
                results = db.query(AnalysisResult).all()
                if results:
                    max_count = max(r.total_count for r in results)
                    max_result = next(r for r in results if r.total_count == max_count)
                    return {"max_count": max_count, "video_id": max_result.video_id}
                return {"max_count": 0}
            
            elif query_type == "user_stats":
                users = db.query(User).all()
                stats = []
                for u in users:
                    video_count = db.query(Video).filter(Video.user_id == u.id).count()
                    analysis_count = db.query(AnalysisResult).filter(AnalysisResult.user_id == u.id).count()
                    stats.append({
                        "username": u.username,
                        "videos": video_count,
                        "analyses": analysis_count
                    })
                return {"user_stats": stats}

        # Regular User Queries (Restricted)
        else:
            if query_type == "total_videos":
                count = db.query(Video).filter(Video.user_id == user.id).count()
                return {"count": count, "type": "your videos"}
            
            elif query_type == "total_analyses":
                count = db.query(AnalysisResult).filter(AnalysisResult.user_id == user.id).count()
                return {"count": count, "type": "your analyses"}
            
            elif query_type == "total_zones":
                count = db.query(Zone).filter(Zone.user_id == user.id).count()
                return {"count": count, "type": "your zones"}
            
            elif query_type == "recent_videos":
                videos = db.query(Video).filter(Video.user_id == user.id).order_by(Video.id.desc()).limit(5).all()
                return {"videos": [{"id": v.id, "filename": v.filename, "status": v.status} for v in videos]}
            
            elif query_type == "user_stats":
                 video_count = db.query(Video).filter(Video.user_id == user.id).count()
                 analysis_count = db.query(AnalysisResult).filter(AnalysisResult.user_id == user.id).count()
                 return {"user_stats": [{"username": "You", "videos": video_count, "analyses": analysis_count}]}

            # Blocked queries for users
            elif query_type in ["total_users", "list_users", "avg_crowd_count", "max_crowd_count"]:
                return {"error": "Access denied. You can only view your own data."}
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def analyze_intent(message: str):
    """Simple intent recognition"""
    message = message.lower()
    
    if any(word in message for word in ["how many users", "total users", "count users", "number of users"]):
        return "total_users"
    
    if any(word in message for word in ["how many videos", "total videos", "count videos", "number of videos", "my videos"]):
        return "total_videos"
    
    if any(word in message for word in ["how many analyses", "total analyses", "count analyses", "analysis count", "my analyses"]):
        return "total_analyses"
    
    if any(word in message for word in ["how many zones", "total zones", "count zones", "number of zones", "my zones"]):
        return "total_zones"
    
    if any(word in message for word in ["list users", "show users", "all users", "user list"]):
        return "list_users"
    
    if any(word in message for word in ["recent videos", "latest videos", "last videos", "show videos"]):
        return "recent_videos"
    
    if any(word in message for word in ["average crowd", "avg crowd", "mean crowd", "average count"]):
        return "avg_crowd_count"
    
    if any(word in message for word in ["maximum crowd", "max crowd", "highest crowd", "largest crowd"]):
        return "max_crowd_count"
    
    if any(word in message for word in ["user statistics", "user stats", "stats per user", "user activity", "my stats"]):
        return "user_stats"
    
    return None

def generate_response(intent: str, data: dict, user_role: str = 'user'):
    """Generate natural language response"""
    if "error" in data:
        return data["error"]

    if intent == "total_users":
        return f"There are currently {data['count']} registered users in the system."
    
    elif intent == "total_videos":
        prefix = "You have" if user_role == 'user' else "There are"
        suffix = "uploaded in total" if user_role != 'user' else "uploaded"
        return f"{prefix} {data['count']} videos {suffix}."
    
    elif intent == "total_analyses":
        prefix = "You have performed" if user_role == 'user' else "A total of"
        suffix = "analyses" if user_role == 'user' else "crowd analyses have been performed"
        return f"{prefix} {data['count']} {suffix}."
    
    elif intent == "total_zones":
        prefix = "You have" if user_role == 'user' else "There are"
        suffix = "zones configured"
        return f"{prefix} {data['count']} {suffix}."
    
    elif intent == "list_users":
        users = data['users']
        if not users:
            return "No users found in the system."
        user_list = "\n".join([f"- {u['username']} ({u['email']}) - Role: {u['role']}" for u in users])
        return f"Here are all the users:\n{user_list}"
    
    elif intent == "recent_videos":
        videos = data['videos']
        if not videos:
            return "No videos found."
        video_list = "\n".join([f"- {v['filename']} (Status: {v['status']})" for v in videos])
        return f"Here are the 5 most recent videos:\n{video_list}"
    
    elif intent == "avg_crowd_count":
        return f"The average crowd count across {data['total_analyses']} analyses is {data['average']} people."
    
    elif intent == "max_crowd_count":
        return f"The maximum crowd count recorded is {data['max_count']} people (Video ID: {data.get('video_id', 'N/A')})."
    
    elif intent == "user_stats":
        stats = data['user_stats']
        if not stats:
            return "No user statistics available."
        stats_list = "\n".join([f"- {s['username']}: {s['videos']} videos, {s['analyses']} analyses" for s in stats])
        return f"User activity statistics:\n{stats_list}"
    
    return "I understand your question, but I couldn't find the specific information."

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process chat message with AI and return response"""
    db = next(get_db())
    
    try:
        # Identify user
        user = None
        if request.username:
            user = db.query(User).filter(User.username == request.username).first()
        
        user_role = user.role if user else 'user' # Default to user if unknown, or maybe should be strict?
        # If user is not found but username provided, maybe treat as guest/user? 
        # For safety, if no user found, we treat as restricted user with no data.
        
        # Determine context based on role
        if user and user.role in ['admin', 'superadmin']:
            db_context = get_admin_database_context(db)
            system_prompt = f"""You are Crowdy, the System Administrator Assistant.
            
Current System Database State:
{db_context}

You have FULL ACCESS to all system data.
Provide clear, concise answers based on the database context.
Format data nicely with bullet points."""
        elif user:
            db_context = get_user_database_context(db, user)
            system_prompt = f"""You are Crowdy, a personal assistant for {user.username}.
            
Your Personal Data:
{db_context}

IMPORTANT RULES:
1. You can ONLY access and discuss data belonging to {user.username}.
2. If asked about other users, total system stats, or admin data, politely decline.
3. Say "I can only access your personal data" for unauthorized queries.
4. Be helpful with the user's own videos, zones, and analyses.
"""
        else:
            # Guest / Unknown user
            db_context = "No user data available."
            system_prompt = "You are Crowdy. The user is not logged in or recognized. Ask them to log in to view their data."

        # Try Groq AI if available
        if GROQ_AVAILABLE:
            api_key = os.getenv("GROQ_API_KEY")
            if api_key and api_key != "your_groq_api_key_here":
                try:
                    client = Groq(api_key=api_key)
                    
                    chat_completion = client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": request.message}
                        ],
                        model="llama-3.1-8b-instant",
                        temperature=0.3,
                        max_tokens=500
                    )
                    
                    ai_response = chat_completion.choices[0].message.content
                    return ChatResponse(response=ai_response, data={"source": "ai"})
                except Exception as e:
                    print(f"Groq AI error: {str(e)}")
                    # Fallback to pattern matching
                    pass
        
        # Fallback to pattern matching
        intent = analyze_intent(request.message)
        
        if not intent:
            if user_role in ['admin', 'superadmin']:
                return ChatResponse(
                    response="I'm here to help you query the database! You can ask me about:\n"
                            "- Total users, videos, analyses, or zones\n"
                            "- List of users or recent videos\n"
                            "- Average or maximum crowd counts\n"
                            "- User activity statistics"
                )
            else:
                 return ChatResponse(
                    response="I'm here to help you with YOUR data! You can ask me about:\n"
                            "- My videos\n"
                            "- My analyses\n"
                            "- My zones\n"
                            "- My statistics"
                )
        
        data = execute_query(intent, db, user)
        response_text = generate_response(intent, data, user_role)
        return ChatResponse(response=response_text, data=data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
