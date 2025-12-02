import { useSQLiteContext } from 'expo-sqlite';

/**
 * Provides access to the pre-bundled SQLite database.
 * Must be called inside a React component or another hook.
 */
export function usePharmacyDb() {
  const db = useSQLiteContext();

  if (!db) {
    throw new Error('usePharmacyDb must be used within a SQLiteProvider context');
  }

  return db;
}
