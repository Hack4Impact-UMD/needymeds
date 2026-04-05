import { create_database } from '@/api/savedDB';
import { SavedPharmacy } from '@/api/types';
import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to manage saved pharmacies in the local SQLite database.
 * Provides state and methods for storing, retrieving, and deleting saved pharmacies.
 */
export function useSavedPharmacies() {
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const [pharmacies, setPharmacies] = useState<SavedPharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        const db = await create_database();
        if (!isCancelled) {
          dbRef.current = db;
          await loadPharmacies(db);
        }
      } catch (err: any) {
        if (!isCancelled) setError(err.message || 'Failed to initialize database');
      }
    }

    init();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function loadPharmacies(db?: SQLiteDatabase) {
    const database = db ?? dbRef.current;
    if (!database) return;

    setLoading(true);
    setError(null);
    try {
      const rows = await database.getAllAsync<SavedPharmacy>(
        'SELECT * FROM Saved_Pharmacies ORDER BY name ASC'
      );
      setPharmacies(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved pharmacies');
    } finally {
      setLoading(false);
    }
  }

  async function savePharmacy(pharmacy: SavedPharmacy) {
    const db = dbRef.current;
    if (!db) {
      setError('Database not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO Saved_Pharmacies (npi, name, address, phoneNumber)
         VALUES (?, ?, ?, ?)`,
        [pharmacy.npi, pharmacy.name, pharmacy.address, pharmacy.phoneNumber ?? null]
      );
      await loadPharmacies(db);
    } catch (err: any) {
      setError(err.message || 'Failed to save pharmacy');
    } finally {
      setLoading(false);
    }
  }

  async function deletePharmacy(npi: string) {
    const db = dbRef.current;
    if (!db) {
      setError('Database not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await db.runAsync('DELETE FROM Saved_Pharmacies WHERE npi = ?', [npi]);
      await loadPharmacies(db);
    } catch (err: any) {
      setError(err.message || 'Failed to delete pharmacy');
    } finally {
      setLoading(false);
    }
  }

  return {
    pharmacies,
    loading,
    error,
    savePharmacy,
    deletePharmacy,
    refreshPharmacies: () => loadPharmacies(),
  };
}
