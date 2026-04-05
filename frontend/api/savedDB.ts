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
      last_saved_date TEXT DEFAULT CURRENT_TIMESTAMP,
      price DECIMAL(10, 2)
    );

    CREATE TABLE IF NOT EXISTS Saved_Pharmacies (
      npi TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phoneNumber TEXT NOT NULL
    );
  `);

  return db;
}
