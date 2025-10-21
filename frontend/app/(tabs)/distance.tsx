// https://nominatim.openstreetmap.org/search?<params>
// query:
/*
q       free form query
street	housenumber and streetname
city	city
county	county
state	state
country	country
postalcode	postal code
*/

export interface Coordinates {
  lat: string;
  lon: string;
  error?: string;
}

// convert zipcode to coordinates
export async function zipToCoords(zipcode: string): Promise<Coordinates> {
  const coords: Coordinates = {
    lat: '',
    lon: '',
    error: '',
  };

  const f = 'jsonv2';
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${zipcode}&format=${f}`;

  const response = await fetch(url);
  if (!response.ok) {
    coords.error = 'Request to Nominatim failed.';
    return coords;
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    coords.error = 'No results.';
    return coords;
  }

  coords.lat = data[0].lat;
  coords.lon = data[0].lon;

  return coords;
}

// convert string to coordinates
export async function addrToCoords(address: string): Promise<Coordinates> {
  const coords: Coordinates = {
    lat: '',
    lon: '',
    error: '',
  };
  const f = 'jsonv2';
  const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=${f}`;

  const response = await fetch(url);
  if (!response.ok) {
    coords.error = 'Request to Nominatim failed';
    return coords;
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    coords.error = 'No results';
    return coords;
  }

  coords.lat = data[0].lat;
  coords.lon = data[0].lon;

  return coords;
}

// calculate distance between two coordinates with the Haversin formula
export function haversine(coords1: Coordinates, coords2: Coordinates): number {
  const R = 6371000; // radius of earth in meters

  // convert from string to float
  const lat1 = parseFloat(coords1.lat);
  const lon1 = parseFloat(coords1.lon);
  const lat2 = parseFloat(coords2.lat);
  const lon2 = parseFloat(coords2.lon);

  // convert to radians
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  // a
  const a = Math.sin(dp / 2.0) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dl / 2.0) ** 2;

  // c
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // output in meters
  const distance = R * c;
  return distance;
}
