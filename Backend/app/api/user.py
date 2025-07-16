import os
import csv,requests
from io import StringIO
from fastapi import Body
from fastapi.responses import StreamingResponse
import pandas as pd
from io import BytesIO
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
                db.flush()  # Get the ID immediately

            # Step 3: Create/Update CompanyData
            company_data = db.query(CompanyData).filter(CompanyData.company_name == company_name).first()
            if not company_data:
                company_data = CompanyData(
                    company_name=company_name,
                    key_financial_data_id=key_data.id,
                    status="Processing"
                )
                db.add(company_data)
            else:
                company_data.status = "Processing"

            # Step 4: Call API (but skip mapping)
            try:
                api_response = requests.post(
                    "http://192.168.29.160:8000/extract-financial-data",
                    json={"company_name": company_name}
                )
                print(api_response.status_code)
                print(api_response.json())

                if api_response.status_code == 200:
                    # Skipping: map_api_data_to_model(json_data, db, key_data)
                    company_data.status = "Done"
                else:
                    print(f"API failed for {company_name}: {api_response.status_code}")
            except Exception as e:
                print(f"Error fetching API data for {company_name}: {e}")
                if company_data:
                    company_data.status = "Not Started"

        db.commit()
        return {"message": "File processed, companies updated, API hit, but mapping skipped."}

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
def export_selected_key_financial_data(
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    ids = data.get("ids", [])
    include_key = data.get("key_financial", False)
    include_people = data.get("people_data", False)
    include_summary = data.get("summary_notes", False)

    companies = db.query(CompanyData).filter(CompanyData.id.in_(ids)).all()
    if not companies:
        raise HTTPException(status_code=404, detail="No selected companies found.")

    key_data_map = {
        c.key_financial_data_id: c
        for c in companies if c.key_financial_data_id
    }
    key_data_list = db.query(KeyFinancialData).filter(KeyFinancialData.id.in_(key_data_map.keys())).all()
    key_data_by_id = {k.id: k for k in key_data_list}

    # Prepare main data
    main_rows = []
    for company in companies:
        row = {
            "Company Name": company.company_name,
            "Approval Status": company.approval_stage,
            "Status Code": company.status,
            "Type of Scheme": "Defined Benefit"
        }

        if include_key:
            d = key_data_by_id.get(company.key_financial_data_id)
            turnover = extract_year_values(d.turnover_data, ['2020', '2019']) if d else {}
            profit = extract_year_values(d.profit_data, ['2020', '2019']) if d else {}
            fair_value = extract_year_values(d.fair_value_assets, ['2020', '2019']) if d else {}
            surplus = extract_year_values(d.surplus_data, ['2020', '2019']) if d else {}

            if d:
                row.update({
                    "Company Status": d.company_status,
                    "Company Registered Number": d.company_registered_number,
                    "Incorporation Date": d.incorporation_date,
                    "Date of Latest Accounts": d.latest_accounts_date,
                    "Turnover Latest Year": turnover.get('latest'),
                    "Turnover Previous Financial Year": turnover.get('previous'),
                    "Turnover 2020": turnover.get('2020'),
                    "Turnover 2019": turnover.get('2019'),
                    "Profit Latest Year": profit.get('latest'),
                    "Profit Previous Financial Year": profit.get('previous'),
                    "Profit 2020": profit.get('2020'),
                    "Profit 2019": profit.get('2019'),
                    "Parent Company": d.parent_company,
                    "Nationality of Parent": d.nationality_of_parent,
                    "Auditor Name": d.auditor_name_latest,
                    "Auditor Firm": d.auditor_firm_latest,
                    "Number of UK DB Arrangements": d.number_of_uk_defined_benefit_arrangements,
                    "Name DB Arrangement 1": d.Name_of_Defined_Benefit_Arrangement_1,
                    "Scheme Actuary 1": d.scheme_actuary_1,
                    "Firm 1": d.scheme_actuary_firm_1,
                    "Status 1": d.Status_of_Defined_Benefit_Arrangement_1,
                    "Name DB Arrangement 2": d.Name_of_Defined_Benefit_Arrangement_2,
                    "Scheme Actuary 2": d.scheme_actuary_2,
                    "Firm 2": d.scheme_actuary_firm_2,
                    "Status 2": d.Status_of_Defined_Benefit_Arrangement_2,
                    "Name DB Arrangement 3": d.Name_of_Defined_Benefit_Arrangement_3,
                    "Scheme Actuary 3": d.scheme_actuary_3,
                    "Firm 3": d.scheme_actuary_firm_3,
                    "Status 3": d.Status_of_Defined_Benefit_Arrangement_3,
                    "Fair Value Latest": fair_value.get('latest'),
                    "Fair Value Previous": fair_value.get('previous'),
                    "Fair Value 2020": fair_value.get('2020'),
                    "Fair Value 2019": fair_value.get('2019'),
                    "Surplus Latest": surplus.get('latest'),
                    "Surplus Previous": surplus.get('previous'),
                    "Surplus 2020": surplus.get('2020'),
                    "Surplus 2019": surplus.get('2019'),
                    "Employer Contributions Latest": d.employer_contrib_latest_year,
                    "Employer Contributions Previous": d.employer_contrib_previous_year,
                    "Benefits Paid": d.benefits_paid,
                    "Expenses Latest": d.expenses_paid_latest_year,
                    "Expenses Previous": d.expenses_paid_previous_year,
                    "Defined Contribution Paid": d.defined_contrib_paid,
                    "Equities": d.assets_equities,
                    "Bonds": d.assets_bonds,
                    "Real Estate": d.assets_real_estate,
                    "LDI": d.assets_ldi,
                    "Cash": d.assets_cash,
                    "Other Assets": d.assets_other
                })

        main_rows.append(row)

    # Create DataFrames
    main_df = pd.DataFrame(main_rows)
    people_df = pd.DataFrame([{"Company Name": c.company_name, "People Data": "[People Placeholder]"} for c in companies]) if include_people else None
    summary_df = pd.DataFrame([{"Company Name": c.company_name, "Summary Notes": "[Summary Notes Placeholder]"} for c in companies]) if include_summary else None

    # Write to Excel in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        main_df.to_excel(writer, sheet_name="Main Data", index=False)
        if people_df is not None:
            people_df.to_excel(writer, sheet_name="People Data", index=False)
        if summary_df is not None:
            summary_df.to_excel(writer, sheet_name="Summary Notes", index=False)

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=exported_companies.xlsx"}
    )