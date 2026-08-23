from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class AmazonProductItem(BaseModel):
    asin: str
    title: str
    price: float = Field(default=0.0, description="Current Amazon retail price in USD")
    rating: float = Field(default=0.0, description="Average customer star rating (0-5)")
    reviews_count: int = Field(default=0, description="Total number of customer ratings")
    image_url: str = Field(default="", description="Product primary thumbnail URL")
    product_url: str = Field(default="", description="Direct Amazon product URL")
    is_prime: bool = Field(default=True, description="Whether product is Prime eligible")
    category: str = Field(default="home_kitchen", description="Inferred or parsed Amazon category ID")
    fba_tier: str = Field(default="large_standard", description="Estimated FBA size tier")


class AmazonSearchResponse(BaseModel):
    query: str
    category: str
    total_results: int
    products: list[AmazonProductItem]
    is_live: bool = False
    source: Literal["live_marketplace", "simulated_benchmark"] = "simulated_benchmark"
    cached: bool = False
    note: str = ""


class AmazonAsinDetail(BaseModel):
    asin: str
    title: str
    price: float
    rating: float
    reviews_count: int
    category: str
    category_name: str
    fba_tier: str
    fba_tier_label: str
    image_url: str
    product_url: str
    bullets: list[str] = Field(default_factory=list)
    weight_lb: float = 1.0
    estimated_cogs: float = 0.0
    is_live: bool = False
    source: Literal["live_marketplace", "simulated_benchmark"] = "simulated_benchmark"


class GoogleTrendPoint(BaseModel):
    date: str
    value: int


class AmazonTrendResponse(BaseModel):
    query: str
    trend_points: list[GoogleTrendPoint]
    # None when no honest demand-growth signal is available (autocomplete
    # suggestion counts are not one).
    growth_velocity_pct: Optional[int] = None
    suggestions: list[str]
    is_live: bool = False
    source: Literal["live_autocomplete", "simulated_benchmark"] = "simulated_benchmark"
