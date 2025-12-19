from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from backend import models, schemas, auth, database

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# --- list all users  (admins & normal) ---
@router.get("/users")
def list_users(db: Session = Depends(database.get_db)):
    users = db.execute(select(models.User)).scalars().all()
    return [
        {"id": u.id, "username": u.username, "email": u.email, "role": u.role}
        for u in users
    ]

# --- add new user or admin ---
@router.post("/add_user", status_code=201)
def add_user(request: schemas.UserCreate, role: str = "user", db: Session = Depends(database.get_db)):
    exists = db.execute(select(models.User).where(models.User.username == request.username)).scalar()
    if exists:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = auth.hash_password(request.password)
    new_user = models.User(
        username=request.username,
        email=request.email,
        password_hash=hashed,
        role=models.UserRole.admin if role == "admin" else models.UserRole.user,
    )
    db.add(new_user)
    db.commit()
    return {"message": f"{role.capitalize()} {request.username} created"}

# --- delete user / admin ---
@router.delete("/delete_user/{username}")
def delete_user(username: str, db: Session = Depends(database.get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalar()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # protect superadmin
    if user.username == "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin cannot be deleted")

    db.delete(user)
    db.commit()
    return {"message": f"User {username} deleted successfully"}


# --- update user ---
@router.put("/update_user/{username}")
def update_user(username: str, request: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalar()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.email:
        user.email = request.email
    if request.role:
        user.role = models.UserRole.admin if request.role == "admin" else models.UserRole.user
    if request.password:
        user.password_hash = auth.hash_password(request.password)
    
    db.commit()
    return {"message": f"User {username} updated successfully"}
