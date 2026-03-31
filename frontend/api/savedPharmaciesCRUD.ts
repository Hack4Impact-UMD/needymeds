import * as SQLite from 'expo-sqlite';
import { SavedPharmacy } from './types';

function date(): string {
  return new Date().toISOString();
}

export async function savePharmacy(
  db: SQLite.SQLiteDatabase,
  pharmacy: Omit<SavedPharmacy, 'id' | 'last_saved_date'>
): Promise<SavedPharmacy> {
  const now = date();

  const result = await db.runAsync(
    `INSERT INTO Saved_Pharmacies
            (pharmacy_name, street, city, state, zip_code, phone_number, last_saved_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      pharmacy.pharmacy_name,
      pharmacy.street,
      pharmacy.city,
      pharmacy.state,
      pharmacy.zip_code,
      pharmacy.phone_number ?? null,
      now,
    ]
  );

  return {
    ...pharmacy,
    id: result.lastInsertRowId,
    last_saved_date: now,
  };
}

export async function getAllPharmacies(db: SQLite.SQLiteDatabase): Promise<SavedPharmacy[]> {
  const rows = await db.getAllAsync<SavedPharmacy>(
    `SELECT * FROM Saved_Pharmacies ORDER BY last_saved_date DESC`
  );
  return rows;
}

export async function deletePharmacy(db: SQLite.SQLiteDatabase, id: number): Promise<boolean> {
  const result = await db.runAsync(`DELETE FROM Saved_Pharmacies WHERE id = ?`, [id]);
  return result.changes > 0;
}

export async function deleteAllPharmacies(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.runAsync(`DELETE FROM Saved_Pharmacies`);
  return result.changes;
}
