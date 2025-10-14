from sqlalchemy import Column, Integer, String, Date, Numeric, Float, JSON
from app.db.base import Base

class KeyFinancialData(Base):
    __tablename__ = "key_financial_data"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=True)
    company_status = Column(String(50), nullable=True)
    company_registered_number = Column(String(50), nullable=True, unique=True) 
    incorporation_date = Column(String(50), nullable=True)
    latest_accounts_date = Column(String(50), nullable=True)

    
    turnover_data = Column(JSON, nullable=True)
    profit_data = Column(JSON, nullable=True)
    fair_value_assets = Column(JSON, nullable=True)
    surplus_data = Column(JSON, nullable=True)

    parent_company = Column(String(255), nullable=True)
    nationality_of_parent = Column(String(100), nullable=True)
    auditor_name_latest = Column(String(255), nullable=True)
    auditor_firm_latest = Column(String(255), nullable=True)

    number_of_uk_defined_benefit_arrangements = Column(Integer, nullable=True)

    Name_of_Defined_Benefit_Arrangement_1 = Column(String(255), nullable=True)
    scheme_actuary_1 = Column(String(255), nullable=True)
    scheme_actuary_firm_1 = Column(String(255), nullable=True)
    Status_of_Defined_Benefit_Arrangement_1 = Column(String(100), nullable=True)
    
    Name_of_Defined_Benefit_Arrangement_2 = Column(String(255), nullable=True)
    scheme_actuary_2 = Column(String(255), nullable=True)
    scheme_actuary_firm_2 = Column(String(255), nullable=True)
    Status_of_Defined_Benefit_Arrangement_2 = Column(String(100), nullable=True)
    
    Name_of_Defined_Benefit_Arrangement_3 = Column(String(255), nullable=True)
    scheme_actuary_3 = Column(String(255), nullable=True)
    scheme_actuary_firm_3 = Column(String(255), nullable=True)
    Status_of_Defined_Benefit_Arrangement_3 = Column(String(100), nullable=True)


    employer_contrib_latest_year = Column(Float, nullable=True)
    employer_contrib_previous_year = Column(Float, nullable=True)
    benefits_paid = Column(Float, nullable=True)
    expenses_paid_latest_year = Column(Float, nullable=True)
    expenses_paid_previous_year = Column(Float, nullable=True)
    defined_contrib_paid = Column(Float, nullable=True)

    assets_equities = Column(Float, nullable=True)
    assets_bonds = Column(Float, nullable=True)
    assets_real_estate = Column(Float, nullable=True)
    assets_ldi = Column(Float, nullable=True)
    assets_cash = Column(Float, nullable=True)
    assets_other = Column(Float, nullable=True)
    assets_diversified_growth = Column(Float, nullable=True)
    assets_alternatives = Column(Float, nullable=True)
    assets_insurance_contracts = Column(Float, nullable=True)
    
    current_company_name = Column(String(255), nullable=True)
    sic1 = Column(Integer, nullable=True)
    sic2 = Column(Integer, nullable=True)
    location = Column(String(255), nullable=True)
    nature_of_business = Column(String(255), nullable=True) 
