import * as SQLite from 'expo-sqlite';
import { SavedMedication } from './types';

// get current date
function date(): string {
  return new Date().toISOString();
}

// insert and save a new medication to the database
export async function saveMedication(
  db: SQLite.SQLiteDatabase,
  med: Omit<SavedMedication, 'id' | 'last_saved_date'>
): Promise<SavedMedication> {
  const now = date();

  const result = await db.runAsync(
    'INSERT INTO Saved_Medications (drug_name, pharmacy_name, pharmacy_address, form, strength, quantity, price, last_saved_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      med.drug_name || '',
      med.pharmacy_name ?? null,
      med.pharmacy_address ?? null,
      med.form ?? null,
      med.strength ?? null,
      med.quantity ?? null,
      med.price ?? null,
      now,
    ]
  );

  return {
    ...med,
    id: result.lastInsertRowId,
    last_saved_date: now,
  };
}

// retrieve all saved medications
export async function getAllMedications(db: SQLite.SQLiteDatabase): Promise<SavedMedication[]> {
  const rows = await db.getAllAsync<SavedMedication>(
    'SELECT * FROM Saved_Medications ORDER BY last_saved_date DESC'
  );
  return rows;
}

// retrieve a specific medication by its primary key
export async function getMedicationByID(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<SavedMedication | null> {
  const row = await db.getFirstAsync<SavedMedication>(
    'SELECT * FROM Saved_Medications WHERE id = ?',
    [id]
  );
  return row ?? null;
}

// search for medications by drug name
export async function searchMedications(
  db: SQLite.SQLiteDatabase,
  drug_name: string
): Promise<SavedMedication[]> {
  const rows = await db.getAllAsync<SavedMedication>(
    'SELECT * FROM Saved_Medications WHERE LOWER(drug_name) LIKE LOWER(?) ORDER BY last_saved_date DESC',
    [`%${drug_name}%`]
  );
  return rows;
}

// delete one medication
export async function deleteMedication(db: SQLite.SQLiteDatabase, id: number): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM Saved_Medications WHERE id = ?', [id]);
  return result.changes > 0;
}

// deletes all saved medications
export async function deleteAllMedications(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.runAsync('DELETE FROM Saved_Medications');
  return result.changes;
}
