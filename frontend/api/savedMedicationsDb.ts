import * as SQLite from 'expo-sqlite';

export async function create_database() {
  const db = await SQLite.openDatabaseAsync('saved_data.db');

  await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Saved_Medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            drug_name TEXT NOT NULL,
            pharmacy_npi TEXT,
            form TEXT,
            strength TEXT,
            quantity INTEGER,
            last_saved_date TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Recent_Searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            drug_name TEXT NOT NULL UNIQUE,
            generic_name TEXT,
            searched_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Saved_Pharmacies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pharmacy_name TEXT NOT NULL,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip_code TEXT NOT NULL,
            phone_number TEXT,
            last_saved_date TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);
  return db;
}
