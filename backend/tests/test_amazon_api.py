"""Tests for the Amazon Live Search, ASIN inspection, and Trends endpoints.

Uses httpx MockTransport with HTML fixtures for hermetic, deterministic offline execution.
"""

from __future__ import annotations

import httpx
import pytest
from httpx import ASGITransport, AsyncClient

from api.endpoints.amazon import clear_amazon_cache
from main import app

SAMPLE_SEARCH_HTML = """
<!DOCTYPE html>
<html>
<body>
  <div data-asin="B08N5WRWNW" class="s-result-item">
    <h2><a href="/dp/B08N5WRWNW"><span>Orthopedic Elevated Ceramic Slow Feeder</span></a></h2>
    <span class="a-price"><span class="a-offscreen">$38.50</span></span>
    <span class="a-icon-alt">4.7 out of 5 stars</span>
    <span aria-label="1,240 ratings">1,240</span>
    <img class="s-image" src="https://m.media-amazon.com/images/I/sample.jpg" />
    <span class="a-icon-prime">Prime</span>
  </div>
  <div data-asin="B09XYZ8888" class="s-result-item">
    <h2><a href="/dp/B09XYZ8888"><span>Stainless Steel Whisking Pitcher</span></a></h2>
    <span class="a-price"><span class="a-offscreen">$18.99</span></span>
    <span class="a-icon-alt">4.5 out of 5 stars</span>
    <span aria-label="430 ratings">430</span>
    <img class="s-image" src="https://m.media-amazon.com/images/I/sample2.jpg" />
  </div>
</body>
</html>
"""

SAMPLE_CAPTCHA_HTML = """
<!DOCTYPE html>
<html>
<body>
  <h4>Type the characters you see in this image:</h4>
  <p>For questions please contact api-services-support@amazon.com</p>
</body>
</html>
"""

SAMPLE_ASIN_HTML = """
<!DOCTYPE html>
<html>
<body>
  <span id="productTitle">Ergonomic Felt & Cork Desk Pad Mat</span>
  <span class="a-price-whole">29</span>
  <span class="a-price-fraction">95</span>
  <span class="a-icon-alt">4.8 out of 5 stars</span>
  <span id="acrCustomerReviewText">890 ratings</span>
  <ul>
    <li><span class="a-list-item">Crafted from natural merino wool felt and high-density organic cork</span></li>
    <li><span class="a-list-item">Ultra-smooth glide surface engineered for precision optical mice</span></li>
  </ul>
</body>
</html>
"""


def _patch_httpx_amazon(monkeypatch, search_html=SAMPLE_SEARCH_HTML, asin_html=SAMPLE_ASIN_HTML, suggestions_json=None):
    """Patch httpx.AsyncClient with MockTransport."""
    if suggestions_json is None:
        suggestions_json = {"suggestions": [{"value": "desk mat large"}, {"value": "desk mat felt"}]}

    def mock_handler(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        if "completion.amazon.com" in url:
            return httpx.Response(200, json=suggestions_json)
        if "amazon.com/s?" in url:
            return httpx.Response(200, text=search_html)
        if "amazon.com/dp/" in url:
            return httpx.Response(200, text=asin_html)
        return httpx.Response(404, text="Not Found")

    original_init = httpx.AsyncClient.__init__

    def patched_init(self, *args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(mock_handler)
        original_init(self, *args, **kwargs)

    monkeypatch.setattr(httpx.AsyncClient, "__init__", patched_init)


@pytest.mark.asyncio
async def test_amazon_search_live_success(monkeypatch):
    """Test successful live HTML parsing returns is_live=True and source='live_marketplace'."""
    clear_amazon_cache()
    _patch_httpx_amazon(monkeypatch, search_html=SAMPLE_SEARCH_HTML)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/search?q=desk+mat&category=office_products")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "desk mat"
        assert data["is_live"] is True
        assert data["source"] == "live_marketplace"
        assert len(data["products"]) == 2
        p1 = data["products"][0]
        assert p1["asin"] == "B08N5WRWNW"
        assert p1["title"] == "Orthopedic Elevated Ceramic Slow Feeder"
        assert p1["price"] == 38.50
        assert p1["rating"] == 4.7
        assert p1["reviews_count"] == 1240
        assert p1["is_prime"] is True


@pytest.mark.asyncio
async def test_amazon_search_captcha_fallback(monkeypatch):
    """Test captcha/bot challenge returns is_live=False, source='simulated_benchmark'."""
    clear_amazon_cache()
    _patch_httpx_amazon(monkeypatch, search_html=SAMPLE_CAPTCHA_HTML)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/search?q=cold+brew")
        assert response.status_code == 200
        data = response.json()
        assert data["is_live"] is False
        assert data["source"] == "simulated_benchmark"
        assert "challenge" in data["note"].lower()
        assert len(data["products"]) > 0


@pytest.mark.asyncio
async def test_amazon_asin_inspection_live(monkeypatch):
    """Test live ASIN inspection parses title, price, and bullets."""
    clear_amazon_cache()
    _patch_httpx_amazon(monkeypatch, asin_html=SAMPLE_ASIN_HTML)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/asin/B08N5WRWNW")
        assert response.status_code == 200
        data = response.json()
        assert data["asin"] == "B08N5WRWNW"
        assert data["title"] == "Ergonomic Felt & Cork Desk Pad Mat"
        assert data["price"] == 29.95
        assert data["rating"] == 4.8
        assert data["reviews_count"] == 890
        assert data["is_live"] is True
        assert data["source"] == "live_marketplace"
        assert data["category"] == "office_products"
        assert len(data["bullets"]) == 2


@pytest.mark.asyncio
async def test_amazon_asin_url_query_param(monkeypatch):
    """Test passing full Amazon URL via query parameter works without 404."""
    clear_amazon_cache()
    _patch_httpx_amazon(monkeypatch, asin_html=SAMPLE_ASIN_HTML)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/asin", params={"url": "https://www.amazon.com/dp/B08N5WRWNW?ref=xyz"})
        assert response.status_code == 200
        data = response.json()
        assert data["asin"] == "B08N5WRWNW"
        assert data["is_live"] is True


@pytest.mark.asyncio
async def test_amazon_asin_invalid():
    """Test invalid ASIN returns 400."""
    clear_amazon_cache()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/asin/INVALID_123")
        assert response.status_code == 400


@pytest.mark.asyncio
async def test_amazon_trends_endpoint(monkeypatch):
    """Test live trends returns autocomplete and growth velocity."""
    clear_amazon_cache()
    _patch_httpx_amazon(monkeypatch, suggestions_json={"suggestions": [{"value": "espresso tamper 54mm"}]})

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/amazon/trends?q=espresso+tamper")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "espresso tamper"
        assert "espresso tamper 54mm" in data["suggestions"]
        assert data["is_live"] is True
        assert data["source"] == "live_autocomplete"
        assert len(data["trend_points"]) == 12
