from sqlalchemy import Column, Integer, String, JSON
from app.db.base import Base


class CompanyCharges(Base):
    __tablename__ = "company_charges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_registered_number = Column(String(50), unique=True, nullable=False)
    total_charges = Column(Integer, nullable=False)
    charges = Column(JSON, nullable=False)
