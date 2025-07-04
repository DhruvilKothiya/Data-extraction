from sqlalchemy import Column, Integer, String, Date, Numeric
from app.db.base import Base

class KeyFinancialData(Base):
    __tablename__ = "key_financial_data"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=True)
    company_status = Column(String(50), nullable=True)
    company_registered_number = Column(Integer, nullable=True, unique=True)
    incorporation_date = Column(Date, nullable=True)
    latest_accounts_date = Column(Date, nullable=True)

    turnover_latest_year = Column(Numeric(20, 4), nullable=True)
    turnover_previous_year = Column(Numeric(20, 4), nullable=True)
    turnover_2020 = Column(Numeric(20, 4), nullable=True)
    turnover_2019 = Column(Numeric(20, 4), nullable=True)

    profit_latest_year = Column(Numeric(20, 4), nullable=True)
    profit_previous_year = Column(Numeric(20, 4), nullable=True)
    profit_2020 = Column(Numeric(20, 4), nullable=True)
    profit_2019 = Column(Numeric(20, 4), nullable=True)

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

    fair_value_assets_year_end = Column(Numeric(20, 2), nullable=True)
    fair_value_assets_prev_year_end = Column(Numeric(20, 2), nullable=True)
    fair_value_assets_2020 = Column(Numeric(20, 2), nullable=True)
    fair_value_assets_2019 = Column(Numeric(20, 2), nullable=True)

    surplus_year_end = Column(Numeric(20, 2), nullable=True)
    surplus_prev_year_end = Column(Numeric(20, 2), nullable=True)
    surplus_2020 = Column(Numeric(20, 2), nullable=True)
    surplus_2019 = Column(Numeric(20, 2), nullable=True)

    employer_contrib_latest_year = Column(Numeric(20, 2), nullable=True)
    employer_contrib_previous_year = Column(Numeric(20, 2), nullable=True)
    benefits_paid = Column(Numeric(20, 2), nullable=True)
    expenses_paid_latest_year = Column(Numeric(20, 2), nullable=True)
    expenses_paid_previous_year = Column(Numeric(20, 2), nullable=True)
    defined_contrib_paid = Column(Numeric(20, 2), nullable=True)

    assets_equities = Column(Numeric(20, 2), nullable=True)
    assets_bonds = Column(Numeric(20, 2), nullable=True)
    assets_real_estate = Column(Numeric(20, 2), nullable=True)
    assets_ldi = Column(Numeric(20, 2), nullable=True)
    assets_cash = Column(Numeric(20, 2), nullable=True)
    assets_other = Column(Numeric(20, 2), nullable=True)
