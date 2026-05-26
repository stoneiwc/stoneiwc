import requests
from config import BASE_URL, HEADERS as headers

HAIR_SLUGS = [
    "hair-woman-haircut-short-style",
    "hair-woman-haircut-long-style",
    "hair-special-occasion-hair-styling",
    "hair-men-haircut-short-style",
    "hair-men-haircut-long-style",
    "hair-scalp-treatment-for-hair-loss",
]

# Fetch all event types
r = requests.get(f"{BASE_URL}/event-types", headers=headers)
events = r.json().get("data", {}).get("eventTypeGroups", [])

all_events = []
for group in events:
    all_events.extend(group.get("eventTypes", []))

for event in all_events:
    if event["slug"] in HAIR_SLUGS:
        patch = requests.patch(
            f"{BASE_URL}/event-types/{event['id']}",
            headers=headers,
            json={"minimumBookingNotice": 2880},
        )
        if patch.status_code in (200, 201):
            print(f"✓ Updated: {event['title']}")
        else:
            print(f"✗ Failed: {event['title']} — {patch.json()}")
