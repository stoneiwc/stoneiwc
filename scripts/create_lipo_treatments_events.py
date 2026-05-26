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


LIPO_TREATMENTS_SERVICES = [
    {
        "title": "Skin Fold Lymphatic Drainage for Face and Neck",
        "slug": "lipo-treatments-lymphatic-face-neck",
        "length_minutes": 60,
        "price_cents": 35000,
        "description": "PR Cell Lipo Machine skin fold and connective tissue treatment for face and neck. Supports lymphatic flow without fat melting.",
    },
    {
        "title": "Lipo Treatment - Face with Neck",
        "slug": "lipo-treatments-face-neck",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Advanced lipo treatment targeting the face and neck for contouring and skin tightening.",
    },
    {
        "title": "Lipo Treatment - Arms",
        "slug": "lipo-treatments-arms",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Lipo treatment for the arms to reduce localized fat and improve skin texture.",
    },
    {
        "title": "Lipo Treatment - UnderArms",
        "slug": "lipo-treatments-underarms",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Targeted lipo treatment for the underarm area for contouring and smoothing.",
    },
    {
        "title": "Lipo Treatment - Calf",
        "slug": "lipo-treatments-calf",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Lipo treatment for the calf area to sculpt and define the lower leg.",
    },
    {
        "title": "Lipo Treatment - Inner Thigh",
        "slug": "lipo-treatments-inner-thigh",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Lipo treatment targeting the inner thigh for contouring and skin refinement.",
    },
    {
        "title": "Lipo Treatment - Legs",
        "slug": "lipo-treatments-legs",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Full leg lipo treatment for overall leg contouring and fat reduction.",
    },
    {
        "title": "Lipo Treatment - Buttocks",
        "slug": "lipo-treatments-buttocks",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Lipo treatment for the buttocks to lift, contour, and refine the silhouette.",
    },
    {
        "title": "Lipo Treatment - Stomach",
        "slug": "lipo-treatments-stomach",
        "length_minutes": 60,
        "price_cents": 70000,
        "description": "Abdominal lipo treatment to reduce stubborn fat and contour the midsection.",
    },
    {
        "title": "Skin Fold Lymphatic Drainage for Body",
        "slug": "lipo-treatments-lymphatic-body",
        "length_minutes": 60,
        "price_cents": 45000,
        "description": "Full-body skin fold and connective tissue lymphatic drainage using the PR Cell Lipo Machine.",
    },
]


if __name__ == "__main__":
    print(f"Creating {len(LIPO_TREATMENTS_SERVICES)} lipo treatment services...\n")
    for service in LIPO_TREATMENTS_SERVICES:
        create_event(**service)
