from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class CompanyData(Base):
    __tablename__ = "company_data"

    id = Column(Integer, primary_key=True, index=True)
    selected = Column(Boolean, default=False)
    identifier = Column(String(20), unique=True, nullable=True)
    company_name = Column(String(255), nullable=False)
    rating = Column(Integer)
    key_financial_data_id = Column(Integer, ForeignKey("key_financial_data.id"))
    key_financial_data = relationship("KeyFinancialData", backref="company")
    downloaded_pdfs = Column(Text)
    pension_summary = Column(Text)
    director_info = Column(Text)
    approval_stage = Column(Integer, default=0)
    status = Column(String(20), default="Not Started")