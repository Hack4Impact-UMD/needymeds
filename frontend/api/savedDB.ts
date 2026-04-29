import * as SQLite from 'expo-sqlite';

export async function create_database() {
  try {
    const db = await SQLite.openDatabaseAsync('saved_data.db');

    await db.execAsync('PRAGMA journal_mode = WAL;');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Saved_Medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_name TEXT NOT NULL,
        last_saved_date TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const columns = [
      'pharmacy_name TEXT',
      'pharmacy_address TEXT',
      'form TEXT',
      'strength TEXT',
      'quantity INTEGER',
      'price TEXT',
    ];

    for (const column of columns) {
      try {
        await db.execAsync(`ALTER TABLE Saved_Medications ADD COLUMN ${column};`);
      } catch (e) {
        // Column already exists, ignore
      }
    }

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Saved_Pharmacies (
        npi TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phoneNumber TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Recent_Searches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_name TEXT NOT NULL UNIQUE, 
        generic_name TEXT,
        searched_at TEXT NOT NULL
      );
    `);

    return db;
  } catch (error) {
    console.error('Failed to initialize saved_data database:', error);
    throw error;
  }
}
