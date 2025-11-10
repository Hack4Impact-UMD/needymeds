let SQLite: any;
try {
  SQLite = require('expo-sqlite');
} catch {
  // For testing environments where expo-sqlite may not be available
  SQLite = { openDatabaseAsync: () => Promise.reject(new Error('expo-sqlite not available')) };
}
import { setCacheEntry } from '../redux/pharmacySearchSlice';
import { store } from '../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from './distance';
import { Pharmacy } from './types';

interface PharmacyRow {
  pharmacyName: string;
  pharmacyStreet1: string;
  pharmacyStreet2: string | null;
  pharmacyCity: string;
  pharmacyState: string;
  pharmacyZipCode: string;
  latitude: number | null;
  longitude: number | null;
}
async function openDatabase(): Promise<any> {
  return await SQLite.openDatabaseAsync('pharmacies.db');
}

async function queryAllPharmacies(db: any): Promise<Pharmacy[]> {
  const result = (await db.getAllAsync(
    'SELECT pharmacyName, pharmacyStreet1, pharmacyStreet2, pharmacyCity, pharmacyState, pharmacyZipCode, latitude, longitude FROM pharmacies'
  )) as PharmacyRow[];

  return result.map((row: PharmacyRow) => ({
    pharmacyName: row.pharmacyName,
    pharmacyStreet1: row.pharmacyStreet1,
    pharmacyStreet2: row.pharmacyStreet2 || '',
    pharmacyCity: row.pharmacyCity,
    pharmacyState: row.pharmacyState,
    pharmacyZipCode: row.pharmacyZipCode,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  }));
}

export async function searchPharmacies(zipCode: number, radius: number): Promise<Pharmacy[]> {
  try {
    const zipCodeStr = String(zipCode);
    const cacheKey = `pharmacy-${zipCodeStr}-${radius}`;

    // Check cache first
    const state = store.getState() as any;
    const cachedEntry = state.pharmacySearch?.cache?.[cacheKey];
    if (cachedEntry) {
      return cachedEntry.results;
    }

    // Get user coordinates from zip code
    const userCoords = await zipToCoords(zipCodeStr);

    // Open database and query all pharmacies
    const db = await openDatabase();
    const allPharmacies = await queryAllPharmacies(db);
    await db.closeAsync();

    // Calculate distances and filter by radius
    const pharmaciesWithDistance: Pharmacy[] = [];

    for (const pharmacy of allPharmacies) {
      let pharmacyLat: string;
      let pharmacyLon: string;

      // Use stored coordinates if available, otherwise convert zip code
      if (pharmacy.latitude !== undefined && pharmacy.longitude !== undefined) {
        pharmacyLat = String(pharmacy.latitude);
        pharmacyLon = String(pharmacy.longitude);
      } else {
        const pharmacyCoords = await zipToCoords(pharmacy.pharmacyZipCode);
        pharmacyLat = pharmacyCoords.lat;
        pharmacyLon = pharmacyCoords.lon;
      }

      const distance = distanceBetweenCoordinates(
        { lat: pharmacyLat, lon: pharmacyLon },
        { lat: userCoords.lat, lon: userCoords.lon }
      );

      // Filter by radius
      if (distance <= radius) {
        pharmaciesWithDistance.push({
          ...pharmacy,
          latitude: parseFloat(pharmacyLat),
          longitude: parseFloat(pharmacyLon),
          distance,
        });
      }
    }

    // Sort by distance
    const sortedResults = pharmaciesWithDistance.sort((a, b) => {
      const distA = a.distance ?? Infinity;
      const distB = b.distance ?? Infinity;
      return distA - distB;
    });

    // Cache results
    store.dispatch(setCacheEntry({ key: cacheKey, results: sortedResults }));

    return sortedResults;
  } catch (err) {
    console.error('Error in searchPharmacies:', err);
    return [];
  }
}
