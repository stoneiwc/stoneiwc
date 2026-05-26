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


HAIR_SERVICES = [
    {
        "title": "Woman Haircut Short & Style",
        "slug": "hair-woman-haircut-short-style",
        "length_minutes": 50,
        "price_cents": 9500,
        "description": "Precision cut and style for short hair, tailored to your face shape and lifestyle.",
    },
    {
        "title": "Woman Haircut Long & Style",
        "slug": "hair-woman-haircut-long-style",
        "length_minutes": 60,
        "price_cents": 8500,
        "description": "Expert cut and blowout for long hair, finished to your preferred style.",
    },
    {
        "title": "Special Occasion Hair Styling",
        "slug": "hair-special-occasion-hair-styling",
        "length_minutes": 60,
        "price_cents": 15000,
        "description": "Elegant updo or styled look for weddings, events, and special occasions.",
    },
    {
        "title": "Men Haircut Short & Style",
        "slug": "hair-men-haircut-short-style",
        "length_minutes": 30,
        "price_cents": 6500,
        "description": "Clean, precise cut and style for short men's hair.",
    },
    {
        "title": "Men Haircut Long & Style",
        "slug": "hair-men-haircut-long-style",
        "length_minutes": 60,
        "price_cents": 8500,
        "description": "Tailored cut and style for men with longer hair.",
    },
    {
        "title": "Scalp Treatment for Hair Loss",
        "slug": "hair-scalp-treatment-for-hair-loss",
        "length_minutes": 30,
        "price_cents": 6500,
        "description": "Targeted scalp treatment to stimulate circulation and support hair restoration.",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(HAIR_SERVICES)} hair services...\n")
    for service in HAIR_SERVICES:
        create_event(**service)
