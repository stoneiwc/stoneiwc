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


MICROPIGMENTATION_SERVICES = [
    {
        "title": "Eyebrow Correction",
        "slug": "micropigmentation-eyebrow-correction",
        "length_minutes": 60,
        "price_cents": 40000,
        "description": "Semi-permanent eyebrow correction to reshape, define, and enhance your natural brow line.",
    },
    {
        "title": "3D-Hair Stroke",
        "slug": "micropigmentation-3d-hair-stroke",
        "length_minutes": 60,
        "price_cents": 60000,
        "description": "Advanced 3D hair stroke technique for hyper-realistic, natural-looking eyebrow microblading.",
    },
    {
        "title": "Up Eyes Liner",
        "slug": "micropigmentation-up-eyes-liner",
        "length_minutes": 60,
        "price_cents": 40000,
        "description": "Semi-permanent upper eyeliner for a defined, lasting eye look without daily makeup.",
    },
    {
        "title": "Lower Eyes Liner",
        "slug": "micropigmentation-lower-eyes-liner",
        "length_minutes": 60,
        "price_cents": 40000,
        "description": "Semi-permanent lower eyeliner to enhance eye depth and definition.",
    },
    {
        "title": "Eyelid Upper Liners (CPT-11921)",
        "slug": "micropigmentation-eyelid-upper-liners",
        "length_minutes": 120,
        "price_cents": 40000,
        "description": "Precision semi-permanent pigmentation along the upper eyelid for long-lasting definition.\nCPT Code: CPT-11921",
    },
    {
        "title": "Eyelid Lower Liners (CPT-11921)",
        "slug": "micropigmentation-eyelid-lower-liners",
        "length_minutes": 120,
        "price_cents": 40000,
        "description": "Precision semi-permanent pigmentation along the lower eyelid.\nCPT Code: CPT-11921",
    },
    {
        "title": "PE-109 Full Lips",
        "slug": "micropigmentation-pe109-full-lips",
        "length_minutes": 150,
        "price_cents": 80000,
        "description": "Full lip semi-permanent pigmentation using the PE-109 technique for natural color and definition.",
    },
    {
        "title": "One Areola",
        "slug": "micropigmentation-one-areola",
        "length_minutes": 60,
        "price_cents": 45000,
        "description": "Single areola semi-permanent pigmentation for post-surgical restoration or cosmetic enhancement.",
    },
    {
        "title": "Two Areola",
        "slug": "micropigmentation-two-areola",
        "length_minutes": 120,
        "price_cents": 80000,
        "description": "Bilateral areola semi-permanent pigmentation for post-surgical restoration or cosmetic enhancement.",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(MICROPIGMENTATION_SERVICES)} micropigmentation services...\n")
    for service in MICROPIGMENTATION_SERVICES:
        create_event(**service)
