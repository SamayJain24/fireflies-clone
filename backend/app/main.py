from contextlib import asynccontextmanager
import os
import sys

# Ensure project root is in sys.path for flexible execution from root or backend directory
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.database import init_db
from backend.app.routers.meetings import router as meetings_router
from backend.app.routers.action_items import router as action_items_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager:
    Initializes database tables on startup.
    """
    init_db()
    yield


app = FastAPI(
    title="Fireflies.ai Clone API",
    version="1.0.0",
    description="FastAPI backend for meeting transcription, AI summarization, and interactive audio playback.",
    lifespan=lifespan,
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(meetings_router, prefix="/api/v1")
app.include_router(action_items_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service availability."""
    return {"status": "ok", "service": "Fireflies.ai Clone Backend"}
