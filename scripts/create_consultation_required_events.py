import requests
from config import BASE_URL, LOCATION_ADDRESS, WORK_HOURS_SCHEDULE_ID, HEADERS as headers


def get_existing_events():
    """Fetch all existing event types and return a dict of slug -> id."""
    all_events = {}
    offset = 0
    limit = 100
    while True:
        r = requests.get(
            f"{BASE_URL}/event-types",
            headers=headers,
            params={"limit": limit, "offset": offset},
        )
        data = r.json()
        events = data.get("data", [])
        if not events:
            break
        for ev in events:
            all_events[ev["slug"]] = ev["id"]
        if len(events) < limit:
            break
        offset += limit
    return all_events


def upsert_event(title, slug, length_minutes, price_cents, description, existing):
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

    if slug in existing:
        event_id = existing[slug]
        r = requests.patch(
            f"{BASE_URL}/event-types/{event_id}",
            headers=headers,
            json=payload,
        )
        action = "Updated"
    else:
        r = requests.post(f"{BASE_URL}/event-types", headers=headers, json=payload)
        action = "Created"

    data = r.json()
    if r.status_code in (200, 201):
        ev = data["data"]
        price_str = f"${ev['price'] / 100:.2f}" if ev["price"] > 0 else "Free"
        print(f"✓ [{action}] {ev['title']} — {price_str} — {ev['bookingUrl']}")
        return ev["id"]
    else:
        print(f"✗ Error for '{title}': {data}")
        return None


CONSULTATION_REQUIRED_SERVICES = [
    # Micropigmentation
    {
        "title": "Scalp Micropigmentation",
        "slug": "micropigmentation-consultation-scalp-micropigmentation",
        "length_minutes": 30,
        "price_cents": 0,
        "description": (
            "A consultation is required before booking this service. "
            "Please schedule a consultation appointment first.\n\n"
            "Scalp Micropigmentation is a non-surgical cosmetic procedure that uses micro-needles "
            "to deposit pigment into the scalp, replicating the natural appearance of hair follicles. "
            "It is an effective solution for hair loss, thinning hair, alopecia, and scalp scars, "
            "creating the illusion of a fuller, denser head of hair."
        ),
    },
    # Skin Imperfection
    {
        "title": "Campbell Spot",
        "slug": "skin-imperfection-consultation-campbell-spot",
        "length_minutes": 30,
        "price_cents": 0,
        "description": (
            "A consultation is required before booking this service. "
            "Please schedule a consultation appointment first.\n\n"
            "Campbell Spot removal targets benign vascular skin lesions — small, raised red or pink "
            "growths caused by localized overgrowth of blood vessels near the skin surface. "
            "Treatment uses electrolysis to safely and precisely eliminate these spots with minimal discomfort."
        ),
    },
    {
        "title": "Cherry Angioma",
        "slug": "skin-imperfection-consultation-cherry-angioma",
        "length_minutes": 30,
        "price_cents": 0,
        "description": (
            "A consultation is required before booking this service. "
            "Please schedule a consultation appointment first.\n\n"
            "Cherry Angioma removal is a quick and effective treatment for small, bright-red benign skin "
            "growths made up of blood vessels close to the skin's surface. These common lesions are harmless "
            "but can be removed for cosmetic reasons using electrolysis or targeted energy-based techniques."
        ),
    },
    {
        "title": "Large Cyst Removal",
        "slug": "skin-imperfection-consultation-large-cyst-removal",
        "length_minutes": 30,
        "price_cents": 0,
        "description": (
            "A consultation is required before booking this service. "
            "Please schedule a consultation appointment first.\n\n"
            "Large Cyst Removal is a clinical procedure to excise or drain a cyst — a closed sac of tissue "
            "that may contain fluid, air, or semi-solid material beneath the skin. Treatment is performed "
            "under local anesthesia to ensure safe, comfortable, and complete removal with minimal risk of recurrence."
        ),
    },
    {
        "title": "Skin Imperfection - Pigmentation Removal",
        "slug": "skin-imperfection-consultation-pigmentation-removal",
        "length_minutes": 30,
        "price_cents": 0,
        "description": (
            "A consultation is required before booking this service. "
            "Please schedule a consultation appointment first.\n\n"
            "Pigmentation Removal targets unwanted skin discolorations such as age spots, sunspots, melasma, "
            "and hyperpigmentation using advanced electrolysis or energy-based techniques. The treatment works "
            "to break down excess melanin deposits, restoring a more even and radiant skin tone."
        ),
    },
    # Wellness
    {
        "title": "StoneIWC Cooking On-Site",
        "slug": "wellness-consultation-stoneiwc-cooking-on-site",
        "length_minutes": 30,
        "price_cents": 0,
        "description": (
            "A consultation is required before booking this service. "
            "Please schedule a consultation appointment first."
        ),
    },
    # Concierge
    {
        "title": "Construction Wellness Challenge Package",
        "slug": "concierge-consultation-construction-wellness-challenge-package",
        "length_minutes": 30,
        "price_cents": 0,
        "description": (
            "A consultation is required before booking this service. "
            "Please schedule a consultation appointment first."
        ),
    },
]


if __name__ == "__main__":
    print("Fetching existing Cal.com event types...\n")
    existing = get_existing_events()
    print(f"Found {len(existing)} existing events.\n")

    print(f"Upserting {len(CONSULTATION_REQUIRED_SERVICES)} consultation-required services...\n")
    for service in CONSULTATION_REQUIRED_SERVICES:
        upsert_event(**service, existing=existing)
