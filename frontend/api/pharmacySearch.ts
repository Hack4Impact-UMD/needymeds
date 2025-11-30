let SQLite: any;
try {
  SQLite = require('expo-sqlite');
} catch {
  SQLite = { openDatabaseAsync: () => Promise.reject(new Error('expo-sqlite not available')) };
}

import { setCacheEntry } from '../redux/pharmacySearchSlice';
import { store } from '../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from './distance';
import { Pharmacy } from './types';

interface PharmacyRow {
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
}

async function openDatabase(): Promise<any> {
  return await SQLite.openDatabaseAsync('pharmacy.db');
}

async function queryAllPharmacies(db: any): Promise<Pharmacy[]> {
  const result = (await db.getAllAsync(
    'SELECT name, address_line1, address_line2, city, state, zip_code, latitude, longitude, phoneNumber FROM Pharmacy'
  )) as PharmacyRow[];

  return result.map((row: PharmacyRow) => ({
    pharmacyName: row.name || '',
    pharmacyStreet1: row.address_line1 || '',
    pharmacyStreet2: row.address_line2 || '',
    pharmacyCity: row.city || '',
    pharmacyState: row.state || '',
    pharmacyZipCode: row.zip_code,
    latitude: row.latitude,
    longitude: row.longitude,
    phoneNumber: row.phoneNumber,
  }));
}

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  error?: string;
  tableExists?: boolean;
  rowCount?: number;
}> {
  try {
    const db = await openDatabase();

    // Test if we can query
    try {
      const result = await db.getAllAsync('SELECT COUNT(*) as count FROM Pharmacy');
      const count = result?.[0]?.count ?? 0;

      await db.closeAsync();

      return {
        success: true,
        tableExists: true,
        rowCount: count,
      };
    } catch (queryError: any) {
      await db.closeAsync();

      // Check if it's a "no such table" error
      if (
        queryError?.message?.includes('no such table') ||
        queryError?.message?.includes('SQLITE_ERROR')
      ) {
        return {
          success: false,
          error: 'Table "Pharmacy" does not exist',
          tableExists: false,
        };
      }

      return {
        success: false,
        error: `Query error: ${queryError?.message || 'Unknown error'}`,
        tableExists: false,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Database connection failed: ${err?.message || 'Unknown error'}`,
      tableExists: false,
    };
  }
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
      const distance = distanceBetweenCoordinates(
        { lat: String(pharmacy.latitude), lon: String(pharmacy.longitude) },
        { lat: userCoords.lat, lon: userCoords.lon }
      );

      // Filter by radius
      if (distance <= radius) {
        pharmaciesWithDistance.push({
          ...pharmacy,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
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