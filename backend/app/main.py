from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.database.seed import seed_database
from app.api import users, context, predict, recommend, feedback, simulate, events, patterns, websocket, seed_api

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema on startup
    Base.metadata.create_all(bind=engine)
    # Ensure demo seed data exists
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Privacy-first AI support system that learns an individual's personal relationship between environment, context, support requirement, and intervention effectiveness.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(context.router, prefix=settings.API_PREFIX)
app.include_router(predict.router, prefix=settings.API_PREFIX)
app.include_router(recommend.router, prefix=settings.API_PREFIX)
app.include_router(feedback.router, prefix=settings.API_PREFIX)
app.include_router(simulate.router, prefix=settings.API_PREFIX)
app.include_router(events.router, prefix=settings.API_PREFIX)
app.include_router(patterns.router, prefix=settings.API_PREFIX)
app.include_router(seed_api.router, prefix=settings.API_PREFIX)
app.include_router(websocket.router)

@app.get("/")
def read_root():
    return {
        "name": settings.APP_NAME,
        "tagline": settings.TAGLINE,
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
