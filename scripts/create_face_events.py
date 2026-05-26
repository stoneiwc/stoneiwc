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


FACE_SERVICES = [
    {
        "title": "Manual Microdermabrasion",
        "slug": "face-manual-microdermabrasion",
        "length_minutes": 60,
        "price_cents": 17500,
        "description": "Deep exfoliation treatment for the face to resurface skin, reduce fine lines, and improve texture.",
    },
    {
        "title": "French Peel for Face CVI (CPT-97032, CPT-15789)",
        "slug": "face-french-peel-cvi",
        "length_minutes": 60,
        "price_cents": 12500,
        "description": "Chemical peel targeting chronic venous insufficiency-related skin concerns on the face.\nCPT Codes: CPT-97032, CPT-15789",
    },
    {
        "title": "Advanced Facials and French Peel (CPT-15789)",
        "slug": "face-advanced-facials-french-peel",
        "length_minutes": 45,
        "price_cents": 15000,
        "description": "Combined advanced facial and chemical peel for deep cleansing and skin renewal.\nCPT Code: CPT-15789",
    },
    {
        "title": "One Ear Detox (CPT-69210)",
        "slug": "face-one-ear-detox",
        "length_minutes": 45,
        "price_cents": 7500,
        "description": "Single ear candling session to remove buildup and support ear health.\nCPT Code: CPT-69210",
    },
    {
        "title": "Two Ears Detox (CPT-69210)",
        "slug": "face-two-ears-detox",
        "length_minutes": 45,
        "price_cents": 15000,
        "description": "Dual ear candling session for complete ear detoxification.\nCPT Code: CPT-69210",
    },
    {
        "title": "Lymphatic Facial Detoxification and Lift (CPT-97032)",
        "slug": "face-lymphatic-facial-detox-lift",
        "length_minutes": 60,
        "price_cents": 35000,
        "description": "Manual lymphatic drainage for the face to reduce puffiness, detoxify, and lift facial contours.\nCPT Code: CPT-97032",
    },
    {
        "title": "TMJ (CPT-97139)",
        "slug": "face-tmj",
        "length_minutes": 60,
        "price_cents": 25000,
        "description": "Targeted cupping therapy for the TMJ area to relieve jaw tension and discomfort.\nCPT Code: CPT-97139",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(FACE_SERVICES)} face services...\n")
    for service in FACE_SERVICES:
        create_event(**service)
