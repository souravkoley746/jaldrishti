"""OpenStreetMap Nominatim Geocoding & Location Resolution Service.

Supports location-agnostic forward address search and reverse GPS geocoding
for any Indian or global municipality/city.
"""

from typing import List, Dict, Any, Optional
import httpx


class GeocodingService:
    NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
    NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

    # Pre-indexed offline location database for instant fallback
    OFFLINE_LOCATIONS: List[Dict[str, Any]] = [
      {
        "display_name": "Jessore Road, Champadali More, Barasat, Ward 4, West Bengal",
        "locality": "Barasat Ward 4",
        "address": "Champadali More, Jessore Road, Barasat",
        "lat": 22.7214,
        "lon": 88.4821,
        "district": "North 24 Parganas",
        "state": "West Bengal",
        "country": "India"
      },
      {
        "display_name": "Sector V, Salt Lake Electronics Complex, Bidhannagar, Kolkata, West Bengal",
        "locality": "Salt Lake Sector V",
        "address": "EP Block, Sector V, Salt Lake",
        "lat": 22.5726,
        "lon": 88.4331,
        "district": "Kolkata",
        "state": "West Bengal",
        "country": "India"
      },
      {
        "display_name": "Howrah Station Road, Howrah Municipality, West Bengal",
        "locality": "Howrah Junction Area",
        "address": "Howrah Station Approach Road, Howrah",
        "lat": 22.5835,
        "lon": 88.3426,
        "district": "Howrah",
        "state": "West Bengal",
        "country": "India"
      },
      {
        "display_name": "Hill Cart Road, Siliguri Municipality, Darjeeling, West Bengal",
        "locality": "Siliguri Town Center",
        "address": "Hill Cart Road, Siliguri",
        "lat": 26.7271,
        "lon": 88.4315,
        "district": "Darjeeling",
        "state": "West Bengal",
        "country": "India"
      },
      {
        "display_name": "Janpath Road, Master Canteen Square, Bhubaneswar, Odisha",
        "locality": "Bhubaneswar Central",
        "address": "Janpath Road, Master Canteen, Bhubaneswar",
        "lat": 20.2706,
        "lon": 85.8334,
        "district": "Khurda",
        "state": "Odisha",
        "country": "India"
      },
      {
        "display_name": "GS Road, Dispur, Guwahati, Assam",
        "locality": "Guwahati Dispur Corridor",
        "address": "GS Road, Ganeshguri, Guwahati",
        "lat": 26.1445,
        "lon": 91.7898,
        "district": "Kamrup Metropolitan",
        "state": "Assam",
        "country": "India"
      },
      {
        "display_name": "Connaught Place, New Delhi, Delhi",
        "locality": "CP Inner Circle",
        "address": "Connaught Place, New Delhi",
        "lat": 28.6315,
        "lon": 77.2167,
        "district": "New Delhi",
        "state": "Delhi",
        "country": "India"
      },
      {
        "display_name": "Bandra Kurla Complex (BKC), Mumbai, Maharashtra",
        "locality": "Bandra Kurla Complex",
        "address": "BKC Main Avenue, Bandra East, Mumbai",
        "lat": 19.0657,
        "lon": 72.8687,
        "district": "Mumbai Suburban",
        "state": "Maharashtra",
        "country": "India"
      },
      {
        "display_name": "MG Road, Indiranagar, Bengaluru, Karnataka",
        "locality": "Indiranagar MG Road",
        "address": "100 Feet Road, Indiranagar, Bengaluru",
        "lat": 12.9716,
        "lon": 77.5946,
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "country": "India"
      }
    ]

    PHOTON_SEARCH_URL = "https://photon.komoot.io/api/"

    @classmethod
    async def search_address(cls, query: str) -> List[Dict[str, Any]]:
        """Search address suggestions using Photon & Nominatim APIs for any Pan-India location."""
        if not query or len(query.strip()) < 2:
            return []

        cleaned = query.strip()

        headers = {"User-Agent": "JALDRISHTI-Urban-Flood-Digital-Twin/2.0"}
        # 1. Primary: Photon API (High performance OpenStreetMap search with Pan-India location bias)
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(
                    cls.PHOTON_SEARCH_URL,
                    params={"q": cleaned, "limit": 10, "lat": 20.5937, "lon": 78.9629},
                    headers=headers
                )
                if res.status_code == 200:
                    data = res.json()
                    features = data.get("features", [])
                    if features:
                        parsed = []
                        for feat in features:
                            p = feat.get("properties", {})
                            coords = feat.get("geometry", {}).get("coordinates", [0.0, 0.0])
                            lon, lat = float(coords[0]), float(coords[1])
                            name = p.get("name") or p.get("street") or cleaned
                            city = p.get("city") or p.get("town") or p.get("village") or p.get("hamlet") or p.get("suburb") or p.get("district") or ""
                            state = p.get("state", "")
                            country = p.get("country", "India")
                            
                            is_india = country.lower() == "india" or (68.0 <= lon <= 98.0 and 6.0 <= lat <= 38.0)
                            
                            parts = [pt for pt in [name, city, p.get("district") or p.get("county"), state, country] if pt]
                            display_name = ", ".join(parts)
                            locality = f"{name}, {city}" if city else name

                            category = p.get("osm_key") or p.get("type") or p.get("category") or "place"
                            place_type = p.get("osm_value") or p.get("type") or "location"

                            parsed.append({
                                "name": name,
                                "display_name": display_name,
                                "locality": locality,
                                "address": name,
                                "lat": lat,
                                "lon": lon,
                                "type": place_type,
                                "category": category,
                                "district": p.get("district") or p.get("county") or city or "District",
                                "state": state or "State",
                                "country": country,
                                "source": "NOMINATIM_OSM",
                                "is_india": is_india,
                            })
                        
                        # Prioritize Indian results first
                        parsed.sort(key=lambda x: not x["is_india"])
                        if parsed:
                            return parsed
        except Exception as e:
            pass

        # 2. Secondary: Nominatim REST API
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                params = {
                    "q": cleaned,
                    "format": "json",
                    "addressdetails": 1,
                    "limit": 8,
                    "countrycodes": "in"
                }
                headers = {"User-Agent": "JALDRISHTI-Urban-Flood-Digital-Twin/2.0"}
                response = await client.get(cls.NOMINATIM_SEARCH_URL, params=params, headers=headers)
                if response.status_code == 200:
                    results = response.json()
                    parsed = []
                    for item in results:
                        addr = item.get("address", {})
                        locality = (
                            addr.get("village")
                            or addr.get("hamlet")
                            or addr.get("suburb")
                            or addr.get("neighbourhood")
                            or addr.get("town")
                            or addr.get("city_district")
                            or addr.get("city")
                            or addr.get("county")
                            or addr.get("state_district")
                            or "Local Area"
                        )
                        state = addr.get("state", "State")
                        district = addr.get("state_district") or addr.get("county") or "District"
                        parsed.append({
                            "display_name": item.get("display_name"),
                            "locality": f"{locality}, {state}" if state != "State" else locality,
                            "address": item.get("display_name", "").split(",")[0],
                            "lat": float(item.get("lat")),
                            "lon": float(item.get("lon")),
                            "district": district,
                            "state": state,
                            "country": addr.get("country", "India"),
                            "source": "NOMINATIM_OSM"
                        })
                    if parsed:
                        return parsed
        except Exception as e:
            pass

        # Fallback offline matching
        q_lower = cleaned.lower()
        matched = [loc for loc in cls.OFFLINE_LOCATIONS if q_lower in loc["display_name"].lower() or q_lower in loc["locality"].lower()]
        return matched

    @classmethod
    async def reverse_geocode(cls, lat: float, lon: float) -> Dict[str, Any]:
        """Reverse geocode coordinates into a structured location address."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                params = {
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                    "addressdetails": 1
                }
                headers = {"User-Agent": "JALDRISHTI-Urban-Flood-Digital-Twin/2.0"}
                response = await client.get(cls.NOMINATIM_REVERSE_URL, params=params, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    addr = data.get("address", {})
                    road = addr.get("road") or addr.get("pedestrian") or "Local Corridor"
                    locality = addr.get("suburb") or addr.get("neighbourhood") or addr.get("town") or addr.get("city") or "Municipal Ward"
                    return {
                        "display_name": data.get("display_name"),
                        "road": road,
                        "locality": locality,
                        "address": f"{road}, {locality}",
                        "lat": lat,
                        "lon": lon,
                        "district": addr.get("state_district") or addr.get("county") or "District",
                        "state": addr.get("state", "State"),
                        "country": addr.get("country", "India"),
                        "location_source": "GPS"
                    }
        except Exception as e:
            pass

        return {
            "display_name": f"Current GPS Location ({lat:.4f}°N, {lon:.4f}°E)",
            "road": "GPS Location Road",
            "locality": "Municipal Zone",
            "address": f"Coordinates {lat:.4f}°N, {lon:.4f}°E",
            "lat": lat,
            "lon": lon,
            "district": "District Zone",
            "state": "State",
            "country": "India",
            "location_source": "GPS"
        }
