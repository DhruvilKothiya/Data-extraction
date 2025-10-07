from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey,DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class CompanyData(Base):
    __tablename__ = "company_data"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    rating = Column(Integer)
    key_financial_data_id = Column(Integer, ForeignKey("key_financial_data.id"), unique=True)
    key_financial_data = relationship("KeyFinancialData", backref="company")
    approval_stage = Column(Integer, default=0)
    status = Column(String(20), default="Not Started")
    type_of_scheme = Column(String(100), nullable=True)
    last_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    people_page_link = Column(String(255), nullable=True)
