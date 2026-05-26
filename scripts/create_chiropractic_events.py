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


CHIROPRACTIC_SERVICES = [
    {
        "title": "Chiropractic Manipulative Treatment (CPT-98943)",
        "slug": "chiropractic-manipulative-treatment",
        "length_minutes": 60,
        "price_cents": 12500,
        "description": "Gentle chiropractic manipulative treatment to support spinal alignment, mobility, and overall well-being.\nCPT Code: CPT-98943",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(CHIROPRACTIC_SERVICES)} chiropractic services...\n")
    for service in CHIROPRACTIC_SERVICES:
        create_event(**service)
