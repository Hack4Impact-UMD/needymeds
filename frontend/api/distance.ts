// return type
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

  const format = 'jsonv2';
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${zipcode}&format=${format}`;

  // API request to Nominatim
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'NeedyMeds-App/1.0 (info@needymeds.org)',
    },
  });
  if (!response.ok) {
    throw new Error('Request to Nominatim failed.');
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    throw new Error('No location results.');
  }

  coords.lat = data[0].lat;
  coords.lon = data[0].lon;

  return coords;
}

// calculate distance between two coordinates with the Haversine formula
export function distanceBetweenCoordinates(coords1: Coordinates, coords2: Coordinates): number {
  // radius of earth in miles
  const R = 3963;

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

  // output in miles
  const distance = R * c;
  return distance;
}
