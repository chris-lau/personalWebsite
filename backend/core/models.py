from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship

from .db import Base

# Many-to-many relationship helper table for Project and Technology
project_technology = Table(
    "project_technologies",
    Base.metadata,
    Column("project_id", String, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", Integer, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True),
)


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)  # Matches string IDs like 'personal-os'
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    github_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)
    featured = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Many-to-many relationship
    technologies = relationship("Technology", secondary=project_technology, back_populates="projects")


class Technology(Base):
    __tablename__ = "technologies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)

    projects = relationship("Project", secondary=project_technology, back_populates="technologies")


class NowEntry(Base):
    __tablename__ = "now_entries"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True)  # 'currentFocus', 'workingOn', 'learning', 'reading', 'lastUpdated'
    content = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ReadingItem(Base):
    __tablename__ = "reading_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'reading', 'completed', 'queued'
    rating = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
