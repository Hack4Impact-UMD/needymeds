import { Pharmacy } from '@/api/types';
import { useEffect, useState } from 'react';
import { distanceBetweenCoordinates, zipToCoords } from '../api/distance';
import { usePharmacyDb } from './use-pharmacy-db';

/**
 * Custom hook to search pharmacies by zip code and radius.
 */
export function useSearchPharmacies(zipCode?: string, radius?: number) {
  const db = usePharmacyDb();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!zipCode || !radius) {
      setPharmacies([]);
      return;
    }

    let isCancelled = false;

    async function fetchPharmacies() {
      setLoading(true);
      setError(null);

      try {
        // Get coordinates of the zip code
        const userCoords = await zipToCoords(zipCode!);

        // Query all pharmacies
        const rows: any[] = await db.getAllAsync(
          `SELECT name, address_line1, address_line2, city, state, zipcode, phone_no, latitude, longitude 
           FROM Pharmacy`
        );

        // Map and filter by distance
        const filtered: Pharmacy[] = rows
          .map((row) => ({
            pharmacyName: row.name || '',
            pharmacyStreet1: row.address_line1 || '',
            pharmacyStreet2: row.address_line2 || null,
            pharmacyCity: row.city || '',
            pharmacyState: row.state || '',
            pharmacyZipCode: row.zipcode,
            latitude: row.latitude,
            longitude: row.longitude,
            distance: distanceBetweenCoordinates(
              { lat: String(row.latitude), lon: String(row.longitude) },
              { lat: userCoords.lat, lon: userCoords.lon }
            ),
            phoneNumber: row.phone_no || null,
          }))
          .filter((p) => p.distance! <= radius!)
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

        if (!isCancelled) setPharmacies(filtered);
      } catch (err: any) {
        console.error('Error fetching pharmacies:', err);
        if (!isCancelled) setError(err.message || 'Unknown error');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchPharmacies();

    return () => {
      isCancelled = true;
    };
  }, [db, zipCode, radius]);

  return { pharmacies, loading, error };
}
