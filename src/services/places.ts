/**
 * Uses OpenStreetMap's Overpass API to find nearby facilities.
 * This is a 100% free alternative to Google Places API.
 */

export interface NearbyFacility {
  name: string;
  type: string;
  distance: number; // in meters
}

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lon: number;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c);
}

export const getNearbyFacilities = async (lat: number, lng: number, radius = 1000): Promise<NearbyFacility[]> => {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return [];

  const overpassPromise = (async () => {
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"](around:${radius},${lat},${lng});
        way["amenity"](around:${radius},${lat},${lng});
        node["building"~"hospital|school|train_station|public|commercial|retail"](around:${radius},${lat},${lng});
        way["building"~"hospital|school|train_station|public|commercial|retail"](around:${radius},${lat},${lng});
      );
      out center;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.elements || [])
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => {
        const elLat = el.type === 'node' ? el.lat : el.center?.lat || el.lat;
        const elLng = el.type === 'node' ? el.lon : el.center?.lon || el.lon;
        return {
          name: el.tags.name,
          type: el.tags?.amenity || el.tags?.building || 'Infrastructure',
          distance: calculateDistance(lat, lng, elLat, elLng)
        };
      });
  })();

  const photonPromise = (async () => {
    const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&limit=15`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || [])
      .filter((f: any) => f.properties && (f.properties.name || f.properties.street))
      .map((f: any) => {
        const p = f.properties;
        const coords = f.geometry?.coordinates || [lng, lat];
        const name = p.name || p.street || p.suburb || "Municipal Sector";
        const rawType = p.osm_value || p.osm_key || p.type || "Facility";
        const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).replace('_', ' ');
        return {
          name: name,
          type: type,
          distance: calculateDistance(lat, lng, coords[1], coords[0])
        };
      });
  })();

  const results = await Promise.allSettled([photonPromise, overpassPromise]);
  let combined: NearbyFacility[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      combined.push(...r.value);
    }
  }

  const unique = combined.filter((v, i, a) => a.findIndex(t => t.name.toLowerCase() === v.name.toLowerCase()) === i);
  return unique.sort((a, b) => a.distance - b.distance);
};

export const searchAddress = async (query: string): Promise<GeocodeResult[]> => {
  if (!query.trim()) return [];
  
  try {
    // We switched from Nominatim to Photon (also free & OSM-based) because Photon 
    // uses Elasticsearch, making it typo-tolerant and much better for partial autocomplete.
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error("Failed to search address");
    const data = await response.json();
    
    return data.features.map((item: any) => {
      const { name, city, state, country } = item.properties;
      // Construct a readable display name
      const addressParts = [name, city, state, country].filter(Boolean);
      // Remove duplicates from the array (e.g. if name is same as city)
      const uniqueParts = addressParts.filter((v, i, a) => a.indexOf(v) === i);
      
      return {
        displayName: uniqueParts.join(', '),
        lon: item.geometry.coordinates[0],
        lat: item.geometry.coordinates[1]
      };
    });
  } catch (error) {
    console.error("Error searching address:", error);
    return [];
  }
};
