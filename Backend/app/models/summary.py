from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.db.base import Base

class SummaryNotes(Base):
    __tablename__ = "summary_notes"

    id = Column(Integer, primary_key=True, index=True)
    company_registered_number = Column(String(20), nullable=False, index=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())