import os
import csv,requests
from io import StringIO
from fastapi import Body
from fastapi.responses import StreamingResponse
import pandas as pd
from io import BytesIO
from decouple import config 
from app.core.config import REPROCESS_COMPANY_API,PROCESS_COMPANY_API
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
from app.models.people_data import PeopleData
from app.models.summary import SummaryNotes
from app.models.company_pdfs import CompanyPDFs
from app.models.company_charges import CompanyCharges
from app.models.key_financial_data import KeyFinancialData
from typing import List,Optional
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
def get_company_data(
    db: Session = Depends(get_db),
    page: int = 1,
    per_page: int = 100,
    search: str = None,
    sort_by: str = 'asc',
    show_inactive: bool = False,
    approval_filter: str = 'all'
):
    # Base query
    base_query = db.query(CompanyData)

    # Sorting
    if sort_by == 'asc':
        base_query = base_query.order_by(CompanyData.company_name.asc())
    elif sort_by == 'desc':
        base_query = base_query.order_by(CompanyData.company_name.desc())

    # Search filter
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        base_query = base_query.filter(CompanyData.company_name.ilike(search_term))
    else:
        # Active/inactive filter applies only when no search is provided
        base_query = base_query.join(
            KeyFinancialData, CompanyData.key_financial_data_id == KeyFinancialData.id, isouter=True
        )
        if not show_inactive:
            # Only active
            base_query = base_query.filter(KeyFinancialData.company_status == "Active")
        else:
            # Only inactive
            base_query = base_query.filter(KeyFinancialData.company_status== "Inactive")
    
    # Approval filter - applies regardless of search
    if approval_filter != 'all':
        if approval_filter == 'approved':
            base_query = base_query.filter(CompanyData.approval_stage == 1)
        elif approval_filter == 'unapproved':
            base_query = base_query.filter(CompanyData.approval_stage.in_([0, 2]))

    # Pagination
    total = base_query.count()
    offset = (page - 1) * per_page
    companies = base_query.offset(offset).limit(per_page).all()

    # --- preload related data ---
    key_data_ids = [c.key_financial_data_id for c in companies if c.key_financial_data_id]
    key_data_list = db.query(KeyFinancialData).filter(KeyFinancialData.id.in_(key_data_ids)).all()
    key_data_map = {k.id: k for k in key_data_list}

    registered_numbers = [kfd.company_registered_number for kfd in key_data_list if kfd.company_registered_number]
    pdf_data_map = {}
    if registered_numbers:
        pdf_data_list = db.query(CompanyPDFs).filter(
            CompanyPDFs.company_registered_number.in_(registered_numbers)
        ).all()
        pdf_data_map = {pdf.company_registered_number: pdf.pdf_links or [] for pdf in pdf_data_list}

    def extract_latest(json_data):
        if not json_data or not isinstance(json_data, dict):
            return None
        try:
            years = sorted(json_data.keys(), reverse=True)
            return json_data[years[0]] if years else None
        except Exception:
            return None

    # Track updates
    updated = False
    result = []

    for c in companies:
        key_financial_data = None
        if c.key_financial_data_id in key_data_map:
            kfd = key_data_map[c.key_financial_data_id]
            status_value = "Active" if kfd.company_registered_number else "Inactive"

            # Update DB if mismatch
            if kfd.company_status != status_value:
                kfd.company_status = status_value
                updated = True

            key_financial_data = {
                "company_status": kfd.company_status,
                "company_registered_number": kfd.company_registered_number,
                "incorporation_date": kfd.incorporation_date,
                "latest_accounts_date": kfd.latest_accounts_date,
                "Name_of_Defined_Benefit_Arrangement_1": kfd.Name_of_Defined_Benefit_Arrangement_1,
                "Status_of_Defined_Benefit_Arrangement_1": kfd.Status_of_Defined_Benefit_Arrangement_1,
                "scheme_actuary_1": kfd.scheme_actuary_1,
                "scheme_actuary_firm_1": kfd.scheme_actuary_firm_1,
                "Name_of_Defined_Benefit_Arrangement_2": kfd.Name_of_Defined_Benefit_Arrangement_2,
                "Status_of_Defined_Benefit_Arrangement_2": kfd.Status_of_Defined_Benefit_Arrangement_2,
                "scheme_actuary_2": kfd.scheme_actuary_2,
                "scheme_actuary_firm_2": kfd.scheme_actuary_firm_2,
                "Name_of_Defined_Benefit_Arrangement_3": kfd.Name_of_Defined_Benefit_Arrangement_3,
                "Status_of_Defined_Benefit_Arrangement_3": kfd.Status_of_Defined_Benefit_Arrangement_3,
                "scheme_actuary_3": kfd.scheme_actuary_3,
                "scheme_actuary_firm_3": kfd.scheme_actuary_firm_3,
            }
        else:
            status_value = "Inactive"

        result.append({
            "id": c.id,
            "company_name": c.company_name,
            "registration_number": key_data_map[c.key_financial_data_id].company_registered_number
                if c.key_financial_data_id in key_data_map else None,
            "company_status": status_value,
            "approval_stage": c.approval_stage,
            "status": c.status,
            "type_of_scheme": c.type_of_scheme,
            "last_modified": c.last_modified,
            "turnover_latest": extract_latest(key_data_map[c.key_financial_data_id].turnover_data)
                if c.key_financial_data_id in key_data_map else None,
            "assets_fair_value_latest": extract_latest(key_data_map[c.key_financial_data_id].fair_value_assets)
                if c.key_financial_data_id in key_data_map else None,
            "turnover_data": key_data_map[c.key_financial_data_id].turnover_data
                if c.key_financial_data_id in key_data_map else {},
            "fair_value_assets": key_data_map[c.key_financial_data_id].fair_value_assets
                if c.key_financial_data_id in key_data_map else {},
            "people_page_link": c.people_page_link or f"/people/{c.id}",
            "key_financial_data": key_financial_data,
            "pdf_links": pdf_data_map.get(
                key_data_map[c.key_financial_data_id].company_registered_number, []
            ) if c.key_financial_data_id in key_data_map else [],
        })

    if updated:
        db.commit()

    return {
        "data": result,
        "pagination": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }
    }



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

            company_name = company_name.replace("Ltd.", "Limited").replace("Ltd", "Limited")

            address_parts = [
                row.get("Address1"),
                row.get("Address2"),
                row.get("Address3"),
                row.get("City"),
                row.get("County")
            ]
            full_address = ", ".join([part for part in address_parts if part])

            try:
                api_response = requests.post(
                    PROCESS_COMPANY_API,
                    json={
                        "company": company_name,
                        "address": full_address
                    }
                )
                print(api_response.status_code, api_response.json())

                if api_response.status_code == 200:
                    csv_record = CSVFileData(
                        company_name=company_name,
                        address1=row.get("Address1"),
                        address2=row.get("Address2"),
                        address3=row.get("Address3"),
                        city=row.get("City"),
                        county=row.get("County"),
                    )
                    db.add(csv_record)
                    db.commit()  # commit each record

                else:
                    print(f"API failed for {company_name}: {api_response.status_code}")

            except Exception as e:
                print(f"Error fetching API data for {company_name}: {e}")

        return {"message": "File processed. Data saved in CSVFileData only when API returned 200."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@router.post("/reprocess-company/{company_id}")
def reprocess_company(company_id: int, db: Session = Depends(get_db)):
    # 1. Get the company instance
    company = db.query(CompanyData).filter(CompanyData.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    key_data = (
        db.query(KeyFinancialData)
        .filter(KeyFinancialData.id == company.key_financial_data_id)
        .first()
    )
    if not key_data:
        raise HTTPException(status_code=404, detail="Key financial data not found for this company")

    registration_number = key_data.company_registered_number or ""
    if not registration_number:
        raise HTTPException(status_code=400, detail="Registration number not found")
   
    # 2. First set status to "Not Started" to indicate re-run has been initiated
    company.status = "Not Started"
    db.commit()
    
    # 3. Now set status to Processing before calling ML API
    company.status = "Processing"
    db.commit()

    try:
        # 4. Call the external AI processing service
        api_response = requests.post(
           REPROCESS_COMPANY_API,
            json={"registration_id": registration_number}
        )
        print(f"API response for {company.company_name}: {api_response.status_code}")
        if api_response.status_code == 200:
            ml_data = api_response.json()
           
            # Update only if data is returned
            if ml_data:
                if 'turnover_data' in ml_data:
                    key_data.turnover_data = ml_data['turnover_data']
                if 'fair_value_assets' in ml_data:
                    key_data.fair_value_assets = ml_data['fair_value_assets']
                if 'profit_data' in ml_data:
                    key_data.profit_data = ml_data['profit_data']
                if 'surplus_data' in ml_data:
                    key_data.surplus_data = ml_data['surplus_data']
                # Add more fields as needed

                db.commit()
                company.company_status = "Active"   
            else:
                company.company_status = "Inactive" 
            company.status = "Done"
        else:
            company.status = "Not Started"
            print(f"API failed for {company.company_name}: {api_response.status_code}")

    except Exception as e:
        print(f"Reprocess failed: {e}")
        company.status = "Not Started"

    db.commit()

    # Return both message and new_status for frontend
    return {
        "message": f"Company reprocessed with status {company.status}",
        "new_status": company.status
    }

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
    include_charges = data.get("company_charges", False)


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
# Prepare main data
    main_rows = []
    for company in companies:
        # Get key financial data for this company
        d = key_data_by_id.get(company.key_financial_data_id) if company.key_financial_data_id else None
        
        # Combine the three status fields for Type of Scheme
        type_of_scheme_parts = []
        if d:
            if d.Status_of_Defined_Benefit_Arrangement_1:
                type_of_scheme_parts.append(d.Status_of_Defined_Benefit_Arrangement_1)
            if d.Status_of_Defined_Benefit_Arrangement_2:
                type_of_scheme_parts.append(d.Status_of_Defined_Benefit_Arrangement_2)
            if d.Status_of_Defined_Benefit_Arrangement_3:
                type_of_scheme_parts.append(d.Status_of_Defined_Benefit_Arrangement_3)
        
        # Join the parts with a separator (e.g., comma and space)
        type_of_scheme = ", ".join(type_of_scheme_parts) if type_of_scheme_parts else "Defined Benefit"
        
        row = {
            "Company Name": company.company_name,
            "Approval Status": company.approval_stage,
            "Status Code": company.status,
            "Type of Scheme": type_of_scheme
        }

        if include_key:
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
                    "Other Assets": d.assets_other,
                    "Diversified Growth": d.assets_diversified_growth,
                    "Alternatives": d.assets_alternatives,
                    "Insurance Contracts": d.assets_insurance_contracts,
                    "Current Company Name": d.current_company_name,
                    "SIC Code 1": d.sic1,
                    "SIC Code 2": d.sic2,
                    "Location": d.location,
                    "Nature of Business": d.nature_of_business,
                })

        main_rows.append(row)

    # Create DataFrames
    main_df = pd.DataFrame(main_rows)
    
    # Prepare People Data
    people_df = None
    if include_people:
        # 1. Get registered numbers for selected companies from KeyFinancialData
        registered_numbers = []
        for company in companies:
            if company.key_financial_data_id and company.key_financial_data_id in key_data_by_id:
                key_data = key_data_by_id[company.key_financial_data_id]
                if key_data.company_registered_number:
                    registered_numbers.append(key_data.company_registered_number)

        # 2. Fetch people data by matching on registered number
        people_data = []
        if registered_numbers:
            people_data = (
                db.query(PeopleData)
                .filter(PeopleData.company_registered_number.in_(registered_numbers))
                .all()
            )

        # 3. Map registered numbers to company names
        company_map = {}
        for company in companies:
            if company.key_financial_data_id and company.key_financial_data_id in key_data_by_id:
                key_data = key_data_by_id[company.key_financial_data_id]
                if key_data.company_registered_number:
                    company_map[key_data.company_registered_number] = company.company_name

        # 4. Build export rows
        people_rows = []
        for person in people_data:
            company_name = company_map.get(person.company_registered_number, "Unknown Company")
            people_rows.append({
                "Company Name": company_name,
                "Person Name": person.name or "",
                "Role/Position": person.role or "",
                "Appointment Date": person.appointment_date,
                "Date of Birth": person.date_of_birth
            })

        # Create DataFrame even if no data (will have headers)
        if people_rows:
            people_df = pd.DataFrame(people_rows)
        else:
            # Create empty DataFrame with proper headers
            people_df = pd.DataFrame(columns=[
                "Company Name", 
                "Person Name", 
                "Role/Position", 
                "Appointment Date", 
                "Date of Birth"
            ])
    
    # Prepare Summary Notes Data - UPDATED WITH REAL DATA
    summary_df = None
    if include_summary:
        # 1. Get registered numbers for selected companies from KeyFinancialData
        registered_numbers = []
        for company in companies:
            if company.key_financial_data_id and company.key_financial_data_id in key_data_by_id:
                key_data = key_data_by_id[company.key_financial_data_id]
                if key_data.company_registered_number:
                    registered_numbers.append(key_data.company_registered_number)

        # 2. Fetch summary data by matching on registered number
        summary_data = {}
        if registered_numbers:
            summary_notes_list = (
                db.query(SummaryNotes)
                .filter(SummaryNotes.company_registered_number.in_(registered_numbers))
                .all()
            )
            # Create a mapping of registration number to summary
            summary_data = {
                summary.company_registered_number: summary.summary 
                for summary in summary_notes_list
            }

        # 3. Build export rows
        summary_rows = []
        for company in companies:
            # Get the company's registered number
            key_data = key_data_by_id.get(company.key_financial_data_id)
            registration_number = key_data.company_registered_number if key_data else None
            
            if registration_number and registration_number in summary_data:
                summary_text = summary_data[registration_number]
            else:
                summary_text = "No summary available" if registration_number else "No summary available - registration number not found"

            summary_rows.append({
                "Company Name": company.company_name,
                "Company Registration Number": registration_number or "Not available",
                "Summary Notes": summary_text
            })

        # Create DataFrame
        if summary_rows:
            summary_df = pd.DataFrame(summary_rows)
        else:
            # Create empty DataFrame with proper headers
            summary_df = pd.DataFrame(columns=[
                "Company Name", 
                "Company Registration Number",
                "Summary Notes"
            ])
    
    # Prepare Company Charges Data
    charges_df = None
    if include_charges:
        # 1. Get registered numbers for selected companies
        registered_numbers = []
        for company in companies:
            if company.key_financial_data_id and company.key_financial_data_id in key_data_by_id:
                key_data = key_data_by_id[company.key_financial_data_id]
                if key_data.company_registered_number:
                    registered_numbers.append(key_data.company_registered_number)

        # 2. Fetch charges data by registered number
        charges_data = []
        if registered_numbers:
            charges_data = (
                db.query(CompanyCharges)
                .filter(CompanyCharges.company_registered_number.in_(registered_numbers))
                .all()
            )

        # 3. Map registered numbers to company names
        company_map = {}
        for company in companies:
            if company.key_financial_data_id and company.key_financial_data_id in key_data_by_id:
                key_data = key_data_by_id[company.key_financial_data_id]
                if key_data.company_registered_number:
                    company_map[key_data.company_registered_number] = company.company_name

        # 4. Build export rows
        charges_rows = []
        for charge in charges_data:
            company_name = company_map.get(charge.company_registered_number, "Unknown Company")
            charges_rows.append({
                "Company Name": company_name,
                "Company Registration Number": charge.company_registered_number,
                "Total Charges": charge.total_charges,
                "Charges": charge.charges  
            })

        # Create DataFrame even if no data (will have headers)
        if charges_rows:
            charges_df = pd.DataFrame(charges_rows)
        else:
            charges_df = pd.DataFrame(columns=[
                "Company Name",
                "Company Registration Number",
                "Total Charges",
                "Charges"
            ])

    # Write to Excel in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        # Main data sheet
        main_df.to_excel(writer, sheet_name="Main Data", index=False)
        
        # People data sheet (always include if requested, even if empty)
        if people_df is not None:
            people_df.to_excel(writer, sheet_name="People Data", index=False)
            
            # Get the workbook and worksheet objects for formatting
            workbook = writer.book
            people_worksheet = writer.sheets['People Data']
            
            # Add some basic formatting to the people sheet
            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#D7E4BC',
                'border': 1
            })
            
            # Apply header formatting
            for col_num, value in enumerate(people_df.columns.values):
                people_worksheet.write(0, col_num, value, header_format)
            
            # Auto-adjust column widths
            for column in people_df:
                column_length = max(people_df[column].astype(str).map(len).max(), len(column))
                col_idx = people_df.columns.get_loc(column)
                people_worksheet.set_column(col_idx, col_idx, min(column_length + 2, 50))
        
        # Summary notes sheet (always include if requested, even if empty)
        if summary_df is not None:
            summary_df.to_excel(writer, sheet_name="Summary Notes", index=False)
            
            # Get the workbook and worksheet objects for formatting
            workbook = writer.book
            summary_worksheet = writer.sheets['Summary Notes']
            
            # Add some basic formatting to the summary sheet
            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#FFE6CC',
                'border': 1
            })
            
            # Apply header formatting
            for col_num, value in enumerate(summary_df.columns.values):
                summary_worksheet.write(0, col_num, value, header_format)
            
            # Auto-adjust column widths
            for column in summary_df:
                column_length = max(summary_df[column].astype(str).map(len).max(), len(column))
                col_idx = summary_df.columns.get_loc(column)
                summary_worksheet.set_column(col_idx, col_idx, min(column_length + 2, 50))
        # Company Charges sheet (always include if requested, even if empty)
        # Charges data sheet
        if charges_df is not None:
            charges_df.to_excel(writer, sheet_name="Company Charges", index=False)

            workbook = writer.book
            charges_worksheet = writer.sheets['Company Charges']

            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#CCE5FF',
                'border': 1
            })

            # Apply header formatting
            for col_num, value in enumerate(charges_df.columns.values):
                charges_worksheet.write(0, col_num, value, header_format)

            # Auto-adjust column widths
            for column in charges_df:
                column_length = max(charges_df[column].astype(str).map(len).max(), len(column))
                col_idx = charges_df.columns.get_loc(column)
                charges_worksheet.set_column(col_idx, col_idx, min(column_length + 2, 50))
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=exported_companies.xlsx"}
    )  
      
@router.put("/update-registration-number/{company_id}")
def update_registration_number(company_id: int, data: dict = Body(...), db: Session = Depends(get_db)):
    new_number = data.get("registration_number")
    if not new_number:
        raise HTTPException(status_code=400, detail="registration_number is required")

    company = db.query(CompanyData).filter(CompanyData.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Step 1: Delete ALL existing entries with the same registration number first
    # This prevents any duplicates from existing in the system
    existing_entries_with_reg_num = (
        db.query(KeyFinancialData)
        .filter(KeyFinancialData.company_registered_number == new_number)
        .all()
    )
    for entry in existing_entries_with_reg_num:
        db.delete(entry)
    
    # Step 2: Delete the company's current key financial data if it exists and wasn't already deleted
    if company.key_financial_data_id:
        remaining_old_data = (
            db.query(KeyFinancialData)
            .filter(KeyFinancialData.id == company.key_financial_data_id)
            .first()
        )
        if remaining_old_data:
            db.delete(remaining_old_data)
    
    # Flush all deletions before creating new entry
    db.flush()

    # Step 3: Create new key financial data with ONLY these three fields populated
    # All other fields will be NULL by default
    key_data = KeyFinancialData(
        company_registered_number=new_number,
        company_name=company.company_name if hasattr(company, 'company_name') else None,
        company_status="Active"
    )
    db.add(key_data)
    db.flush()  # Get the new ID
    
    # Step 4: Link company to the new key financial data entry
    company.key_financial_data_id = key_data.id
    
    # Commit all changes
    db.commit()
    db.refresh(company)

    return {
        "message": "Registration number updated successfully",
        "new_registration_number": new_number,
    }



@router.put("/update-approval-stage/{company_id}")
def update_approval_stage(company_id: int, data: dict = Body(...), db: Session = Depends(get_db)):
    new_stage = data.get("approval_stage")
    if new_stage not in [0, 1, 2]:
        raise HTTPException(status_code=400, detail="Invalid approval stage")

    company = db.query(CompanyData).filter(CompanyData.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company.approval_stage = new_stage
    
    # If approval stage is set to Rejected (2) or Unapproved (0), set status to "Not Started"
    if new_stage in [0, 2]:
        company.status = "Not Started"  
    
    db.commit()
    return {
        "message": "Approval stage updated",
        "new_status": company.status
    }
    
    
@router.get("/people/{company_registered_number}")
def get_people_for_company(company_registered_number: str, db: Session = Depends(get_db)):

    # Check if the company exists in key_financial_data table
    company_exists = (
        db.query(KeyFinancialData)
        .filter(KeyFinancialData.company_registered_number == company_registered_number)
        .first()
    )

    if not company_exists:
        raise HTTPException(status_code=404, detail="Company not found")

    # If company exists, get all people for that registered number
    people = (
        db.query(PeopleData)
        .filter(PeopleData.company_registered_number == company_registered_number)
        .all()
    )

    if not people:
        return []

    # Return people data
    result = [
        {
            "id": person.id,
            "name": person.name,
            "role": person.role,
            "appointment_date": person.appointment_date,
            "date_of_birth": person.date_of_birth,
            "company_registered_number": person.company_registered_number,
        }
        for person in people
    ]

    return result

@router.get("/summary-notes/{company_id}")
def get_summary_notes(company_id: int, db: Session = Depends(get_db)):
    """Get summary notes for a company by company ID"""
    # First get the company's registered number
    company = db.query(CompanyData).filter(CompanyData.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get key financial data to find registered number
    key_data = db.query(KeyFinancialData).filter(
        KeyFinancialData.id == company.key_financial_data_id
    ).first()
    
    if not key_data or not key_data.company_registered_number:
        return {"summary": "No summary available - registration number not found"}
    
    # Find summary notes by registered number
    summary_notes = db.query(SummaryNotes).filter(
        SummaryNotes.company_registered_number == key_data.company_registered_number
    ).first()
    
    if not summary_notes:
        return {"summary": "No summary notes available for this company"}
    
    return {
        "summary": summary_notes.summary,
        "company_registered_number": summary_notes.company_registered_number,
        "created_at": summary_notes.created_at,
        "updated_at": summary_notes.updated_at
    }

@router.post("/summary-notes/{company_id}")
def create_or_update_summary_notes(
    company_id: int, 
    data: dict = Body(...), 
    db: Session = Depends(get_db)
):
    """Create or update summary notes for a company, skipping exact duplicates"""
    summary_text = data.get("summary")
    if not summary_text:
        raise HTTPException(status_code=400, detail="Summary text is required")
    
    # Get company and registered number
    company = db.query(CompanyData).filter(CompanyData.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    key_data = db.query(KeyFinancialData).filter(
        KeyFinancialData.id == company.key_financial_data_id
    ).first()
    
    if not key_data or not key_data.company_registered_number:
        raise HTTPException(status_code=400, detail="Company registration number not found")
    
    # Check if summary already exists
    existing_summary = db.query(SummaryNotes).filter(
        SummaryNotes.company_registered_number == key_data.company_registered_number
    ).first()
    
    # If same registration number & summary text exists → skip insertion
    if existing_summary and existing_summary.summary.strip() == summary_text.strip():
        return {"message": "Duplicate summary - no changes made"}
    
    if existing_summary:
        # Update only if content differs
        existing_summary.summary = summary_text
        db.commit()
        return {"message": "Summary updated successfully"}
    else:
        # Create new summary
        new_summary = SummaryNotes(
            company_registered_number=key_data.company_registered_number,
            summary=summary_text
        )
        db.add(new_summary)
        db.commit()
        return {"message": "Summary created successfully"}

@router.get("/summary-notes-by-registration/{registration_number}")
def get_summary_by_registration(registration_number: str, db: Session = Depends(get_db)):
    """Get summary notes by registration number directly"""
    summary_notes = db.query(SummaryNotes).filter(
        SummaryNotes.company_registered_number == registration_number
    ).first()
    
    if not summary_notes:
        return {"summary": "No summary notes available for this registration number"}
    
    return {
        "summary": summary_notes.summary,
        "company_registered_number": summary_notes.company_registered_number,
        "created_at": summary_notes.created_at,
        "updated_at": summary_notes.updated_at
    }
    
@router.get("/company-pdfs/{registration_number}")
def get_company_pdfs(registration_number: str, db: Session = Depends(get_db)):
    """Get PDF links for a company by registration number"""
    company_pdfs = db.query(CompanyPDFs).filter(
        CompanyPDFs.company_registered_number == registration_number
    ).first()
    
    if not company_pdfs or not company_pdfs.pdf_links:
        return {"pdf_links": []}
    
    return {"pdf_links": company_pdfs.pdf_links}
