from sqlalchemy import Column, String, JSON
from app.db.base import Base

class CompanyPDFs(Base):
    __tablename__ = "company_pdfs"
    
    company_registered_number = Column(String(50), primary_key=True)
    pdf_links = Column(JSON)