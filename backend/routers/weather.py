from fastapi import APIRouter, Query
from services.weather_service import weather_service, LOCATIONS

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("")
def get_weather(location: str = Query(default="Metro Grid North")):
    data = weather_service.get_weather(location)
    data["available_locations"] = list(LOCATIONS.keys())
    return data

