from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    terms_accepted: bool

    class Config:
        orm_mode = True

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

