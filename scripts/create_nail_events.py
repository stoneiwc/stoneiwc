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


NAIL_SERVICES = [
    {
        "title": "Complete Foot Treatment",
        "slug": "nail-complete-foot-treatment",
        "length_minutes": 90,
        "price_cents": 17500,
        "description": "Comprehensive foot care treatment including exfoliation, nail care, and moisturizing for healthy, refreshed feet.",
    },
    {
        "title": "Ingrown Toe Nail Removal (CPT-11750)",
        "slug": "nail-ingrown-toenail-removal",
        "length_minutes": 45,
        "price_cents": 7500,
        "description": "Safe and precise ingrown toenail removal to relieve pain and prevent infection.\nCPT Code: CPT-11750",
    },
    {
        "title": "Hand Calcium Deposit Removal (CPT-29999)",
        "slug": "nail-hand-calcium-deposit-removal",
        "length_minutes": 60,
        "price_cents": 7500,
        "description": "Removal of calcium deposits from the hands for improved comfort and appearance.\nCPT Code: CPT-29999",
    },
    {
        "title": "Foot Calcium Deposit Removal (CPT-29999)",
        "slug": "nail-foot-calcium-deposit-removal",
        "length_minutes": 45,
        "price_cents": 7500,
        "description": "Removal of calcium deposits from the feet for improved comfort and mobility.\nCPT Code: CPT-29999",
    },
    {
        "title": "Gel Nail - Hands",
        "slug": "nail-gel-hands",
        "length_minutes": 60,
        "price_cents": 5000,
        "description": "Gel nail application for the hands for a polished, long-lasting finish.",
    },
    {
        "title": "Nail Removal",
        "slug": "nail-removal",
        "length_minutes": 60,
        "price_cents": 1500,
        "description": "Safe removal of gel, acrylic, or builder nail enhancements.",
    },
    {
        "title": "Basic Gel Nail",
        "slug": "nail-basic-gel",
        "length_minutes": 30,
        "price_cents": 6000,
        "description": "Basic gel nail application for a clean, glossy look with lasting wear.",
    },
    {
        "title": "Gel X",
        "slug": "nail-gel-x",
        "length_minutes": 60,
        "price_cents": 9000,
        "description": "Gel X nail extension system for natural-looking, durable nail enhancements.",
    },
    {
        "title": "Builder Gel",
        "slug": "nail-builder-gel",
        "length_minutes": 60,
        "price_cents": 8500,
        "description": "Builder gel application for added nail strength, length, and structure.",
    },
    {
        "title": "French Manicure",
        "slug": "nail-french-manicure",
        "length_minutes": 60,
        "price_cents": 1500,
        "description": "Classic French manicure add-on for a timeless, elegant nail finish.",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(NAIL_SERVICES)} nail services...\n")
    for service in NAIL_SERVICES:
        create_event(**service)
