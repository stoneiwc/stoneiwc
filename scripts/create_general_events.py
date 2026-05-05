import requests
from config import BASE_URL, LOCATION_ADDRESS, WORK_HOURS_SCHEDULE_ID, VIRTUAL_CONSULTATION_SCHEDULE_ID, HEADERS as headers


def create_event(title, slug, length_minutes, price_cents, description="", schedule_id=WORK_HOURS_SCHEDULE_ID):
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
        "scheduleId": schedule_id,
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


GENERAL_SERVICES = [
    # Wellness
    {
        "title": "Stretch Adjustment (Head Scalp Adjustment)",
        "slug": "wellness-stretch-adjustment",
        "length_minutes": 60,
        "price_cents": 8500,
        "description": "Stretch adjustment with head and scalp manipulation to relieve tension and support alignment.",
        "schedule_id": WORK_HOURS_SCHEDULE_ID,
    },
    {
        "title": "Head Scalp Adjustment",
        "slug": "wellness-head-scalp-adjustment",
        "length_minutes": 20,
        "price_cents": 7500,
        "description": "Targeted head and scalp adjustment to release tension and promote relaxation.",
        "schedule_id": WORK_HOURS_SCHEDULE_ID,
    },
    # Consultation
    {
        "title": "In Person Consultation",
        "slug": "consultation-in-person",
        "length_minutes": 60,
        "price_cents": 25000,
        "description": "In-person wellness consultation to assess your health goals and create a personalized treatment plan.",
        "schedule_id": WORK_HOURS_SCHEDULE_ID,
    },
    # Virtual Consultation
    {
        "title": "Virtual Consultation",
        "slug": "consultation-virtual",
        "length_minutes": 15,
        "price_cents": 0,
        "description": "Complimentary 15-minute virtual consultation to discuss your wellness needs and explore treatment options.",
        "schedule_id": VIRTUAL_CONSULTATION_SCHEDULE_ID,
    },
]


if __name__ == "__main__":
    print(f"Creating {len(GENERAL_SERVICES)} general services...\n")
    for service in GENERAL_SERVICES:
        create_event(**service)
