import { create_database } from '@/api/savedDB';
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
  const dbReadyPromise = useRef<Promise<SQLiteDatabase>>(create_database());
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    let isCancelled = false;

    dbReadyPromise.current.then(async (db) => {
      if (!isCancelled) {
        await loadRecent(db);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  async function loadRecent(db?: SQLiteDatabase) {
    const database = db ?? (await dbReadyPromise.current);

    const rows = await database.getAllAsync<RecentSearch>(
      `SELECT * FROM Recent_Searches ORDER BY searched_at DESC LIMIT ${MAX_RECENT_SEARCHES}`
    );
    setRecentSearches(rows);
  }

  async function addRecentSearch(drugName: string, genericName: string | null) {
    const db = await dbReadyPromise.current;

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
    const db = await dbReadyPromise.current;

    await db.runAsync('DELETE FROM Recent_Searches WHERE id = ?', [id]);
    await loadRecent(db);
  }

  async function clearAllRecentSearches() {
    const db = await dbReadyPromise.current;

    await db.runAsync('DELETE FROM Recent_Searches');
    await loadRecent(db);
  }

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches: () => loadRecent(),
  };
}
