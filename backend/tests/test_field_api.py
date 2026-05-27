"""
Backend API tests for A1A1 (AQAS) Live Field Intelligence endpoints.
Covers GET /api/field/list and GET /api/field/live (preset, fallback, 404, cache).
"""
import os
import time
import pytest
import requests
from pathlib import Path

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- field/list ----
class TestFieldList:
    def test_list_returns_4_presets(self, session):
        r = session.get(f"{API}/field/list")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "fields" in data
        fields = data["fields"]
        assert isinstance(fields, list)
        assert len(fields) == 4
        ids = {f["id"] for f in fields}
        assert ids == {"central-valley", "iowa-corn-belt", "punjab-wheat", "pampas"}
        for f in fields:
            assert "label" in f and isinstance(f["label"], str)
            assert "crop" in f and isinstance(f["crop"], str)
            assert isinstance(f["lat"], (int, float))
            assert isinstance(f["lon"], (int, float))


# ---- field/live ----
class TestFieldLive:
    def test_live_central_valley_shape(self, session):
        r = session.get(f"{API}/field/live", params={"field": "central-valley"})
        assert r.status_code == 200, r.text
        data = r.json()
        # Top-level
        assert data["field_id"] == "central-valley"
        assert "label" in data and "crop" in data
        assert "fetched_at" in data
        assert "source" in data
        # current block
        cur = data.get("current", {})
        assert "temperature_c" in cur
        assert "soil_moisture_surface" in cur
        assert "moisture_status" in cur
        # derived block
        d = data.get("derived", {})
        assert "ndvi_estimate" in d
        assert isinstance(d["ndvi_estimate"], (int, float))
        assert 0.0 <= d["ndvi_estimate"] <= 1.0
        assert "soil_moisture_series_24h" in d
        series = d["soil_moisture_series_24h"]
        assert isinstance(series, list)
        assert len(series) <= 24
        # advisory
        adv = data.get("advisory", [])
        assert isinstance(adv, list) and len(adv) >= 1
        assert "level" in adv[0] and "text" in adv[0]

    def test_live_iowa_coords(self, session):
        r = session.get(f"{API}/field/live", params={"field": "iowa-corn-belt"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["field_id"] == "iowa-corn-belt"
        assert abs(data["lat"] - 41.878) < 0.01
        assert abs(data["lon"] - (-93.0977)) < 0.01
        assert "IA" in data["label"] or "Iowa" in data["label"] or "Corn Belt" in data["label"]

    def test_live_punjab_and_pampas(self, session):
        for fid in ("punjab-wheat", "pampas"):
            r = session.get(f"{API}/field/live", params={"field": fid})
            assert r.status_code == 200, r.text
            assert r.json()["field_id"] == fid

    def test_live_unknown_returns_404(self, session):
        r = session.get(f"{API}/field/live", params={"field": "no-such-field"})
        assert r.status_code == 404
        body = r.json()
        assert "detail" in body

    def test_live_cache_60s(self, session):
        r1 = session.get(f"{API}/field/live", params={"field": "pampas"})
        assert r1.status_code == 200
        t1 = r1.json()["fetched_at"]
        # immediate second call should hit the in-memory cache
        time.sleep(0.5)
        r2 = session.get(f"{API}/field/live", params={"field": "pampas"})
        assert r2.status_code == 200
        t2 = r2.json()["fetched_at"]
        assert t1 == t2, f"cache miss: {t1} vs {t2}"

    def test_live_default_field_is_central_valley(self, session):
        r = session.get(f"{API}/field/live")
        assert r.status_code == 200
        assert r.json()["field_id"] == "central-valley"
