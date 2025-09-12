from sqlalchemy import Column, Integer, String, UniqueConstraint
from app.db.base import Base

class PeopleData(Base):
    __tablename__ = "people_data"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=True)
    appointment_date = Column(String(50), nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    company_registered_number = Column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "company_registered_number",
            "role",
            "name",
            "appointment_date",
            "date_of_birth",
            name="uq_people_unique_combination"
        ),
    )
