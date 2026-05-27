from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    company_logo = Column(String(1000), nullable=True)  # URL
    location = Column(String(255), nullable=False)
    salary = Column(String(255), nullable=True)          # e.g. "$120,000 - $150,000"
    job_type = Column(String(100), nullable=False)       # Full-time, Internship, Part-time
    workplace_type = Column(String(100), nullable=False) # Remote, On-site, Hybrid
    experience_level = Column(String(100), nullable=False)# Entry, Mid, Senior
    role_category = Column(String(100), nullable=False)  # Engineering, Design, Product, Marketing
    company_type = Column(String(100), nullable=True)    # Startup, Corporate, etc.
    required_skills = Column(Text, nullable=False)       # Comma-separated or JSON list of skills
    description = Column(Text, nullable=False)
    apply_url = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")
