from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
from backend import database, models
from backend.services.yolo_service import yolo_service
import os
import traceback

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

@router.get("/progress/{video_id}")
def get_progress(video_id: int, db: Session = Depends(database.get_db)):
    """Get analysis progress for a video"""
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        return {"percentage": 0, "current": 0, "total": 0}
    
    progress_key = f"video_{video.filepath}"
    progress = yolo_service.progress.get(progress_key, {'percentage': 0, 'current': 0, 'total': 0})
    return progress

@router.post("/start")
def start_analysis(
    video_id: int = Body(...),
    username: str = Body(...),
    db: Session = Depends(database.get_db)
):
    # Verify user
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify video
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if video file exists
    if not os.path.exists(video.filepath):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    # Get zones for this video
    zones = db.query(models.Zone).filter(models.Zone.video_id == video_id).all()
    
    if not zones:
        raise HTTPException(status_code=400, detail="No zones defined for this video")
    
    # Prepare zones data for YOLO service
    zones_data = [
        {
            'id': zone.id,
            'label': zone.label,
            'coordinates': zone.coordinates
        }
        for zone in zones
    ]
    
    print(f"Zones from database: {zones_data}")
    
    try:
        # Generate output video path
        output_dir = os.path.join("data", "results")
        os.makedirs(output_dir, exist_ok=True)
        output_filename = f"analyzed_{video_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        output_path = os.path.join(output_dir, output_filename)
        
        # Run YOLO analysis
        print(f"Starting analysis for video: {video.filepath}")
        print(f"Passing zones to YOLO: {zones_data}")
        result = yolo_service.analyze_video(video.filepath, zones_data, output_path)
        print(f"Analysis complete. Output: {output_path}")
        
        return {
            "video_id": video_id,
            "status": "completed",
            "total_count": result['total_count'],
            "zone_counts": result['zone_counts'],
            "output_video": f"/api/analysis/result/{video_id}?path={output_path}",
            "processed_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/result/{video_id}")
def get_analysis_result(video_id: int, path: str):
    """Get processed video with detections and zones"""
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Output video not found")
    
    return FileResponse(path, media_type="video/mp4")
