import os
import csv
from io import StringIO
from decouple import config 
from fastapi import APIRouter, Depends, HTTPException,Request,File, UploadFile
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
                existing_company = db.query(CompanyData).filter(CompanyData.company_name == company_name).first()
                if not existing_company:
                    company_data = CompanyData(
                        company_name=company_name,
                        identifier=f"ID_{company_name[:5]}_{str(csv_reader.line_num)}",
                        rating=None,
                        key_financial_data=None,
                        downloaded_pdfs=None,
                        pension_summary=None,
                        director_info=None,
                        approval_stage=0,
                    )
                    db.add(company_data)

        db.commit()
        return {"message": "File processed and data saved successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
