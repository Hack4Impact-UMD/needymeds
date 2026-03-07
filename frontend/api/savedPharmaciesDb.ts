import * as SQLite from 'expo-sqlite';

const DB_NAME = 'needymeds.db';

export async function create_database(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Saved_Pharmacies (
      npi TEXT PRIMARY KEY NOT NULL,
      pharmacy_name TEXT NOT NULL,
      address TEXT NOT NULL
    );
  `);

  return db;
}
