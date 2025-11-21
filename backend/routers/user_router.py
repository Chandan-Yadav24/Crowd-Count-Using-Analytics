from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend import models, schemas, auth, database
from sqlalchemy import select

router = APIRouter(prefix="/api", tags=["User"])

# -------- Register normal user ----------
@router.post("/register", status_code=201)
def register_user(request: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # check if username exists
    exist = db.execute(select(models.User).where(models.User.username == request.username)).scalar()
    if exist:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = auth.hash_password(request.password)
    new_user = models.User(
        username=request.username,
        email=request.email,
        password_hash=hashed,
        role=models.UserRole.user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

# -------- Login ----------
@router.post("/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = db.execute(select(models.User).where(models.User.username == request.username)).scalar()
    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = auth.create_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "role": user.role}

# ======================================================
# --------- PROFILE MANAGEMENT ENDPOINTS ---------------
# ======================================================

# ---- Change Username ----
@router.put("/change_username")
def change_username(username: str, new_username: str, db: Session = Depends(database.get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalar()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.username == "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin username cannot be changed")

    existing = db.execute(select(models.User).where(models.User.username == new_username)).scalar()
    if existing:
        raise HTTPException(status_code=400, detail="New username already exists")

    user.username = new_username
    db.commit()
    return {"message": f"Username updated to {new_username}"}


# ---- Change Password ----
@router.put("/change_password")
def change_password(username: str, old_password: str, new_password: str, db: Session = Depends(database.get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalar()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not auth.verify_password(old_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Old password incorrect")

    user.password_hash = auth.hash_password(new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# ---- Delete Account ----
@router.delete("/delete_account/{username}")
def delete_account(username: str, db: Session = Depends(database.get_db)):
    user = db.execute(select(models.User).where(models.User.username == username)).scalar()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.username == "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin cannot be deleted")

    db.delete(user)
    db.commit()
    return {"message": f"User {username} deleted successfully"}