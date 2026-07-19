from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db, engine
from app.routes import router
from app.models import Base

# Create tables in sqlite fallback database if they do not exist
if "sqlite" in settings.DATABASE_URL:
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Caterpillar Predictive Maintenance AI Microservice",
    description="FastAPI service responsible for machine health calculation, telemetry anomaly detection, and predictive maintenance analysis.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core AI endpoints router
app.include_router(router)


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Verify db connectivity
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return {
        "status": "healthy",
        "service": "ai-service",
        "database": db_status,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
