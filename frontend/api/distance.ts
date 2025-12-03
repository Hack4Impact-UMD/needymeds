import zipLatLonJson from '../data/zip_lat_lon.json';

export interface Coordinates {
  lat: string;
  lon: string;
  error?: string;
}

export async function zipToCoords(zipcode: string): Promise<Coordinates> {
  const coords: Coordinates = {
    lat: '',
    lon: '',
  };

  const zipLatLon = zipLatLonJson as unknown as Record<string, [number, number]>;

  const result = zipLatLon[zipcode];

  if (!result) {
    coords.error = 'Zip code not found';
    return coords;
  }

  coords.lat = result[0].toString();
  coords.lon = result[1].toString();

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
