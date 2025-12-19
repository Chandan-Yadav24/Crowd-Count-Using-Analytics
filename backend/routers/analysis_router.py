from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse, StreamingResponse
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

@router.get("/all/{username}")
def get_all_analysis(username: str, db: Session = Depends(database.get_db)):
    """Get all analysis records for a user"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    results = db.query(models.AnalysisResult, models.Video).join(
        models.Video, models.AnalysisResult.video_id == models.Video.id
    ).filter(models.AnalysisResult.user_id == user.id).order_by(
        models.AnalysisResult.created_at.desc()
    ).all()
    
    return [{
        "id": result.id,
        "video_id": result.video_id,
        "video_filename": video.filename,
        "total_count": result.total_count,
        "zone_counts": result.zone_counts,
        "processed_at": result.processed_at.isoformat()
    } for result, video in results]

@router.get("/results/{video_id}")
def get_video_analysis(video_id: int, db: Session = Depends(database.get_db)):
    """Get existing analysis result for a video"""
    result = db.query(models.AnalysisResult).filter(
        models.AnalysisResult.video_id == video_id
    ).order_by(models.AnalysisResult.created_at.desc()).first()
    
    if not result:
        return None
    
    return {
        "id": result.id,
        "video_id": result.video_id,
        "output_video_path": result.output_video_path,
        "frame_data_path": result.frame_data_path,
        "total_count": result.total_count,
        "zone_counts": result.zone_counts,
        "processed_at": result.processed_at.isoformat(),
        "output_video": f"/api/analysis/result/{video_id}?path={result.output_video_path}"
    }

@router.post("/start/stream")
def start_analysis_stream(
    video_id: int = Body(...),
    username: str = Body(...),
    db: Session = Depends(database.get_db)
):
    """Start real-time streaming analysis"""
    # Verify user
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify video
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not os.path.exists(video.filepath):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    # Get zones
    zones = db.query(models.Zone).filter(models.Zone.video_id == video_id).all()
    if not zones:
        raise HTTPException(status_code=400, detail="No zones defined for this video")
    
    zones_data = [
        {
            'id': zone.id,
            'label': zone.label,
            'coordinates': zone.coordinates
        }
        for zone in zones
    ]
    
    return StreamingResponse(
        yolo_service.analyze_video_stream(video.filepath, zones_data),
        media_type="text/event-stream"
    )

@router.get("/stream/mjpeg/{video_id}")
def stream_video_mjpeg(
    video_id: int,
    username: str,
    db: Session = Depends(database.get_db)
):
    """Stream video with MJPEG"""
    # Verify user
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify video
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not os.path.exists(video.filepath):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    # Get zones
    zones = db.query(models.Zone).filter(models.Zone.video_id == video_id).all()
    if not zones:
        raise HTTPException(status_code=400, detail="No zones defined for this video")
    
    zones_data = [
        {
            'id': zone.id,
            'label': zone.label,
            'coordinates': zone.coordinates
        }
        for zone in zones
    ]
    
    return StreamingResponse(
        yolo_service.analyze_video_mjpeg(video.filepath, zones_data),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

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
    
    # Delete old analysis results for this video
    old_results = db.query(models.AnalysisResult).filter(
        models.AnalysisResult.video_id == video_id
    ).all()
    
    for old_result in old_results:
        # Delete old output video file
        if os.path.exists(old_result.output_video_path):
            os.remove(old_result.output_video_path)
        # Delete old frame data file
        if old_result.frame_data_path and os.path.exists(old_result.frame_data_path):
            os.remove(old_result.frame_data_path)
        db.delete(old_result)
    
    db.commit()
    
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
        
        # Save to database
        analysis_result = models.AnalysisResult(
            video_id=video_id,
            user_id=user.id,
            output_video_path=output_path,
            frame_data_path=result.get('frame_data_path'),
            total_count=result['total_count'],
            zone_counts=result['zone_counts'],
            processed_at=datetime.now()
        )
        db.add(analysis_result)
        db.commit()
        db.refresh(analysis_result)
        
        return {
            "id": analysis_result.id,
            "video_id": video_id,
            "status": "completed",
            "total_count": result['total_count'],
            "zone_counts": result['zone_counts'],
            "frame_data_path": result.get('frame_data_path'),
            "output_video": f"/api/analysis/result/{video_id}?path={output_path}",
            "processed_at": analysis_result.processed_at.isoformat()
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

@router.get("/frame-data/{video_id}")
def get_frame_data(video_id: int, db: Session = Depends(database.get_db)):
    """Get frame-by-frame count data for live display"""
    result = db.query(models.AnalysisResult).filter(
        models.AnalysisResult.video_id == video_id
    ).order_by(models.AnalysisResult.created_at.desc()).first()
    
    if not result or not result.frame_data_path:
        raise HTTPException(status_code=404, detail="Frame data not found")
    
    if not os.path.exists(result.frame_data_path):
        raise HTTPException(status_code=404, detail="Frame data file not found")
    
    return FileResponse(result.frame_data_path, media_type="application/json")

@router.delete("/results/{result_id}")
def delete_analysis_result(result_id: int, db: Session = Depends(database.get_db)):
    """Delete an analysis result"""
    result = db.query(models.AnalysisResult).filter(models.AnalysisResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    
    # Delete output video file
    if os.path.exists(result.output_video_path):
        os.remove(result.output_video_path)
    
    # Delete frame data file
    if result.frame_data_path and os.path.exists(result.frame_data_path):
        os.remove(result.frame_data_path)
    
    db.delete(result)
    db.commit()
    return {"message": "Analysis result deleted successfully"}


@router.get("/count/total")
def get_total_analyses_count(db: Session = Depends(database.get_db)):
    """Get total number of analyses run"""
    count = db.query(models.AnalysisResult).count()
    return {"total": count}
