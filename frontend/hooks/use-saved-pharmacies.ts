import { create_database } from '@/api/savedMedicationsDb';
import {
  getAllPharmacies,
  savePharmacy as savePharmacyDB,
  deletePharmacy as deletePharmacyDB,
} from '@/api/savedPharmaciesCRUD';
import { SavedPharmacy } from '@/api/types';
import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

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
      const rows = await getAllPharmacies(database);
      setPharmacies(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved pharmacies');
    } finally {
      setLoading(false);
    }
  }

  async function savePharmacy(pharmacy: Omit<SavedPharmacy, 'id' | 'last_saved_date'>) {
    const db = dbRef.current;
    if (!db) {
      setError('Database not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await savePharmacyDB(db, pharmacy);
      await loadPharmacies(db);
    } catch (err: any) {
      setError(err.message || 'Failed to save pharmacy');
    } finally {
      setLoading(false);
    }
  }

  async function deletePharmacy(id: number) {
    const db = dbRef.current;
    if (!db) {
      setError('Database not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const deleted = await deletePharmacyDB(db, id);
      if (!deleted) {
        setError(`Pharmacy with id ${id} was not found`);
        return;
      }
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
