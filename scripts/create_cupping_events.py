import requests
from config import BASE_URL, LOCATION_ADDRESS, WORK_HOURS_SCHEDULE_ID, HEADERS as headers


def create_event(title, slug, length_minutes, price_cents, description=""):
    payload = {
        "title": title,
        "slug": slug,
        "lengthInMinutes": length_minutes,
        "description": description,
        "locations": [
            {
                "type": "address",
                "address": LOCATION_ADDRESS,
                "public": True,
            }
        ],
        "price": price_cents,
        "currency": "usd",
        "scheduleId": WORK_HOURS_SCHEDULE_ID,
        "minimumBookingNotice": 2880,
        "beforeEventBuffer": 15,
        "afterEventBuffer": 15,
    }
    r = requests.post(f"{BASE_URL}/event-types", headers=headers, json=payload)
    data = r.json()
    if r.status_code in (200, 201):
        ev = data["data"]
        print(f"✓ {ev['title']} — ${ev['price'] / 100:.2f} — {ev['bookingUrl']}")
        return ev["id"]
    else:
        print(f"✗ Error for '{title}': {data}")
        return None


CUPPING_SERVICES = [
    {
        "title": "One Side Full Body Detox - Front (CPT-97139)",
        "slug": "cupping-full-body-detox-front",
        "length_minutes": 60,
        "price_cents": 40000,
        "description": "Full front-body cupping detox session to stimulate circulation and release toxins.\nCPT Code: CPT-97139",
    },
    {
        "title": "One Side Full Body Detox - Back (CPT-97139)",
        "slug": "cupping-full-body-detox-back",
        "length_minutes": 120,
        "price_cents": 40000,
        "description": "Full back-body cupping detox session for deep tissue release and lymphatic support.\nCPT Code: CPT-97139",
    },
    {
        "title": "Back Maintenance Cupping & Acupressure (CPT-97139)",
        "slug": "cupping-back-maintenance",
        "length_minutes": 60,
        "price_cents": 25000,
        "description": "Regular back maintenance combining cupping and acupressure for ongoing tension relief.\nCPT Code: CPT-97139",
    },
    {
        "title": "Leakage Care for 5 (CPT-94640)",
        "slug": "cupping-leakage-care",
        "length_minutes": 60,
        "price_cents": 25000,
        "description": "Oxygen LED cupping bubble cleaning treatment, session of 5.\nCPT Code: CPT-94640",
    },
    {
        "title": "Front Maintenance Cupping & Acupressure (CPT-97139)",
        "slug": "cupping-front-maintenance",
        "length_minutes": 60,
        "price_cents": 25000,
        "description": "Monthly or bi-weekly front-body cupping and acupressure maintenance session.\nCPT Code: CPT-97139",
    },
    {
        "title": "Meridian Exam",
        "slug": "cupping-meridian-exam",
        "length_minutes": 30,
        "price_cents": 25000,
        "description": "Comprehensive meridian examination to assess energy flow and guide treatment planning.",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(CUPPING_SERVICES)} cupping services...\n")
    for service in CUPPING_SERVICES:
        create_event(**service)
