import * as SQLite from 'expo-sqlite';

export async function create_database() {
  const db = await SQLite.openDatabaseAsync('mydb.db');

  await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Saved_Medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            drug_name TEXT NOT NULL,
            pharmacy_npi TEXT,
            form TEXT,
            strength TEXT,
            quantity INTEGER,
            last_saved_date TEXT DEFAULT CURRENT_TIMESTAMP,
            last_queried_date TEXT DEFAULT CURRENT_TIMESTAMP
        ); 
    `);
  return db;
}
