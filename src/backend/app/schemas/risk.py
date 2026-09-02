"""Pydantic request/response contracts for the risk API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["LOW RISK", "MEDIUM RISK", "HIGH RISK", "CRITICAL RISK"]


class AnalyzeRequest(BaseModel):
    service_type: str = Field(min_length=2, max_length=48)
    route_id: str | None = Field(default=None, max_length=64)
    location_id: str = Field(min_length=2, max_length=32)
    origin_location_id: str | None = Field(default=None, max_length=32)
    destination_location_id: str | None = Field(default=None, max_length=32)
    distance_km: float | None = Field(default=None, gt=0, le=5000)
    estimated_minutes: float | None = Field(default=None, gt=0, le=10000)
    quoted_price: float = Field(gt=0, le=10_000_000)
    time_period: str | None = Field(default=None, max_length=32)
    day_type: str | None = Field(default=None, max_length=32)
    vehicle_type: str | None = Field(default=None, max_length=48)
    luggage_count: int | None = Field(default=None, ge=0, le=50)
    toll_amount: float | None = Field(default=None, ge=0, le=100_000)
    description: str = Field(default="", max_length=2000)
    provider_id: str | None = Field(default=None, max_length=32)


class Evidence(BaseModel):
    id: str
    type: str
    title: str
    description: str
    value: str
    source: str


class RiskFactor(BaseModel):
    key: str
    label: str
    score: int
    weight: float
    detail: str


class Recommendation(BaseModel):
    headline: str
    message: str
    actions: list[str]


class AnalyzeResponse(BaseModel):
    request_id: str
    overall_score: int
    risk_level: RiskLevel
    price_score: int
    complaint_score: int
    geo_score: int
    service_pattern_score: int
    text_score: int
    data_confidence: Literal["High", "Medium", "Low"]
    price_deviation: float
    benchmark_price: float
    expected_min: float
    expected_max: float
    benchmark_context: dict
    benchmark_sample_count: int
    weighted_calculation: list[dict]
    factors: list[RiskFactor]
    evidence: list[Evidence]
    reasons: list[str]
    recommendation: Recommendation
    ai_insight: str | None = None


class ReportCreate(BaseModel):
    service_type: str = Field(min_length=2, max_length=48)
    location_id: str
    provider_id: str | None = None
    reported_price: float = Field(gt=0)
    expected_price: float | None = None
    description: str = Field(min_length=12, max_length=2000)
    complaint_category: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    language: str = "English"
    anonymous: bool = True
