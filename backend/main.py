from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import user_router, admin_router, video_router, zone_router, analysis_router
from backend import models, database

# create tables if not already
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Crowd Count API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router.router)
app.include_router(admin_router.router)
app.include_router(video_router.router)
app.include_router(zone_router.router)
app.include_router(analysis_router.router)

@app.get("/")
def root():
    return {"message": "Backend running!"}