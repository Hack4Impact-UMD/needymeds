import { create_database } from '@/api/savedMedicationsDb';
import { SavedMedication } from '@/api/types';
import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to manage saved medications in the local SQLite database.
 * Provides state and methods for storing, retrieving, and deleting saved medications.
 */
export function useSavedMedications() {
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const [medications, setMedications] = useState<SavedMedication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        const db = await create_database();
        if (!isCancelled) {
          dbRef.current = db;
          await loadMedications(db);
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

  async function loadMedications(db?: SQLiteDatabase) {
    const database = db ?? dbRef.current;
    if (!database) return;

    setLoading(true);
    setError(null);
    try {
      const rows = await database.getAllAsync<SavedMedication>(
        'SELECT * FROM Saved_Medications ORDER BY last_saved_date DESC'
      );
      setMedications(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved medications');
    } finally {
      setLoading(false);
    }
  }

  async function saveMedication(med: Omit<SavedMedication, 'id' | 'last_saved_date' | 'last_queried_date'>) {
    const db = dbRef.current;
    if (!db) {
      setError('Database not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await db.runAsync(
        `INSERT INTO Saved_Medications (drug_name, pharmacy_name, pharmacy_npi, form, strength, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [med.drug_name, med.pharmacy_name ?? null, med.pharmacy_npi ?? null, med.form ?? null, med.strength ?? null, med.quantity ?? null]
      );
      await loadMedications(db);
    } catch (err: any) {
      setError(err.message || 'Failed to save medication');
    } finally {
      setLoading(false);
    }
  }

  async function deleteMedication(id: number) {
    const db = dbRef.current;
    if (!db) {
      setError('Database not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await db.runAsync('DELETE FROM Saved_Medications WHERE id = ?', [id]);
      await loadMedications(db);
    } catch (err: any) {
      setError(err.message || 'Failed to delete medication');
    } finally {
      setLoading(false);
    }
  }

  return {
    medications,
    loading,
    error,
    saveMedication,
    deleteMedication,
    refreshMedications: () => loadMedications(),
  };
}


