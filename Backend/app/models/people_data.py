from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class PeopleData(Base):
    __tablename__ = "people_data"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(255))
    appointment_date = Column(Date)
    date_of_birth = Column(Date)

    company_id = Column(Integer, ForeignKey("company_data.id"), nullable=False)
    company = relationship("CompanyData", back_populates="people")
