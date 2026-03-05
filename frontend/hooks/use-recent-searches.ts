import { create_database } from '@/api/savedMedicationsDb';
import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

const MAX_RECENT_SEARCHES = 10;

export interface RecentSearch {
  id: number;
  drug_name: string;
  generic_name: string | null;
  searched_at: string;
}

/**
 * Custom hook to manage recent medication searches in the local SQLite database.
 */
export function useRecentSearches() {
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        const db = await create_database();
        if (!isCancelled) {
          dbRef.current = db;
          await loadRecent(db);
        }
      } catch {}
    }

    init();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function loadRecent(db?: SQLiteDatabase) {
    const database = db ?? dbRef.current;
    if (!database) return;

    const rows = await database.getAllAsync<RecentSearch>(
      `SELECT * FROM Recent_Searches ORDER BY searched_at DESC LIMIT ${MAX_RECENT_SEARCHES}`
    );
    setRecentSearches(rows);
  }

  async function addRecentSearch(drugName: string, genericName: string | null) {
    const db = dbRef.current;
    if (!db) return;

    await db.runAsync(
      `INSERT INTO Recent_Searches (drug_name, generic_name, searched_at)
       VALUES (?, ?, ?)
       ON CONFLICT(drug_name) DO UPDATE SET
         generic_name = excluded.generic_name,
         searched_at = excluded.searched_at`,
      [drugName, genericName, new Date().toISOString()]
    );
    await loadRecent(db);
  }

  async function removeRecentSearch(id: number) {
    const db = dbRef.current;
    if (!db) return;

    await db.runAsync('DELETE FROM Recent_Searches WHERE id = ?', [id]);
    await loadRecent(db);
  }

  return { recentSearches, addRecentSearch, removeRecentSearch, refreshRecentSearches: () => loadRecent() };
}
