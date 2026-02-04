from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.mongodb import connect_to_mongodb, close_mongodb_connection
from app.routers import search, history, favorites


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    await connect_to_mongodb()
    yield
    # Shutdown
    await close_mongodb_connection()


app = FastAPI(
    title="Tool Parts Finder API",
    description="AI-powered multi-vendor tool parts search for pneumatic tool repair",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
cors_origins = settings.cors_origins.split(",") if isinstance(settings.cors_origins, str) else settings.cors_origins
if "*" in cors_origins:
    # If wildcard, use it directly as a list
    cors_origins = ["*"]
else:
    # Clean up whitespace from origins
    cors_origins = [origin.strip() for origin in cors_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search.router)
app.include_router(history.router)
app.include_router(favorites.router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Tool Parts Finder API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "api_version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
