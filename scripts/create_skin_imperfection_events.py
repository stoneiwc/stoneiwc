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


SKIN_IMPERFECTION_SERVICES = [
    {
        "title": "Wart Removal (CPT-17999)",
        "slug": "skin-imperfection-wart-removal",
        "length_minutes": 10,
        "price_cents": 8500,
        "description": "Wart removal via electrolysis for precise and effective treatment.\nCPT Code: CPT-17999",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(SKIN_IMPERFECTION_SERVICES)} skin imperfection services...\n")
    for service in SKIN_IMPERFECTION_SERVICES:
        create_event(**service)
