import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")

API_KEY = os.environ.get("CAL_API_KEY")
if not API_KEY:
    raise EnvironmentError("CAL_API_KEY is not set. Add it to .env.local")

BASE_URL = "https://api.cal.com/v2"
LOCATION_ADDRESS = "1108 W Parker Rd Ste 102 Plano, TX 75075"
WORK_HOURS_SCHEDULE_ID = 1493459
VIRTUAL_CONSULTATION_SCHEDULE_ID = 1493460

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "cal-api-version": "2024-06-14",
    "Content-Type": "application/json",
}
