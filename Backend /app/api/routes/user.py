from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.utils.jwt import create_access_token
from app.schemas.user import *
from app.crud.user import create_user
from app.models.user import User
from passlib.context import CryptContext


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


@router.post("/login")
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
