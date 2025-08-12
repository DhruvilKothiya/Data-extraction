from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class PeopleData(Base):
    __tablename__ = "people_data"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=True)
    appointment_date = Column(String(50),nullable=True)  # or String(255) if you want more room
    date_of_birth = Column(String(50),nullable=True)
    company_registered_number = Column(String(50), nullable=True)



   