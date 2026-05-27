import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routes import router
from app.services.job_miner import mine_live_jobs
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# Initialize Database Tables
logger.info("Initializing database tables...")
Base.metadata.create_all(bind=engine)

# Seed live jobs if database is empty
db = SessionLocal()
try:
    from app.models import Job
    job_count = db.query(Job).count()
    if job_count == 0:
        logger.info("Database is empty. Mining live job listings to seed...")
        mine_live_jobs(db, limit=35)
    else:
        logger.info(f"Database already contains {job_count} jobs. Skipping initial seed.")
except Exception as e:
    logger.error(f"Error checking or seeding database: {e}")
finally:
    db.close()

app = FastAPI(title="JobMatchr AI API", version="1.0.0")

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router
app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to JobMatchr AI API. Go to /docs for API documentation."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
