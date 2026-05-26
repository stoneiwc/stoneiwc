# Cal.com Event Scripts

These Python scripts provision and manage Stone IWC's booking event types on Cal.com via the Cal.com v2 API. Each script corresponds to a service category and creates or updates the relevant event types in the connected Cal.com account.

## Setup

1. Make sure your `.env.local` at the project root contains your Cal.com API key:

```env
CAL_API_KEY=your_cal_api_key
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Run any script from inside the `scripts/` directory:

```bash
cd scripts
python create_face_events.py
```

Each script will print a `✓` or `✗` for each event it processes.

The `create_consultation_required_events.py` script uses **upsert logic** — if an event with the same slug already exists it will update it, otherwise it creates a new one.

## Scripts

| Script | Category | Events |
|--------|----------|--------|
| `create_acupuncture_events.py` | Acupuncture | 4 |
| `create_body_transformation_events.py` | Body Transformation | 6 |
| `create_chiropractic_events.py` | Chiropractic | 1 |
| `create_consultation_required_events.py` | Mixed (consultation-required services) | 7 |
| `create_cupping_events.py` | Cupping | 6 |
| `create_cvi_events.py` | Chronic Venous Insufficiency | 1 |
| `create_face_events.py` | Face | 7 |
| `create_general_events.py` | Wellness / Consultation | 4 |
| `create_hair_events.py` | Hair | 6 |
| `create_lash_extension_events.py` | Lash Extension | 2 |
| `create_lipo_treatments_events.py` | Lipo Treatments | 10 |
| `create_massage_body_events.py` | Massage & Body | 2 |
| `create_micropigmentation_events.py` | Micropigmentation | 9 |
| `create_nail_events.py` | Nail | 10 |
| `create_skin_imperfection_events.py` | Skin Imperfection | 1 |
| `create_waxing_events.py` | Waxing | 7 |
| `update_hair_notice.py` | Hair (update only) | — |

## Slug Convention

Event slugs follow the pattern:

```
{category-prefix}-{service-name}
```

Consultation-required services use an extended pattern so the UI can identify and badge them:

```
{category-prefix}-consultation-{service-name}
```

For example: `skin-imperfection-consultation-cherry-angioma`

This allows the booking page to detect `slug.includes('-consultation-')` and render the **Consultation Service** badge and **Price for Consultation** label on those cards.

## Shared Config

`config.py` loads the API key from `.env.local` and exports shared constants used by all scripts:

- `BASE_URL` — Cal.com v2 API base URL
- `HEADERS` — Authorization headers
- `LOCATION_ADDRESS` — Stone IWC clinic address
- `WORK_HOURS_SCHEDULE_ID` — Default schedule ID
- `VIRTUAL_CONSULTATION_SCHEDULE_ID` — Virtual consultation schedule ID
