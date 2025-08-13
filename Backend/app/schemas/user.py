from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    terms_accepted: bool

    class Config:
        from_attributes = True  

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr

    class Config:
        from_attributes = True 
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# schemas/user.py
class EmailSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str

