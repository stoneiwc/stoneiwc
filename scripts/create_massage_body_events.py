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


MASSAGE_BODY_SERVICES = [
    {
        "title": "Hot/Cold-Pack (CPT-97010)",
        "slug": "massage-body-hot-cold-pack",
        "length_minutes": 20,
        "price_cents": 1000,
        "description": "Therapeutic hot or cold pack application to reduce inflammation and ease muscle tension.\nCPT Code: CPT-97010",
    },
    {
        "title": "Manual Therapy (CPT-97140)",
        "slug": "massage-body-manual-therapy",
        "length_minutes": 10,
        "price_cents": 12500,
        "description": "Focused hands-on manual therapy to address areas of tension, support mobility, and promote overall well-being.\nCPT Code: CPT-97140",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(MASSAGE_BODY_SERVICES)} massage & body services...\n")
    for service in MASSAGE_BODY_SERVICES:
        create_event(**service)
