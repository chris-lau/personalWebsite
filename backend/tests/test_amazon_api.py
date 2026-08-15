import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_amazon_search_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/search?q=desk+mat&category=office_products")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "desk mat"
        assert data["category"] == "office_products"
        assert len(data["products"]) > 0
        p = data["products"][0]
        assert "asin" in p
        assert "price" in p
        assert p["price"] > 0


@pytest.mark.asyncio
async def test_amazon_asin_inspection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/asin/B08N5WRWNW")
        assert response.status_code == 200
        data = response.json()
        assert data["asin"] == "B08N5WRWNW"
        assert "price" in data
        assert "fba_tier" in data
        assert data["price"] > 0


@pytest.mark.asyncio
async def test_amazon_asin_invalid():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/asin/INVALID")
        assert response.status_code == 400


@pytest.mark.asyncio
async def test_amazon_trends_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/trends?q=coffee+tamper")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "coffee tamper"
        assert "trend_points" in data
        assert len(data["trend_points"]) > 0
        assert data["growth_velocity_pct"] > 0
