import * as SQLite from 'expo-sqlite';
import { SavedPharmacy } from './types';

// insert and save a new pharmacy to the database
export async function savePharmacy(
  db: SQLite.SQLiteDatabase,
  pharmacy: SavedPharmacy
): Promise<SavedPharmacy> {
  await db.runAsync(
    `INSERT or REPLACE INTO Saved_Pharmacies (npi, name, address, phoneNumber)
      VALUES (?, ?, ?, ?)`,
    [pharmacy.npi, pharmacy.name, pharmacy.address, pharmacy.phoneNumber ?? null]
  );

  return pharmacy;
}

// retrieve all saved pharmacies
export async function getAllPharmacies(db: SQLite.SQLiteDatabase): Promise<SavedPharmacy[]> {
  const rows = await db.getAllAsync<SavedPharmacy>(`SELECT * FROM Saved_Pharmacies`);

  return rows;
}

// retrieve a specific pharmacy by its primary key (npi)
export async function getPharmacyByID(
  db: SQLite.SQLiteDatabase,
  npi: string
): Promise<SavedPharmacy | null> {
  const row = await db.getFirstAsync<SavedPharmacy>(
    `SELECT * FROM Saved_Pharmacies
     WHERE npi = ?`,
    [npi]
  );

  // return null if not found
  return row ?? null;
}

// search for pharmacies by name (partial, case-insensitive)
export async function searchPharmacies(
  db: SQLite.SQLiteDatabase,
  name: string
): Promise<SavedPharmacy[]> {
  const rows = await db.getAllAsync<SavedPharmacy>(
    `SELECT * FROM Saved_Pharmacies
     WHERE LOWER(name) LIKE LOWER(?)`,
    [`%${name}%`]
  );

  return rows;
}

// delete one pharmacy by npi
export async function deletePharmacy(db: SQLite.SQLiteDatabase, npi: string): Promise<boolean> {
  const result = await db.runAsync(`DELETE FROM Saved_Pharmacies WHERE npi = ?`, [npi]);

  // returns true if the row was deleted,
  // false if it wasn't found by npi
  return result.changes > 0;
}

// deletes all saved pharmacies
// returns number of rows removed from table
export async function deleteAllPharmacies(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.runAsync(`DELETE FROM Saved_Pharmacies`);

  return result.changes;
}
