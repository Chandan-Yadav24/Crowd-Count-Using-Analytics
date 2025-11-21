from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os, shutil
from backend import database, models

router = APIRouter(prefix="/api/video", tags=["Video"])

UPLOAD_DIR = os.path.join("data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
def upload_video(username: str = Form(...), file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    # find the user by username
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # save file to local dir
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_video = models.Video(
        user_id=user.id,
        filename=file.filename,
        filepath=save_path,
        status="completed"
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return {"message": "Video uploaded successfully", "video_id": new_video.id}

@router.get("/list/{username}")
def list_videos(username: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    vids = db.query(models.Video)\
             .filter(models.Video.user_id == user.id).all()
    return [
        {
            "id": v.id,
            "filename": v.filename,
            "status": v.status,
            "filepath": v.filepath
        } for v in vids
    ]

@router.delete("/delete/{video_id}")
def delete_video(video_id: int, db: Session = Depends(database.get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    try:
        if os.path.exists(video.filepath):
            os.remove(video.filepath)
    except Exception as e:
        print("Delete file error:", e)
    db.delete(video)
    db.commit()
    return {"message": "Video deleted successfully"}

@router.get("/preview/{video_id}")
def get_video(video_id: int, db: Session = Depends(database.get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(video.filepath, media_type="video/mp4")

