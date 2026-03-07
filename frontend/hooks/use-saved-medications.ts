import { create_database } from '@/api/savedMedicationsDb';
import {
  getAllMedications,
  saveMedication as saveMedicationDB,
  deleteMedication as deleteMedicationDB,
} from '@/api/savedMedicationsCRUD';
import { SavedMedication } from '@/api/types';
import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

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
      const rows = await getAllMedications(database);
      setMedications(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved medications');
    } finally {
      setLoading(false);
    }
  }

  async function saveMedication(med: Omit<SavedMedication, 'id' | 'last_saved_date'>) {
    const db = dbRef.current;
    if (!db) {
      setError('Database not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await saveMedicationDB(db, med);
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
      const deleted = await deleteMedicationDB(db, id);
      if (!deleted) {
        setError(`Medication with id ${id} was not found`);
        return;
      }
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
