"""
Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db

# ---------------------------------------------------
# SETTINGS
# ---------------------------------------------------

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="TraceDonate - Transparent Charity Donation Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# ---------------------------------------------------
# CORS (MUST BE RIGHT AFTER app creation)
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",   # React Native / Expo
        "http://127.0.0.1:8081",
        "http://localhost:3000",   # Optional web frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# STARTUP
# ---------------------------------------------------

@app.on_event("startup")
def startup_event():
    init_db()
    print("[OK] Database initialized")
    print(f"[OK] {settings.APP_NAME} is running")

# ---------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# ---------------------------------------------------
# ROUTERS
# ---------------------------------------------------

from routes.auth_routes import router as auth_router
from routes.victim_routes import router as victim_router
from routes.admin_routes import router as admin_router
from routes.donation_routes import router as donation_router
from routes.payment_routes import router as payment_router

API_PREFIX = settings.API_V1_PREFIX

app.include_router(auth_router, prefix=f"{API_PREFIX}/auth", tags=["Authentication"])
app.include_router(victim_router, prefix=f"{API_PREFIX}/victim", tags=["Victim"])
app.include_router(admin_router, prefix=f"{API_PREFIX}/admin", tags=["Admin"])
app.include_router(donation_router, prefix=f"{API_PREFIX}/donation", tags=["Donations"])
app.include_router(payment_router, prefix=f"{API_PREFIX}/payments", tags=["Payments"])

# ---------------------------------------------------
# LOCAL RUN
# ---------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )