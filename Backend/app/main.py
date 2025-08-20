from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import user
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",'https://9fddc5a511e4.ngrok-free.app' ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/api")
