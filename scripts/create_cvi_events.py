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


CVI_SERVICES = [
    {
        "title": "Lymphatic Drainage For Body CVI (CPT-97032)",
        "slug": "chronic-venous-insufficiency-lymphatic-drainage",
        "length_minutes": 60,
        "price_cents": 45000,
        "description": "Chronic venous insufficiency lymphatic drainage for the body, attended session to support circulation and reduce venous congestion.\nCPT Code: CPT-97032",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(CVI_SERVICES)} CVI services...\n")
    for service in CVI_SERVICES:
        create_event(**service)
