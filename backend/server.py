from fastapi import FastAPI, APIRouter, HTTPException, Query
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
