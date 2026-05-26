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


LASH_EXTENSION_SERVICES = [
    {
        "title": "Full Lash Extension & Eye Lift",
        "slug": "lash-extension-full-set-eye-lift",
        "length_minutes": 60,
        "price_cents": 25000,
        "description": "Full-set lash extension with an eye lift for a dramatic, long-lasting look.",
    },
    {
        "title": "Refill Every 2 Weeks",
        "slug": "lash-extension-refill-biweekly",
        "length_minutes": 30,
        "price_cents": 6000,
        "description": "Biweekly lash refill to maintain your full set and keep your extensions looking fresh.",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(LASH_EXTENSION_SERVICES)} lash extension services...\n")
    for service in LASH_EXTENSION_SERVICES:
        create_event(**service)
