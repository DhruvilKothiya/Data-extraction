import os
import csv
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
from app.models.key_financial_data import KeyFinancialData
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

            # Insert into csv_file_data table
            csv_record = CSVFileData(
                company_name=company_name,
                address1=row.get("Address1"),
                address2=row.get("Address2"),
                address3=row.get("Address3"),
                city=row.get("City"),
                county=row.get("County"),
            )
            db.add(csv_record)

            # Check if company already exists in company_data
            if company_name:
                exists_in_company_data = db.query(CompanyData).filter(CompanyData.company_name == company_name).first()
                exists_in_key_financial = db.query(KeyFinancialData).filter(KeyFinancialData.company_name == company_name).first()

                if not exists_in_key_financial:
                    key_financial_data = KeyFinancialData(company_name=company_name)
                    db.add(key_financial_data)
                    db.flush() 
                else:
                    key_financial_data = exists_in_key_financial

                if not exists_in_company_data:
                    company_data = CompanyData(
                        company_name=company_name,
                        key_financial_data_id=key_financial_data.id 
                    )
                    db.add(company_data)

        db.commit()
        return {"message": "File processed and data saved successfully"}

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

@router.post("/export-company-data")
def export_selected_key_financial_data(ids: list[int], db: Session = Depends(get_db)):
    # Step 1: Get selected companies
    companies = db.query(CompanyData).filter(CompanyData.id.in_(ids)).all()

    if not companies:
        raise HTTPException(status_code=404, detail="No selected companies found.")

    # Step 2: Extract related key_financial_data_id values
    key_data_ids = [c.key_financial_data_id for c in companies if c.key_financial_data_id]

    # Step 3: Fetch matching key financial data rows
    key_data_list = db.query(KeyFinancialData).filter(KeyFinancialData.id.in_(key_data_ids)).all()

    if not key_data_list:
        raise HTTPException(status_code=404, detail="No key financial data found.")

    # Step 4: Prepare CSV content
    output = StringIO()
    writer = csv.writer(output)

    # CSV header (you can remove columns if not needed)
    writer.writerow([
        "Company Name", "Company Status", "Company Registered Number", "Incorporation Date", "Latest Accounts Date",
        "Turnover Latest Year", "Turnover Previous Year", "Turnover 2020", "Turnover 2019",
        "Profit Latest Year", "Profit Previous Year", "Profit 2020", "Profit 2019",
        "Parent Company", "Nationality of Parent", "Auditor Name Latest", "Auditor Firm Latest",
        "No. of UK DB Arrangements",
        "DB Arrangement 1 - Name", "Actuary", "Actuary Firm", "Status",
        "DB Arrangement 2 - Name", "Actuary", "Actuary Firm", "Status",
        "DB Arrangement 3 - Name", "Actuary", "Actuary Firm", "Status",
        "Fair Value Assets Year End", "Fair Value Prev Year End", "Fair Value 2020", "Fair Value 2019",
        "Surplus Year End", "Surplus Prev Year End", "Surplus 2020", "Surplus 2019",
        "Employer Contribution Latest Year", "Employer Contribution Previous Year", "Benefits Paid",
        "Expenses Paid Latest Year", "Expenses Paid Previous Year", "Defined Contribution Paid",
        "Assets: Equities", "Bonds", "Real Estate", "LDI", "Cash", "Other"
    ])

    for d in key_data_list:
        writer.writerow([
            d.company_name, d.company_status, d.company_registered_number, d.incorporation_date, d.latest_accounts_date,
            d.turnover_latest_year, d.turnover_previous_year, d.turnover_2020, d.turnover_2019,
            d.profit_latest_year, d.profit_previous_year, d.profit_2020, d.profit_2019,
            d.parent_company, d.nationality_of_parent, d.auditor_name_latest, d.auditor_firm_latest,
            d.number_of_uk_defined_benefit_arrangements,
            d.Name_of_Defined_Benefit_Arrangement_1, d.scheme_actuary_1, d.scheme_actuary_firm_1, d.Status_of_Defined_Benefit_Arrangement_1,
            d.Name_of_Defined_Benefit_Arrangement_2, d.scheme_actuary_2, d.scheme_actuary_firm_2, d.Status_of_Defined_Benefit_Arrangement_2,
            d.Name_of_Defined_Benefit_Arrangement_3, d.scheme_actuary_3, d.scheme_actuary_firm_3, d.Status_of_Defined_Benefit_Arrangement_3,
            d.fair_value_assets_year_end, d.fair_value_assets_prev_year_end, d.fair_value_assets_2020, d.fair_value_assets_2019,
            d.surplus_year_end, d.surplus_prev_year_end, d.surplus_2020, d.surplus_2019,
            d.employer_contrib_latest_year, d.employer_contrib_previous_year, d.benefits_paid,
            d.expenses_paid_latest_year, d.expenses_paid_previous_year, d.defined_contrib_paid,
            d.assets_equities, d.assets_bonds, d.assets_real_estate, d.assets_ldi, d.assets_cash, d.assets_other
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=key_financial_data.csv"}
    )
