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


WAXING_SERVICES = [
    {
        "title": "Eyebrow Arch",
        "slug": "waxing-eyebrow-arch",
        "length_minutes": 15,
        "price_cents": 3500,
        "description": "Precision eyebrow arch waxing to enhance your natural brow shape and frame your face.",
    },
    {
        "title": "Eyebrow Waxing",
        "slug": "waxing-eyebrow",
        "length_minutes": 30,
        "price_cents": 3500,
        "description": "Full eyebrow waxing for clean, defined brows tailored to your face shape.",
    },
    {
        "title": "Bikini Waxing - Full",
        "slug": "waxing-bikini-full",
        "length_minutes": 60,
        "price_cents": 7500,
        "description": "Full bikini wax for smooth, long-lasting results.",
    },
    {
        "title": "Half Leg Waxing - Full",
        "slug": "waxing-half-leg",
        "length_minutes": 45,
        "price_cents": 7500,
        "description": "Full half-leg wax from the knee down for smooth, hair-free skin.",
    },
    {
        "title": "Full Leg Waxing - Full",
        "slug": "waxing-full-leg",
        "length_minutes": 60,
        "price_cents": 9500,
        "description": "Complete full-leg wax for silky smooth results from ankle to upper thigh.",
    },
    {
        "title": "Half Back Waxing - Full",
        "slug": "waxing-half-back",
        "length_minutes": 30,
        "price_cents": 7500,
        "description": "Half back wax targeting the upper or lower back for clean, smooth skin.",
    },
    {
        "title": "Full Back Waxing - Full",
        "slug": "waxing-full-back",
        "length_minutes": 60,
        "price_cents": 9500,
        "description": "Full back wax for complete hair removal and smooth skin across the entire back.",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(WAXING_SERVICES)} waxing services...\n")
    for service in WAXING_SERVICES:
        create_event(**service)
