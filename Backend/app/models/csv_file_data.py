from sqlalchemy import Column, Integer, String
from app.db.base import Base

class CSVFileData(Base):
    __tablename__ = "csv_file_data"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=True)
    address1 = Column(String(255), nullable=True)
    address2 = Column(String(255), nullable=True)
    address3 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    county = Column(String(100), nullable=True)
