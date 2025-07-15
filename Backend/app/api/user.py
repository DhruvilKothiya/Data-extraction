import os
import csv,requests
from io import StringIO
from decouple import config 
from fastapi import APIRouter, Depends, HTTPException,Request,File, UploadFile,Response
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.utils.jwt import create_access_token, decode_token
from app.schemas.user import *
from app.crud.user import create_user
from app.models.user import User
from app.models.csv_file_data import CSVFileData
from app.utils.email import send_reset_email
from passlib.context import CryptContext
from app.models.company import CompanyData 
from app.utils.functions import map_api_data_to_model
from app.models.key_financial_data import KeyFinancialData
from typing import List



import shutil

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup",response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user)


@router.post("/signin")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": db_user.email})
    user_data = {
        "id": db_user.id,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "email": db_user.email,
    }
    return {"access_token": token, "token_type": "bearer","user": user_data}


@router.post("/forgot-password")
def forgot_password(request_data: EmailSchema, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request_data.email).first()
    print("user",user)
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")

    token = create_access_token(data={"sub": user.email})
    frontend_base_url = config("FRONTEND_BASE_URL")  
    reset_link = f"{frontend_base_url}/reset-password?token={token}"
    send_reset_email(user.email, reset_link)

    return {"msg": "Password reset link sent to your email"}

@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    try:
        payload = decode_token(data.token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")
    except:
        raise HTTPException(status_code=400, detail="Token is invalid or expired")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = pwd_context.hash(data.new_password)
    user.password = hashed_password
    db.commit()
    return {"msg": "Password updated successfully"}

@router.get("/company-data")
def get_company_data(db: Session = Depends(get_db)):
    companies = db.query(CompanyData).all()
    return [
        {
            "id": c.id,
            "selected": c.selected,
            "identifier": c.identifier,
            "company_name": c.company_name,
            "rating": c.rating,
            "key_financial_data": c.key_financial_data,
            "downloaded_pdfs": c.downloaded_pdfs,
            "pension_summary": c.pension_summary,
            "director_info": c.director_info,
            "approval_stage": c.approval_stage
        }
        for c in companies  
    ]  

@router.post("/upload-file")
def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        if not file.filename.endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")

        contents = file.file.read().decode("utf-8")
        csv_reader = csv.DictReader(StringIO(contents))
        required_fields = ["Company", "Address1", "Address2", "Address3", "City", "County"]

        for row in csv_reader:
            company_name = row.get("Company")
            if not company_name:
                continue

            # Step 1: Save in csv_file_data
            csv_record = CSVFileData(
                company_name=company_name,
                address1=row.get("Address1"),
                address2=row.get("Address2"),
                address3=row.get("Address3"),
                city=row.get("City"),
                county=row.get("County"),
            )
            db.add(csv_record)

            # Step 2: Create/Update KeyFinancialData
            key_data = db.query(KeyFinancialData).filter(KeyFinancialData.company_name == company_name).first()
            if not key_data:
                key_data = KeyFinancialData(company_name=company_name)
                db.add(key_data)
                db.flush()  # to get the id

            # Step 3: Create CompanyData if not exists
            company_data = db.query(CompanyData).filter(CompanyData.company_name == company_name).first()
            if not company_data:
                company_data = CompanyData(
                    company_name=company_name,
                    key_financial_data_id=key_data.id,
                    status="Processing"  # set to Processing at first
                )
                db.add(company_data)
            else:
                company_data.status = "Processing"  # update if already exists


            # Step 4: Fetch Key Financial data from external API
            try:
                api_response = requests.post(
                    "http://192.168.29.160:8000/extract-financial-data",
                    json={"company_name": company_name}
                )
                print(api_response.status_code)
                print(api_response.json())
                if api_response.status_code == 200:
                    json_data = api_response.json()
                    map_api_data_to_model(json_data, db, key_data)
                    company_data.status = "Done"
                    
                else:
                    print(f"API failed for {company_name}: {api_response.status_code}")
            except Exception as e:
                print(f"Error fetching API data for {company_name}: {e}")
                if company_data:
                    company_data.status = "Not Started"
        db.commit()
        return {"message": "File processed, data saved, and key financial data fetched."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
    
    
@router.get("/key-financial-data/{company_id}")
def get_key_financial_data(company_id: int, db: Session = Depends(get_db)):
    company = db.query(CompanyData).filter(CompanyData.id == company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    key_data = db.query(KeyFinancialData).filter(KeyFinancialData.id == company.key_financial_data_id).first()

    if not key_data:
        raise HTTPException(status_code=404, detail="Key Financial Data not found")

    return key_data




def extract_year_values(json_data, fixed_years):
    """
    Extracts values for fixed years (like 2020, 2019) and determines the latest
    and previous year dynamically based on the highest ENDING year in keys like "2023-24".
    """
    result = {year: None for year in fixed_years + ['latest', 'previous']}

    if not json_data or not isinstance(json_data, dict):
        return result

    year_map = {}
    for key in json_data:
        try:
            # If key is like "2023-24", extract the second part as int: 24 → 2024
            if "-" in key:
                end_part = key.split("-")[1]
                end_year = int("20" + end_part) if len(end_part) == 2 else int(end_part)
            else:
                end_year = int(key)
            year_map[end_year] = key  # Map end year → original key
        except ValueError:
            continue  # skip invalid keys

    sorted_years = sorted(year_map.keys())
    if not sorted_years:
        return result

    latest_year = sorted_years[-1]
    prev_year = sorted_years[-2] if len(sorted_years) >= 2 else None

    result['latest'] = json_data.get(year_map[latest_year])
    result['previous'] = json_data.get(year_map[prev_year]) if prev_year else None
    result['2020'] = json_data.get('2020')
    result['2019'] = json_data.get('2019')

    return result


@router.post("/export-company-data")
def export_selected_key_financial_data(ids: List[int], db: Session = Depends(get_db)):
    companies = db.query(CompanyData).filter(CompanyData.id.in_(ids)).all()
    if not companies:
        raise HTTPException(status_code=404, detail="No selected companies found.")

    key_data_ids = [c.key_financial_data_id for c in companies if c.key_financial_data_id]
    key_data_list = db.query(KeyFinancialData).filter(KeyFinancialData.id.in_(key_data_ids)).all()
    if not key_data_list:
        raise HTTPException(status_code=404, detail="No key financial data found.")

    output = StringIO()
    writer = csv.writer(output)

    # CSV header
    writer.writerow([
        "Company Name", "Company Status", "Company Registered Number", "Incorporation Date", "Date of Latest Accounts",
        "Turnover Latest Year", "Turnover Previous Financial Year", "Turnover 2020", "Turnover 2019",
        "Profit Latest Year", "Profit Previous Financial Year", "Profit 2020", "Profit 2019",
        "Parent Company", "Nationality of Parent", "Name of the Auditor (Latest accounts)", "Auditor firm (Latest Accounts)",
        "Number of UK Defined Benefit Arrangements",
        "Name of Defined Benefit Arrangement 1", "Scheme Actuary", "Scheme Acuary firm", "Status of Defined Benefit Arrangement 1",
        "Name of Defined Benefit Arrangement 2", "Scheme Actuary", "Scheme Acuary firm", "Status of Defined Benefit Arrangement 2",
        "Name of Defined Benefit Arrangement 3", "Scheme Actuary", "Scheme Acuary firm", "Status of Defined Benefit Arrangement 3",
        "Fair value of assets at year end for Defined Benefit Arrangements",
        "Fair value of assets at previous year end for Defined Benefit Arrangements",
        "Fair value of assets at year end for Defined Benefit Arrangements, 2020 figure",
        "Fair value of assets at previous year end for Defined Benefit Arrangements, 2019 figure",
        "Surplus at year end for Defined Benefit Arrangements",
        "Surplus at previous year end for Defined Benefit Arrangements",
        "Surplus at year end for Defined Benefit Arrangements, 2020 figure",
        "Surplus at previous year end for Defined Benefit Arrangements, 2019 figure",
        "Employer contributions paid for Defined Benefit Arrangements Latest Year",
        "Employer contributions paid for Defined Benefit Arrangements previous year",
        "Benefits Paid Defined Benefit Arrangements",
        "Expenses paid Latest Year", "Expenses paid previous year", "Defined contribution contributions paid",
        "assets held in equities", "assets held in bonds", "assets held in real  estate",
        "assets held in liability driven investments (LDI)", "assets held in cash", "assets held in other"
    ])

    for d in key_data_list:
        turnover = extract_year_values(d.turnover_data, ['2020', '2019'])
        profit = extract_year_values(d.profit_data, ['2020', '2019'])
        fair_value = extract_year_values(d.fair_value_assets, ['2020', '2019'])
        surplus = extract_year_values(d.surplus_data, ['2020', '2019'])

        writer.writerow([
            d.company_name, d.company_status, d.company_registered_number, d.incorporation_date, d.latest_accounts_date,
            turnover['latest'], turnover['previous'], turnover['2020'], turnover['2019'],
            profit['latest'], profit['previous'], profit['2020'], profit['2019'],
            d.parent_company, d.nationality_of_parent, d.auditor_name_latest, d.auditor_firm_latest,
            d.number_of_uk_defined_benefit_arrangements,
            d.Name_of_Defined_Benefit_Arrangement_1, d.scheme_actuary_1, d.scheme_actuary_firm_1, d.Status_of_Defined_Benefit_Arrangement_1,
            d.Name_of_Defined_Benefit_Arrangement_2, d.scheme_actuary_2, d.scheme_actuary_firm_2, d.Status_of_Defined_Benefit_Arrangement_2,
            d.Name_of_Defined_Benefit_Arrangement_3, d.scheme_actuary_3, d.scheme_actuary_firm_3, d.Status_of_Defined_Benefit_Arrangement_3,
            fair_value['latest'], fair_value['previous'], fair_value['2020'], fair_value['2019'],
            surplus['latest'], surplus['previous'], surplus['2020'], surplus['2019'],
            d.employer_contrib_latest_year, d.employer_contrib_previous_year, d.benefits_paid,
            d.expenses_paid_latest_year, d.expenses_paid_previous_year, d.defined_contrib_paid,
            d.assets_equities, d.assets_bonds, d.assets_real_estate,
            d.assets_ldi, d.assets_cash, d.assets_other
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=key_financial_data.csv"}
    )