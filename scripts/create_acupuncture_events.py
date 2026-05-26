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


ACUPUNCTURE_SERVICES = [
    {
        "title": "Acupuncture; 15 min (CPT-97810)",
        "slug": "acupuncture-15min",
        "length_minutes": 15,
        "price_cents": 4500,
        "description": "Acupuncture with one or more needles, initial 15-minute session without electrical stimulation.\nCPT Code: CPT-97810",
    },
    {
        "title": "Acupuncture; 25 min (CPT-97811)",
        "slug": "acupuncture-25min",
        "length_minutes": 25,
        "price_cents": 7500,
        "description": "Acupuncture with one or more needles, 25-minute session without electrical stimulation.\nCPT Code: CPT-97811",
    },
    {
        "title": "Acupuncture; 35 min (CPT-97813)",
        "slug": "acupuncture-35min",
        "length_minutes": 35,
        "price_cents": 9500,
        "description": "Acupuncture initial 15-minute session with electrical stimulation for enhanced therapeutic effect.\nCPT Code: CPT-97813",
    },
    {
        "title": "Acupuncture; 45 min (CPT-97814)",
        "slug": "acupuncture-45min",
        "length_minutes": 45,
        "price_cents": 11000,
        "description": "Acupuncture additional 15-minute session with electrical stimulation.\nCPT Code: CPT-97814",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(ACUPUNCTURE_SERVICES)} acupuncture services...\n")
    for service in ACUPUNCTURE_SERVICES:
        create_event(**service)
