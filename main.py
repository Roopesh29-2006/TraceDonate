"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from database import init_db

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="TraceDonate - Transparent Charity Donation Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add CORS middleware
cors_origins = settings.CORS_ORIGINS
if isinstance(cors_origins, str):
    # Parse comma-separated string or use "*" for all
    if cors_origins == "*":
        cors_origins = ["*"]
    else:
        cors_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """
    Initialize database tables on application startup.
    """
    init_db()
    print("✓ Database initialized")
    print(f"✓ {settings.APP_NAME} is running")


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


# Import and include route routers
from routes.auth_routes import router as auth_router
from routes.victim_routes import router as victim_router
from routes.admin_routes import router as admin_router
from routes.donation_routes import router as donation_router

app.include_router(auth_router, prefix=settings.API_V1_PREFIX + "/auth", tags=["Authentication"])
app.include_router(victim_router, prefix=settings.API_V1_PREFIX + "/victim", tags=["Victim"])
app.include_router(admin_router, prefix=settings.API_V1_PREFIX + "/admin", tags=["Admin"])
app.include_router(donation_router, prefix=settings.API_V1_PREFIX + "/donation", tags=["Donations"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
