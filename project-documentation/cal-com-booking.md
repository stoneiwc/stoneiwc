# Cal.com Booking — Technical Documentation

## Overview

The booking system uses the **Cal.com v2 REST API** directly — no SDK. Event types (services) live in Cal.com and are fetched at runtime with `cache: "no-store"`. The frontend filters and displays them; clicking a service embeds the Cal.com booking widget.

Service appointments are provisioned to Cal.com using a set of **Python scripts** in `scripts/`. These scripts are the source of truth for what event types exist — not the database, not Sanity.

---

## Frontend Architecture

### Pages

| Page | File | Description |
|------|------|-------------|
| `/book` | `app/book/page.tsx` | Browse all services with category sidebar and search |
| `/book/[slug]` | `app/book/[slug]/page.tsx` | Individual service detail + Cal.com booking embed |

### Key Files

| File | Purpose |
|------|---------|
| `lib/cal-api.ts` | API client, category definitions, filter functions |
| `components/cal-booker.tsx` | Wraps `@calcom/embed-react` for the booking widget |

---

## API Client (`lib/cal-api.ts`)

**Base URL:** `https://api.cal.com/v2`  
**API Version header:** `cal-api-version: 2024-06-14`  
**Cache policy:** `cache: "no-store"` — always fetches fresh event types (availability changes in real time)

```ts
// Fetch all event types for the configured Cal.com username
await getEventTypes(process.env.NEXT_PUBLIC_CAL_USERNAME)
```

The response is `data.data[]` — an array of event type objects. Returns `[]` on any error (no throws).

**`CalEventType` shape:**
```ts
{
  id: number
  title: string
  slug: string
  description: string | null
  lengthInMinutes: number
  price: number      // in cents (e.g. 10000 = $100.00)
  currency: string
}
```

---

## Booking Categories

Defined in `BOOKING_CATEGORIES` array in `lib/cal-api.ts`. Each category maps a `value` to a `slugPrefix`:

| Category Value | Label | Slug Prefix |
|---|---|---|
| `hair` | Hair | `hair-` |
| `face` | Face | `face-` |
| `lash-extension` | Lash Extension | `lash-extension-` |
| `micropigmentation` | Micropigmentation Semi-Permanent | `micropigmentation-` |
| `skin-imperfection` | Skin Imperfection | `skin-imperfection-` |
| `acupuncture` | Acupuncture | `acupuncture-` |
| `cupping` | Cupping | `cupping-` |
| `massage-body` | Massage & Body Treatments | `massage-body-` |
| `chiropractic` | Chiropractic | `chiropractic-` |
| `body-transformation` | Body Transformation | `body-transformation-` |
| `lipo-treatments` | Lipo Treatments | `lipo-treatments-` |
| `waxing` | Waxing | `waxing-` |
| `chronic-venous-insufficiency` | Chronic Venous Insufficiency | `chronic-venous-insufficiency-` |
| `nail` | Nail | `nail-` |
| `wellness` | Wellness | `wellness-` |
| `consultation` | Consultation | `consultation-` |
| `concierge` | Concierge | `concierge-` |

**Category detection:**
```ts
getCategoryFromSlug("hair-woman-haircut-short-style") // → "hair"
getCategoryFromSlug("face-tmj")                        // → "face"
```

Uses `slug.startsWith(cat.slugPrefix)` — first match wins.

---

## Slug Conventions

Slugs are the single most important convention in this system. They drive category detection, pricing display, and badge rendering.

### Standard services
```
{category-prefix}-{service-name}

Examples:
hair-woman-haircut-long-style
face-manual-microdermabrasion
nail-gel-manicure
acupuncture-full-body-session
```

### Free services
```
{category-prefix}-{service-name}-free

Examples:
consultation-initial-free
hair-consultation-free
```

Detection: `event.slug.endsWith("-free")` OR `event.price === 0`  
Display: shows **"Free"** badge instead of a price

### Consultation-required services
```
{category-prefix}-consultation-{service-name}

Examples:
skin-imperfection-consultation-cherry-angioma
micropigmentation-consultation-scalp-micropigmentation
wellness-consultation-stoneiwc-cooking-on-site
```

Detection: `event.slug.includes("-consultation-")`  
Display: shows amber **"Consultation Service"** badge and **"Price for Consultation"** label

> This pattern means the service requires a prior consultation before it can be booked. The event is created with `price: 0` and the description says "A consultation is required before booking this service."

### Pricing fallback
If none of the above match and `price > 0`: display `$XX.XX`  
If price is 0 but slug doesn't end in `-free`: display **"Contact for Pricing"**

---

## Cal.com Provisioning Scripts

### Overview

The Python scripts in `scripts/` create and update event types in Cal.com via the API. Each script corresponds to one service category. **Run these scripts when adding, updating, or restoring services in Cal.com** — do not create event types manually in the Cal.com dashboard unless you also update the script.

### Setup

```bash
cd scripts
pip install -r requirements.txt
# requirements.txt contains: requests, python-dotenv
```

Scripts read `CAL_API_KEY` from the project root's `.env.local` automatically via `config.py`.

### Shared Config (`config.py`)

```python
BASE_URL = "https://api.cal.com/v2"
LOCATION_ADDRESS = "1108 W Parker Rd Ste 102 Plano, TX 75075"
WORK_HOURS_SCHEDULE_ID = 1493459          # Standard in-clinic schedule
VIRTUAL_CONSULTATION_SCHEDULE_ID = 1493460 # Virtual/remote schedule
HEADERS = { "Authorization": f"Bearer {API_KEY}", "cal-api-version": "2024-06-14" }
```

> `WORK_HOURS_SCHEDULE_ID` and `VIRTUAL_CONSULTATION_SCHEDULE_ID` are Cal.com internal IDs. If the Cal.com account is ever recreated, these IDs will change and must be updated in `config.py`.

### Standard Event Payload

Every script sends the same base payload:

```python
{
  "title": "...",
  "slug": "...",
  "lengthInMinutes": 60,
  "description": "...",
  "locations": [{ "type": "address", "address": LOCATION_ADDRESS, "public": True }],
  "price": 10000,               # in cents
  "currency": "usd",
  "scheduleId": WORK_HOURS_SCHEDULE_ID,
  "minimumBookingNotice": 2880, # 48 hours in minutes
  "beforeEventBuffer": 15,      # 15 min prep before
  "afterEventBuffer": 15,       # 15 min cleanup after
}
```

### Running a Script

```bash
cd scripts
python create_hair_events.py
# Output:
# Creating 6 hair services...
# ✓ Woman Haircut Short & Style — $95.00 — https://cal.com/stoneiwc/hair-woman-haircut-short-style
# ✓ Men Haircut Short & Style — $65.00 — ...
```

### Script Reference

| Script | Category | Event Count | Notes |
|--------|----------|-------------|-------|
| `create_hair_events.py` | Hair | 6 | Standard create |
| `create_face_events.py` | Face | 7 | Includes CPT codes in descriptions |
| `create_lash_extension_events.py` | Lash Extension | 2 | Standard create |
| `create_micropigmentation_events.py` | Micropigmentation | 9 | Standard create |
| `create_skin_imperfection_events.py` | Skin Imperfection | 1 | Standard create |
| `create_acupuncture_events.py` | Acupuncture | 4 | Standard create |
| `create_cupping_events.py` | Cupping | 6 | Standard create |
| `create_massage_body_events.py` | Massage & Body | 2 | Standard create |
| `create_chiropractic_events.py` | Chiropractic | 1 | Standard create |
| `create_body_transformation_events.py` | Body Transformation | 6 | Standard create |
| `create_lipo_treatments_events.py` | Lipo Treatments | 10 | Standard create |
| `create_waxing_events.py` | Waxing | 7 | Standard create |
| `create_cvi_events.py` | Chronic Venous Insufficiency | 1 | Standard create |
| `create_nail_events.py` | Nail | 10 | Standard create |
| `create_general_events.py` | Wellness / Consultation | 4 | Standard create |
| `create_consultation_required_events.py` | Mixed | 7 | **Upsert logic** (see below) |
| `update_hair_notice.py` | Hair | — | Update only, no new events |

### Upsert vs Create

Most scripts use **create-only** logic via `POST /v2/event-types`. Running them twice will create duplicate events.

`create_consultation_required_events.py` uses **upsert logic**:
1. Fetches all existing event types (`GET /v2/event-types`, paginated)
2. Builds a `slug → id` map
3. For each service: if slug exists → `PATCH /v2/event-types/{id}`, otherwise `POST /v2/event-types`

This script is safe to re-run at any time without creating duplicates. Use it as a reference pattern if you need to write a new updatable script.

### Adding a New Service

1. Choose the correct category prefix from the `BOOKING_CATEGORIES` table above
2. Pick a slug: `{prefix}-{kebab-case-name}` (add `-free` if free, `-consultation-` if consultation-required)
3. Add the service dict to the appropriate script's list (or create a new script)
4. Run the script: `python create_{category}_events.py`
5. Verify the event appears at `https://cal.com/{username}/{slug}`

> **Prices are in cents.** `$95.00 → 9500`, `$150.00 → 15000`, free → `0`.

### Adding a New Category

If a new service category is added to Cal.com:

1. Define a new entry in `BOOKING_CATEGORIES` in `lib/cal-api.ts` with a unique `value` and `slugPrefix`
2. Create a provisioning script in `scripts/` following the pattern of existing scripts
3. All events for that category must have slugs starting with the defined `slugPrefix`

---

## Booking Widget

**File:** `components/cal-booker.tsx`

Uses `@calcom/embed-react`. The widget is embedded on `/book/[slug]` pages and renders the full Cal.com booking flow inline.

```tsx
<Cal calLink={`${username}/${slug}`} config={{ layout: "month_view" }} />
```

The `slug` comes from the dynamic route param, which maps directly to the Cal.com event type slug.
