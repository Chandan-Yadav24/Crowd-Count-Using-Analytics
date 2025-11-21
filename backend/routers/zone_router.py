from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend import models, database, schemas

router = APIRouter(prefix="/api/zone", tags=["Zone"])

@router.post("/", status_code=201)
def create_zone(
    username: str = Body(...),
    video_id: int = Body(...),
    label: str = Body(...),
    coordinates: list = Body(...),
    db: Session = Depends(database.get_db)
):
    user = db.execute(select(models.User)
                      .where(models.User.username == username)).scalar()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    video = db.execute(select(models.Video)
                       .where(models.Video.id == video_id)).scalar()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    new_zone = models.Zone(
        user_id=user.id,
        video_id=video.id,
        label=label,
        coordinates=coordinates
    )
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)
    return {"message": "Zone created", "zone_id": new_zone.id}

@router.get("/list/{video_id}")
def list_zones(video_id: int, db: Session = Depends(database.get_db)):
    zones = db.query(models.Zone)\
              .filter(models.Zone.video_id == video_id).all()
    return [
        {"id": z.id, "label": z.label, "coordinates": z.coordinates}
        for z in zones
    ]

@router.delete("/{zone_id}")
def delete_zone(zone_id: int, db: Session = Depends(database.get_db)):
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return {"message": "Zone deleted"}

@router.put("/{zone_id}")
def rename_zone(zone_id: int, label: str, db: Session = Depends(database.get_db)):
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    zone.label = label
    db.commit()
    return {"message": "Zone renamed"}