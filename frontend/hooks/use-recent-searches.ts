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
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const dbRef = useRef<SQLiteDatabase | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        const db = await create_database();
        if (!isCancelled) {
          dbRef.current = db;
          await loadRecent(db);
        }
      } catch (err) {
        console.error('Recent searches init error:', err);
      }
    }

    init();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function loadRecent(db?: SQLiteDatabase) {
    try {
      const database = db ?? dbRef.current;
      if (!database) return;

      const rows = await database.getAllAsync<RecentSearch>(
        'SELECT * FROM Recent_Searches ORDER BY searched_at DESC LIMIT 10'
      );
      setRecentSearches(rows);
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  }

  async function addRecentSearch(drugName: string, genericName: string | null) {
    try {
      const db = dbRef.current || (await create_database());
      if (!dbRef.current) dbRef.current = db;

      await db.runAsync(
        'INSERT INTO Recent_Searches (drug_name, generic_name, searched_at) VALUES (?, ?, ?) ON CONFLICT(drug_name) DO UPDATE SET generic_name = excluded.generic_name, searched_at = excluded.searched_at',
        [drugName, genericName, new Date().toISOString()]
      );
      await loadRecent(db);
    } catch (err) {
      console.error('Failed to add recent search:', err);
    }
  }

  async function removeRecentSearch(id: number) {
    try {
      const db = dbRef.current;
      if (!db) return;

      await db.runAsync('DELETE FROM Recent_Searches WHERE id = ?', [id]);
      await loadRecent(db);
    } catch (err) {
      console.error('Failed to remove recent search:', err);
    }
  }

  async function clearAllRecentSearches() {
    try {
      const db = dbRef.current;
      if (!db) return;

      await db.runAsync('DELETE FROM Recent_Searches');
      await loadRecent(db);
    } catch (err) {
      console.error('Failed to clear recent searches:', err);
    }
  }

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches: () => loadRecent(),
  };
}
