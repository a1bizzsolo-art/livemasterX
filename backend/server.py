from fastapi import FastAPI, APIRouter, HTTPException, Query, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import time
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)
import gmail_notifier


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="A1A1 (AQAS) API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    organization: Optional[str] = None
    use_case: Optional[str] = None
    acreage: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WaitlistCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    organization: Optional[str] = Field(default=None, max_length=200)
    use_case: Optional[str] = Field(default=None, max_length=80)
    acreage: Optional[str] = Field(default=None, max_length=80)


class WaitlistStats(BaseModel):
    total: int
    agents_online: int
    fields_under_watch: int
    uptime: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "A1A1 (AQAS) command channel online."}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check.get('timestamp'), str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/waitlist", response_model=WaitlistEntry, status_code=201)
async def join_waitlist(payload: WaitlistCreate):
    existing = await db.waitlist.find_one({"email": payload.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="This signal is already registered on the grid.")

    data = payload.model_dump()
    data['email'] = data['email'].lower()
    entry = WaitlistEntry(**data)
    doc = entry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.waitlist.insert_one(doc)

    # Notify owner Gmail (no-op if creds not configured yet).
    try:
        gmail_notifier.send_notification(
            subject=f"[A1A1 AQAS] New waitlist signup — {entry.name}",
            body=(
                f"New operator on the waitlist\n"
                f"-----------------------------\n"
                f"Name:         {entry.name}\n"
                f"Email:        {entry.email}\n"
                f"Organization: {entry.organization or '—'}\n"
                f"Use case:     {entry.use_case or '—'}\n"
                f"Acreage:      {entry.acreage or '—'}\n"
                f"Joined at:    {doc['created_at']}\n"
            ),
        )
    except Exception as e:
        logger.warning("Waitlist notification failed: %s", e)

    return entry


@api_router.get("/waitlist/stats", response_model=WaitlistStats)
async def waitlist_stats():
    total = await db.waitlist.count_documents({})
    # Mocked telemetry counters that feel live (deterministic-ish).
    base_agents = 10000
    return WaitlistStats(
        total=total,
        agents_online=base_agents + (total * 3),
        fields_under_watch=1284 + total,
        uptime="99.997%",
    )


# ---------- Live Field Intelligence (satellite-derived) ----------
PRESET_FIELDS: Dict[str, Dict[str, Any]] = {
    "central-valley": {
        "label": "Central Valley // CA",
        "crop": "Almonds",
        "lat": 36.7783,
        "lon": -119.4179,
    },
    "iowa-corn-belt": {
        "label": "Corn Belt // IA",
        "crop": "Corn",
        "lat": 41.8780,
        "lon": -93.0977,
    },
    "punjab-wheat": {
        "label": "Punjab Plain // IN",
        "crop": "Wheat",
        "lat": 30.9010,
        "lon": 75.8573,
    },
    "pampas": {
        "label": "Pampas // AR",
        "crop": "Soy",
        "lat": -34.6118,
        "lon": -60.0000,
    },
}

# In-memory cache to avoid hammering Open-Meteo (60s TTL).
_FIELD_CACHE: Dict[str, Dict[str, Any]] = {}
_CACHE_TTL_SECONDS = 60


def _classify_moisture(m: Optional[float]) -> str:
    if m is None:
        return "unknown"
    if m < 0.10:
        return "critical"
    if m < 0.18:
        return "low"
    if m < 0.30:
        return "optimal"
    return "saturated"


def _ndvi_proxy(soil_m: Optional[float], et: Optional[float], precip_24h: float) -> float:
    """Cheap, transparent NDVI-style proxy for the live readout.
    Real NDVI is from satellite reflectance — this is a vegetation-health
    estimate from soil moisture + ET + recent precip until satellite imagery
    provider keys are wired in."""
    sm = max(0.0, min(0.4, soil_m or 0.18))
    et_val = max(-2.0, min(8.0, (et or 0.0))) / 8.0
    p = max(0.0, min(20.0, precip_24h)) / 20.0
    # Weighted blend, clamped to a plausible NDVI band.
    raw = 0.45 + (sm / 0.4) * 0.30 + et_val * 0.15 + p * 0.10
    return round(max(0.10, min(0.92, raw)), 3)


@api_router.get("/field/live")
async def field_live(field: str = Query("central-valley")):
    f = PRESET_FIELDS.get(field)
    if not f:
        raise HTTPException(status_code=404, detail="Unknown field id.")

    now = time.time()
    cached = _FIELD_CACHE.get(field)
    if cached and now - cached["t"] < _CACHE_TTL_SECONDS:
        return cached["data"]

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": f["lat"],
        "longitude": f["lon"],
        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "wind_speed_10m",
            "soil_moisture_0_to_1cm",
            "soil_moisture_1_to_3cm",
            "evapotranspiration",
        ]),
        "hourly": ",".join([
            "precipitation",
            "evapotranspiration",
            "soil_moisture_1_to_3cm",
        ]),
        "forecast_days": 2,
        "past_days": 1,
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            payload = r.json()
    except Exception as e:
        logger.warning("Open-Meteo fetch failed: %s", e)
        # Graceful fallback so the UI never breaks.
        payload = {
            "current": {
                "time": datetime.now(timezone.utc).isoformat(),
                "temperature_2m": 22.0,
                "relative_humidity_2m": 62,
                "precipitation": 0.0,
                "wind_speed_10m": 8.0,
                "soil_moisture_0_to_1cm": 0.18,
                "soil_moisture_1_to_3cm": 0.21,
                "evapotranspiration": 4.2,
            },
            "hourly": {"time": [], "precipitation": [], "evapotranspiration": [], "soil_moisture_1_to_3cm": []},
            "_fallback": True,
        }

    cur = payload.get("current", {})
    hourly = payload.get("hourly", {})

    precip_24h = round(sum((hourly.get("precipitation") or [])[:24]), 2)
    et_24h = round(sum((hourly.get("evapotranspiration") or [])[:24]), 2)
    soil_series = (hourly.get("soil_moisture_1_to_3cm") or [])[:24]
    # Trim None values for the sparkline.
    soil_series_clean = [round(v, 3) if isinstance(v, (int, float)) else None for v in soil_series]

    soil_m = cur.get("soil_moisture_0_to_1cm")
    et_now = cur.get("evapotranspiration")
    ndvi = _ndvi_proxy(soil_m, et_now, precip_24h)
    moisture_status = _classify_moisture(soil_m)

    # AQAS advisory rules (transparent, not LLM — fast + free + deterministic).
    advisory = []
    if moisture_status in ("critical", "low") and precip_24h < 2.0:
        advisory.append({
            "level": "action",
            "text": f"Irrigate — soil moisture {moisture_status}, no precip in 24h.",
        })
    if (et_now or 0) > 5.0:
        advisory.append({
            "level": "watch",
            "text": "ET elevated — schedule irrigation in cooler window (02:00–04:00 LT).",
        })
    if precip_24h > 8.0:
        advisory.append({
            "level": "info",
            "text": f"Skip irrigation — {precip_24h} mm precip in last 24h.",
        })
    if not advisory:
        advisory.append({"level": "ok", "text": "All zones nominal. Continue autonomous monitoring."})

    data = {
        "field_id": field,
        "label": f["label"],
        "crop": f["crop"],
        "lat": f["lat"],
        "lon": f["lon"],
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": "Open-Meteo (satellite-derived soil moisture + reanalysis weather)",
        "fallback": payload.get("_fallback", False),
        "current": {
            "temperature_c": cur.get("temperature_2m"),
            "humidity_pct": cur.get("relative_humidity_2m"),
            "wind_kmh": cur.get("wind_speed_10m"),
            "precip_mm": cur.get("precipitation"),
            "soil_moisture_surface": cur.get("soil_moisture_0_to_1cm"),
            "soil_moisture_root": cur.get("soil_moisture_1_to_3cm"),
            "evapotranspiration_mm": cur.get("evapotranspiration"),
            "moisture_status": moisture_status,
        },
        "derived": {
            "ndvi_estimate": ndvi,
            "precip_24h_mm": precip_24h,
            "et_24h_mm": et_24h,
            "soil_moisture_series_24h": soil_series_clean,
        },
        "advisory": advisory,
    }

    _FIELD_CACHE[field] = {"t": now, "data": data}
    return data


@api_router.get("/field/list")
async def field_list():
    return {
        "fields": [
            {"id": k, "label": v["label"], "crop": v["crop"], "lat": v["lat"], "lon": v["lon"]}
            for k, v in PRESET_FIELDS.items()
        ]
    }


# ---------- Stripe Checkout + Closed Deals ----------
# Per-acre annual subscription model. We position ~30% below the industry
# average for precision-ag satellite + advisory services and reward longer
# commitments with progressive discounts.
MARKET_RATE_USD_PER_ACRE = 6.00  # industry average $/acre/year (precision ag + advisory)
BASE_RATE_USD_PER_ACRE = 4.20    # our 1-year list price — already ~30% under market

CONTRACT_TERMS: Dict[int, Dict[str, Any]] = {
    1:  {"name": "Operator",   "discount_pct": 0.00,  "rate": 4.20, "tagline": "Single season. No lock-in."},
    3:  {"name": "Sustained",  "discount_pct": 0.10,  "rate": 3.78, "tagline": "3-year ops cadence."},
    5:  {"name": "Strategic",  "discount_pct": 0.18,  "rate": 3.44, "tagline": "5-year, locked rate."},
    10: {"name": "Quantum",    "discount_pct": 0.28,  "rate": 3.02, "tagline": "Decade-long deployment."},
}

MIN_ACRES = 50
MAX_ACRES = 10_000_000


def _quote(acres: int, years: int) -> Dict[str, Any]:
    if years not in CONTRACT_TERMS:
        raise HTTPException(status_code=400, detail="Term must be 1, 3, 5, or 10 years.")
    if acres < MIN_ACRES or acres > MAX_ACRES:
        raise HTTPException(status_code=400, detail=f"Acreage must be between {MIN_ACRES} and {MAX_ACRES:,}.")

    term = CONTRACT_TERMS[years]
    annual_per_acre = term["rate"]
    annual_total = round(acres * annual_per_acre, 2)
    contract_total = round(annual_total * years, 2)
    market_total = round(acres * MARKET_RATE_USD_PER_ACRE * years, 2)
    savings = round(market_total - contract_total, 2)
    return {
        "acres": acres,
        "years": years,
        "term_name": term["name"],
        "tagline": term["tagline"],
        "annual_per_acre": annual_per_acre,
        "annual_total": annual_total,
        "contract_total": contract_total,
        "market_total": market_total,
        "savings": savings,
        "discount_pct": term["discount_pct"],
        "currency": "usd",
    }

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")


def _stripe_client(request: Request) -> StripeCheckout:
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe key not configured.")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)


class CheckoutCreate(BaseModel):
    acres: int = Field(ge=MIN_ACRES, le=MAX_ACRES)
    years: int = Field(description="Contract length: 1, 3, 5, or 10")
    origin_url: str
    customer_email: Optional[EmailStr] = None
    customer_name: Optional[str] = Field(default=None, max_length=120)


class QuoteRequest(BaseModel):
    acres: int = Field(ge=MIN_ACRES, le=MAX_ACRES)
    years: int


@api_router.get("/pricing")
async def pricing():
    key = STRIPE_API_KEY or ""
    mode = "live" if "live" in key else "sandbox"
    return {
        "mode": mode,
        "model": "per_acre_annual",
        "currency": "usd",
        "market_rate_per_acre": MARKET_RATE_USD_PER_ACRE,
        "base_rate_per_acre": BASE_RATE_USD_PER_ACRE,
        "savings_pct_vs_market": round(
            (1 - (BASE_RATE_USD_PER_ACRE / MARKET_RATE_USD_PER_ACRE)) * 100, 1
        ),
        "min_acres": MIN_ACRES,
        "max_acres": MAX_ACRES,
        "terms": [
            {
                "years": yrs,
                "name": t["name"],
                "tagline": t["tagline"],
                "rate_per_acre": t["rate"],
                "discount_pct": int(t["discount_pct"] * 100),
            }
            for yrs, t in CONTRACT_TERMS.items()
        ],
    }


@api_router.post("/pricing/quote")
async def pricing_quote(payload: QuoteRequest):
    return _quote(payload.acres, payload.years)


@api_router.post("/checkout/session")
async def create_checkout(payload: CheckoutCreate, request: Request):
    quote = _quote(payload.acres, payload.years)

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/payment/cancel"

    metadata = {
        "acres": str(quote["acres"]),
        "years": str(quote["years"]),
        "term_name": quote["term_name"],
        "annual_per_acre": str(quote["annual_per_acre"]),
        "savings_vs_market": str(quote["savings"]),
        "source": "landing_per_acre",
    }
    if payload.customer_email:
        metadata["customer_email"] = str(payload.customer_email)
    if payload.customer_name:
        metadata["customer_name"] = payload.customer_name

    stripe = _stripe_client(request)
    req = CheckoutSessionRequest(
        amount=float(quote["contract_total"]),
        currency=quote["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe.create_checkout_session(req)

    txn = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "tier_id": f"{quote['years']}y",
        "tier_name": f"{quote['term_name']} • {quote['years']}y • {quote['acres']:,} ac",
        "acres": quote["acres"],
        "years": quote["years"],
        "annual_per_acre": quote["annual_per_acre"],
        "annual_total": quote["annual_total"],
        "savings_vs_market": quote["savings"],
        "amount": float(quote["contract_total"]),
        "currency": quote["currency"],
        "customer_email": str(payload.customer_email).lower() if payload.customer_email else None,
        "customer_name": payload.customer_name,
        "metadata": metadata,
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(txn)

    return {"url": session.url, "session_id": session.session_id, "quote": quote}


async def _finalize_payment(session_id: str, request: Request) -> Dict[str, Any]:
    """Idempotently mark a transaction as paid, create the closed deal, notify."""
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Unknown checkout session.")

    if txn.get("payment_status") == "paid":
        # Already finalized — return current state.
        return {
            "status": txn.get("status"),
            "payment_status": txn.get("payment_status"),
            "amount": txn.get("amount"),
            "currency": txn.get("currency"),
            "tier_name": txn.get("tier_name"),
            "already_processed": True,
        }

    stripe = _stripe_client(request)
    checkout_status: CheckoutStatusResponse = await stripe.get_checkout_status(session_id)

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "status": checkout_status.status,
                "payment_status": checkout_status.payment_status,
                "amount_total_cents": checkout_status.amount_total,
                "stripe_metadata": checkout_status.metadata or {},
                "updated_at": now_iso,
            }
        },
    )

    response = {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount": checkout_status.amount_total / 100.0 if checkout_status.amount_total else txn.get("amount"),
        "currency": checkout_status.currency or txn.get("currency"),
        "tier_name": txn.get("tier_name"),
        "already_processed": False,
    }

    # Only create the closed-deal record + notification once, on confirmed paid.
    if checkout_status.payment_status == "paid":
        existing = await db.closed_deals.find_one({"session_id": session_id}, {"_id": 0})
        if not existing:
            deal = {
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "tier_id": txn.get("tier_id"),
                "tier_name": txn.get("tier_name"),
                "amount": checkout_status.amount_total / 100.0 if checkout_status.amount_total else txn.get("amount"),
                "currency": (checkout_status.currency or txn.get("currency")).lower(),
                "customer_email": txn.get("customer_email"),
                "customer_name": txn.get("customer_name"),
                "metadata": checkout_status.metadata or txn.get("metadata", {}),
                "closed_at": now_iso,
            }
            await db.closed_deals.insert_one(deal)
            _notify_closed_deal(deal)

    return response


def _notify_closed_deal(deal: Dict[str, Any]) -> None:
    """Fire-and-forget Gmail notification for a closed deal."""
    amount = deal.get("amount") or 0
    currency = (deal.get("currency") or "usd").upper()
    tier = deal.get("tier_name", "—")
    customer = deal.get("customer_email") or deal.get("customer_name") or "anonymous"
    subject = f"[A1A1 AQAS] Deal closed — {tier} — {currency} ${amount:,.2f}"
    body = (
        f"New closed deal\n"
        f"---------------\n"
        f"Tier:      {tier}\n"
        f"Amount:    {currency} ${amount:,.2f}\n"
        f"Customer:  {customer}\n"
        f"Session:   {deal.get('session_id')}\n"
        f"Closed at: {deal.get('closed_at')}\n"
        f"\nMoney is routed to your Stripe account.\n"
    )
    html = f"""<!doctype html><html><body style="font-family:'JetBrains Mono',monospace;background:#0A0A0C;color:#fff;padding:24px;">
  <div style="border:1px solid #1f2937;padding:20px;max-width:560px;">
    <div style="font-size:10px;letter-spacing:0.24em;color:#FFB000;text-transform:uppercase;">// A1A1 (AQAS) // DEAL CLOSED</div>
    <h2 style="font-family:Chivo,sans-serif;text-transform:uppercase;letter-spacing:-0.02em;margin:12px 0 0;">${amount:,.2f} {currency}</h2>
    <div style="color:#94A3B8;font-size:12px;margin-top:6px;">{tier} — {customer}</div>
    <hr style="border:none;border-top:1px solid #1f2937;margin:18px 0;" />
    <div style="font-size:11px;color:#94A3B8;line-height:1.6;">
      Session: {deal.get('session_id')}<br/>
      Closed: {deal.get('closed_at')}
    </div>
  </div>
</body></html>"""
    gmail_notifier.send_notification(subject, body, html)


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    return await _finalize_payment(session_id, request)


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    try:
        stripe = _stripe_client(request)
        event = await stripe.handle_webhook(body, sig)
    except Exception as e:
        logger.warning("Stripe webhook handling failed: %s", e)
        raise HTTPException(status_code=400, detail="Invalid webhook payload.")

    if event and event.session_id and event.payment_status == "paid":
        try:
            await _finalize_payment(event.session_id, request)
        except Exception as e:
            logger.warning("Webhook _finalize_payment failed: %s", e)
    return {"received": True}


@api_router.get("/deals/stats")
async def deals_stats():
    pipeline = [
        {
            "$group": {
                "_id": None,
                "count": {"$sum": 1},
                "revenue": {"$sum": "$amount"},
            }
        }
    ]
    rows = await db.closed_deals.aggregate(pipeline).to_list(1)
    count = rows[0]["count"] if rows else 0
    revenue = float(rows[0]["revenue"]) if rows else 0.0
    last_deals = (
        await db.closed_deals.find({}, {"_id": 0, "session_id": 0, "metadata": 0})
        .sort("closed_at", -1)
        .limit(5)
        .to_list(5)
    )
    return {
        "count": count,
        "revenue": round(revenue, 2),
        "currency": "USD",
        "recent": last_deals,
        "gmail_notifications": "configured" if gmail_notifier.is_configured() else "pending_credentials",
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
