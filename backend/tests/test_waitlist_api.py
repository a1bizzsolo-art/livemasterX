"""
Backend API tests for A1A1 (AQAS) waitlist + root + stats endpoints.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fall back to frontend .env file content if not present in env vars
    from pathlib import Path
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


def _rand_email(prefix="test"):
    return f"TEST_{prefix}_{uuid.uuid4().hex[:10]}@example.com"


# ---- root ----
class TestRoot:
    def test_root_greeting(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert isinstance(data["message"], str)
        assert len(data["message"]) > 0


# ---- stats ----
class TestStats:
    def test_stats_shape(self, session):
        r = session.get(f"{API}/waitlist/stats")
        assert r.status_code == 200
        data = r.json()
        for k in ("total", "agents_online", "fields_under_watch", "uptime"):
            assert k in data
        assert isinstance(data["total"], int)
        assert isinstance(data["agents_online"], int)
        assert isinstance(data["fields_under_watch"], int)
        assert isinstance(data["uptime"], str)
        assert data["agents_online"] >= 10000
        assert data["fields_under_watch"] >= 1284

    def test_stats_increments_after_signup(self, session):
        before = session.get(f"{API}/waitlist/stats").json()
        email = _rand_email("incr")
        payload = {"name": "Test Pilot", "email": email, "organization": "TestOrg"}
        r = session.post(f"{API}/waitlist", json=payload)
        assert r.status_code == 201, r.text
        after = session.get(f"{API}/waitlist/stats").json()
        assert after["total"] == before["total"] + 1
        # agents_online derived as 10000 + total*3
        assert after["agents_online"] == before["agents_online"] + 3
        assert after["fields_under_watch"] == before["fields_under_watch"] + 1


# ---- waitlist POST ----
class TestWaitlistPost:
    def test_create_valid(self, session):
        email = _rand_email("valid")
        payload = {
            "name": "Major Tester",
            "email": email,
            "organization": "TestOrg LLC",
            "acreage": "500-1000",
            "use_case": "precision-ag",
        }
        r = session.post(f"{API}/waitlist", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["email"] == email.lower()
        assert data["name"] == "Major Tester"
        assert data["organization"] == "TestOrg LLC"

    def test_email_lowercased_on_create(self, session):
        email_upper = f"TEST_UPPER_{uuid.uuid4().hex[:8]}@Example.COM"
        r = session.post(
            f"{API}/waitlist",
            json={"name": "Caps Lock", "email": email_upper},
        )
        assert r.status_code == 201, r.text
        assert r.json()["email"] == email_upper.lower()

    def test_duplicate_email_returns_409(self, session):
        email = _rand_email("dup")
        r1 = session.post(
            f"{API}/waitlist",
            json={"name": "Dup One", "email": email},
        )
        assert r1.status_code == 201, r1.text
        r2 = session.post(
            f"{API}/waitlist",
            json={"name": "Dup Two", "email": email},
        )
        assert r2.status_code == 409
        body = r2.json()
        assert "detail" in body

    def test_duplicate_case_insensitive(self, session):
        email = _rand_email("caseDup")
        r1 = session.post(
            f"{API}/waitlist",
            json={"name": "First", "email": email.lower()},
        )
        assert r1.status_code == 201
        r2 = session.post(
            f"{API}/waitlist",
            json={"name": "Second", "email": email.upper()},
        )
        # Should be 409 because lowercased storage should match.
        assert r2.status_code == 409, r2.text

    def test_invalid_email_422(self, session):
        r = session.post(
            f"{API}/waitlist",
            json={"name": "No Email", "email": "not-an-email"},
        )
        assert r.status_code == 422

    def test_missing_name_422(self, session):
        r = session.post(
            f"{API}/waitlist",
            json={"email": _rand_email("noname")},
        )
        assert r.status_code == 422

    def test_empty_name_422(self, session):
        r = session.post(
            f"{API}/waitlist",
            json={"name": "", "email": _rand_email("emptyname")},
        )
        assert r.status_code == 422
