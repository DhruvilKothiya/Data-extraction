import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file variables

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

REPROCESS_COMPANY_API = os.getenv("REPROCESS_COMPANY_API")
PROCESS_COMPANY_API = os.getenv("PROCESS_COMPANY_API")
