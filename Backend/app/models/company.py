from sqlalchemy import Column, Integer, String, Boolean, Text
from app.db.base import Base

class CompanyData(Base):
    __tablename__ = "company_data"

    id = Column(Integer, primary_key=True, index=True)
    selected = Column(Boolean, default=False)
    identifier = Column(String(20), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    rating = Column(Integer)
    key_financial_data = Column(Text)
    downloaded_pdfs = Column(Text)
    pension_summary = Column(Text)
    director_info = Column(Text)
    approval_stage = Column(Integer, default=0)
