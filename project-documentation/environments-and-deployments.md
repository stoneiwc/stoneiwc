# Environments & Deployments

How the project moves from a local laptop to `dev.stoneiwc.com` and finally to `stoneiwc.com`, and how every secret is scoped along the way.

---

## Branches → environments

There are three environments. They differ in **Vercel scope**, **Stripe mode**, and **public URL**. The repo is connected to GitHub; pushes auto-deploy.

| Vercel scope | Git source | URL | Stripe | Purpose |
|---|---|---|---|---|
| **Production** | `main` branch | `https://stoneiwc.com` | Live (`sk_live_…`) | Real customers, real money |
| **Preview** | `development` branch (aliased) + any PR branch | `https://dev.stoneiwc.com` (alias) or auto-generated `*.vercel.app` | Test (`sk_test_…`) | Staging + per-PR previews |
| **Development** | None (Vercel scope used by `vercel dev` locally) | `localhost:3000` | Test | Used rarely; `vercel dev` reads this scope when needed |

> `dev.stoneiwc.com` is a **custom domain alias** for the latest Preview deployment off the `development` branch. It always points to the most recent push on that branch. PR branches get their own `*.vercel.app` preview but don't take over `dev.stoneiwc.com`.

---

## The env var matrix

Every variable below has a **scope**. Same key, different value per scope is supported and expected for the Stripe + URL variables. To split a single existing variable into per-scope values, see "Splitting an existing variable" below.

### Sanity — same across scopes

| Variable | Production | Preview | Development | Notes |
|---|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | same | same | same | Public, fine to share |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | `production` | `production` | We use one dataset for all environments |
| `NEXT_PUBLIC_SANITY_API_VERSION` | same | same | same | A date string |
| `SANITY_API_TOKEN` | Editor token | Editor token | Editor token | Same token; **Editor** permission required for order + gift card writes |

> Why one dataset across all scopes: test orders in Sanity are easy to filter out (status, prefix, etc.) and there's no need to maintain a separate Studio. If this becomes painful, create a `development` Sanity dataset and split here.

### Stripe — MUST differ between Production and Preview

| Variable | Production | Preview | Development |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` | `sk_test_…` | `sk_test_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` | `pk_test_…` | `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | Live webhook's `whsec_…` | Test webhook's `whsec_…` | Local `stripe listen` `whsec_…` |

> Critical: if Production accidentally has `sk_test_…`, real customer cards won't be charged and the live Stripe Dashboard won't show anything. Always verify with `vercel env pull --environment=production` before announcing a release.

### Resend — same across scopes (currently)

| Variable | Production | Preview | Development | Notes |
|---|---|---|---|---|
| `RESEND_API_KEY` | same | same | same | One key, sender domain is verified |
| `RESEND_FROM_EMAIL` | `info@stoneiwc.com` (or `Stone IWC <info@stoneiwc.com>`) | same | same | Including a display name improves inbox placement |
| `CONTACT_EMAIL_TO` | `info@stoneiwc.com` | same | same | Where contact form submissions land + the reply-to of transactional emails |

### Cal.com — same across scopes

| Variable | All scopes |
|---|---|
| `NEXT_PUBLIC_CAL_USERNAME` | `stoneiwc` |
| `CAL_API_KEY` | The team API key |

### App — must differ

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_FRONTEND_URL` | `https://stoneiwc.com` | `https://dev.stoneiwc.com` | `http://localhost:3000` |

This is used in some email templates and metadata. Wrong value → emails link to the wrong host.

### Optional

| Variable | Notes |
|---|---|
| `SANITY_WEBHOOK_SECRET` | If `/api/revalidate` is wired to Sanity webhooks; otherwise unused |

---

## Splitting an existing variable across scopes

If a variable is currently set to "All Environments" but you need a different value per scope (typical for `STRIPE_*`), here's the safe sequence in the Vercel dashboard (Project → Settings → Environment Variables):

1. **Edit the existing entry.** Uncheck **Production** so it covers only Preview + Development. Save.
2. **Add a new entry** with the same key (`STRIPE_SECRET_KEY` etc.), the production-only value, and only **Production** checked. Save.
3. Verify with `vercel env ls` — you should see the same key listed twice with different scope columns.
4. **Redeploy** both Production and the latest Preview so the new values get picked up. Updated env vars do **not** auto-apply to existing deployments.

Symptoms of forgetting step 4: the deployment was built with the old env vars, so even though the dashboard shows the new value, your traffic still uses the old one. Always trigger a fresh deploy.

---

## Stripe webhooks (one per mode)

Two webhook endpoints exist in Stripe — one in Test mode, one in Live mode. Each has its own signing secret (`whsec_…`).

| Mode | URL | Events | Used by |
|---|---|---|---|
| Test | `https://dev.stoneiwc.com/api/webhooks/stripe?x-vercel-protection-bypass=…&x-vercel-set-bypass-cookie=true` | `payment_intent.succeeded`, `payment_intent.payment_failed` | Preview deployments |
| Live | `https://stoneiwc.com/api/webhooks/stripe` | Same | Production |

> The `?x-vercel-protection-bypass=…` query string is only needed in Preview because **Vercel Deployment Protection** is enabled there by default — Stripe would otherwise hit a Vercel SSO/password challenge and get a 401. Production is public, so no bypass param is needed (or wanted — leaving it in production is a needless secret leak).

How to get the bypass token: Vercel → Project → Settings → Deployment Protection → "Protection Bypass for Automation" → generate. Append `&x-vercel-set-bypass-cookie=true` so subsequent requests in the same session also bypass.

If Production deployments are getting 401 from Stripe, double-check that Deployment Protection is **disabled** for the Production scope (it should be by default).

---

## Production merge checklist

Before merging `development` → `main`, walk through this list. Skipping any item has bitten us before.

### Pre-merge

- [ ] All test scenarios in [runbook.md](runbook.md#test-scenarios) pass on `dev.stoneiwc.com`
- [ ] Vercel env vars — confirm split per the matrix above. Particularly:
  - [ ] `STRIPE_SECRET_KEY` Production = `sk_live_…`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` Production = `pk_live_…`
  - [ ] `STRIPE_WEBHOOK_SECRET` Production = Live webhook's secret
  - [ ] `NEXT_PUBLIC_FRONTEND_URL` Production = `https://stoneiwc.com`
- [ ] Stripe Dashboard → Live mode → Webhooks → `https://stoneiwc.com/api/webhooks/stripe` listening to both events
- [ ] Sanity Studio deployed (`cd studio && npx sanity deploy`) so admins see latest schemas
- [ ] Resend domain `stoneiwc.com` Verified — SPF / DKIM / Return-Path / DMARC all green

### Merge

```bash
git checkout main
git pull
git merge development --no-ff
git push origin main
```

Vercel auto-deploys. Watch the Production deploy in the Vercel dashboard. Wait for "Ready".

### Post-merge smoke test (~5 minutes)

On `stoneiwc.com`:

- [ ] Real card, **smallest possible amount** (a $1 product or refund-after). Complete checkout.
- [ ] Sanity → Orders shows the new doc with status `paid`
- [ ] Stripe Dashboard → **Live mode** → Payments shows the charge
- [ ] Customer email inbox got the order confirmation
- [ ] Issue a **refund** in Stripe Dashboard for the test order, then set status → `refunded` in Sanity

If anything fails: don't panic. Check [runbook.md](runbook.md) for triage. The Sanity order is recoverable from Stripe metadata; the only unrecoverable failure is a live key issue, which the pre-merge checklist should have caught.

---

## Rolling back

If a production deploy is bad, Vercel has instant rollback:

1. Vercel → Project → Deployments → find the last good production deploy
2. … menu → "Promote to Production"

This swaps the alias `stoneiwc.com` to the older build in seconds. No git revert needed for an emergency rollback (do that afterwards, on your own time).

Caveats:
- Rollback doesn't undo Sanity writes. If the bad deploy created broken order documents, you'll have to clean them up in Studio.
- Rollback doesn't change env vars. If the bad deploy was due to a wrong env var, fix the env var THEN redeploy. A rollback to an older deploy with the same wrong env var won't help.

---

## CI / GitHub Actions

The repo currently has no GitHub Actions. Vercel handles build + deploy on push. There are no required status checks before merge — relying on PR review and the `development` smoke test.

If a CI pipeline is desired later: a typical addition is `pnpm lint` + `npx tsc --noEmit` on every push. The build itself runs on Vercel and surfaces failures in the PR's "Checks" tab.

---

## Local dev with `vercel dev`

You normally use `pnpm dev` for local development. `vercel dev` is only needed if you want the Vercel routing layer (rewrites, headers from `vercel.json`) — there's currently nothing in `vercel.json` that diverges from Next.js's own behavior, so `pnpm dev` is fine.

If you do use `vercel dev`:

```bash
vercel link    # one-time, links this repo to the Vercel project
vercel env pull .env.development   # pulls Development scope env vars
vercel dev     # runs on port 3000 by default
```

---

## Where each piece lives

| What | Where |
|---|---|
| Env vars | Vercel → Project → Settings → Environment Variables |
| Build logs | Vercel → Project → Deployments → click a deployment → "Building" tab |
| Runtime function logs | Vercel → Project → Logs (or click into a specific deployment) |
| Stripe events | Stripe Dashboard → Developers → Events / Webhooks |
| Sanity data | `https://your-studio-host.sanity.studio` (hosted Studio) or `localhost:3333` locally |
| Resend send logs | Resend Dashboard → Logs |
| Cal.com bookings | Cal.com → Bookings |

---

## See also

- [runbook.md](runbook.md) — when a deploy is broken, look here first
- [webhooks.md](webhooks.md) — webhook URL / secret details
- [security-and-compliance.md](security-and-compliance.md) — env var hygiene, secret rotation
