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


BODY_TRANSFORMATION_SERVICES = [
    {
        "title": "Electrical Stimulation (CPT-97032)",
        "slug": "body-transformation-electrical-stimulation",
        "length_minutes": 15,
        "price_cents": 10000,
        "description": "Targeted electrical stimulation therapy to tone muscles and support body contouring.\nCPT Code: CPT-97032",
    },
    {
        "title": "Belly Button Detox",
        "slug": "body-transformation-belly-button-detox",
        "length_minutes": 60,
        "price_cents": 15000,
        "description": "Belly button candling treatment to cleanse and detoxify through the navel.",
    },
    {
        "title": "Microdermabrasion for Body with Peel (CPT-15983)",
        "slug": "body-transformation-microdermabrasion-with-peel",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Oxygen microdermabrasion combined with a chemical peel for full-body skin resurfacing and renewal.\nCPT Code: CPT-15983",
    },
    {
        "title": "Body Transformation",
        "slug": "body-transformation-full",
        "length_minutes": 60,
        "price_cents": 35000,
        "description": "Comprehensive body transformation session combining multiple modalities for contouring and rejuvenation.",
    },
    {
        "title": "EVS Deep Massage For Body (CPT-97124)",
        "slug": "body-transformation-evs-deep-massage",
        "length_minutes": 60,
        "price_cents": 35000,
        "description": "EVS deep massage therapy for the body to relieve tension, improve circulation, and support recovery.\nCPT Code: CPT-97124",
    },
    {
        "title": "EVS Lymphatic Drainage For Body (CPT-97124)",
        "slug": "body-transformation-evs-lymphatic-drainage",
        "length_minutes": 60,
        "price_cents": 35000,
        "description": "EVS lymphatic drainage massage to reduce fluid retention, detoxify, and contour the body.\nCPT Code: CPT-97124",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(BODY_TRANSFORMATION_SERVICES)} body transformation services...\n")
    for service in BODY_TRANSFORMATION_SERVICES:
        create_event(**service)
