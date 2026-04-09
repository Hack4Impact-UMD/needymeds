import * as SQLite from 'expo-sqlite';
import { SavedMedication } from './types';

// get current date
function date(): string {
  return new Date().toISOString();
}

// insert and save a new medication to the database
export async function saveMedication(
  db: SQLite.SQLiteDatabase,
  med: Omit<SavedMedication, 'id' | 'last_saved_date'> // provided by the function, not required by user
): Promise<SavedMedication> {
  const now = date();

  // insert new saved med into database
  const result = await db.runAsync(
    `INSERT INTO Saved_Medications
            (drug_name, pharmacy_name, pharmacy_address, form, strength, quantity, price, last_saved_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      med.drug_name,
      med.pharmacy_name ?? null,
      med.pharmacy_address ?? null,
      med.form ?? null,
      med.strength ?? null,
      med.quantity ?? null,
      med.price ?? null,
      now,
    ]
  );

  // returns the new created med (with its auto-generated id and dates added)
  return {
    ...med,
    id: result.lastInsertRowId,
    last_saved_date: now,
  };
}

// retrieve all saved medications
export async function getAllMedications(db: SQLite.SQLiteDatabase): Promise<SavedMedication[]> {
  // get all rows
  const rows = await db.getAllAsync<SavedMedication>(
    `SELECT * FROM Saved_Medications ORDER BY last_saved_date DESC`
  );

  // returns back all saved meds in a list
  return rows;
}

// retrieve a specific medication by its primary key
export async function getMedicationByID(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<SavedMedication | null> {
  // get the first returned saved med by id
  const row = await db.getFirstAsync<SavedMedication>(
    `SELECT * FROM Saved_Medications 
        WHERE id = ?`,
    [id]
  );

  // return null if not found
  return row ?? null;
}

// search for medications by drug name
export async function searchMedications(
  db: SQLite.SQLiteDatabase,
  drug_name: string
): Promise<SavedMedication[]> {
  // queries for all meds that have partial and case-insensitive match with given drug name
  const rows = await db.getAllAsync<SavedMedication>(
    `SELECT * FROM Saved_Medications
        WHERE LOWER(drug_name) LIKE LOWER(?)
        ORDER BY last_saved_date DESC`,
    [`%${drug_name}%`]
  );

  return rows;
}

// delete one medication
export async function deleteMedication(db: SQLite.SQLiteDatabase, id: number): Promise<boolean> {
  // delete by id
  const result = await db.runAsync(`DELETE FROM Saved_Medications WHERE id = ?`, [id]);

  // returns true if the row was deleted
  // false if it wasn't found by id
  return result.changes > 0;
}

// deletes all saved medications
// returns number of rows removed from table
export async function deleteAllMedications(db: SQLite.SQLiteDatabase): Promise<number> {
  // delete all from the database
  const result = await db.runAsync(`DELETE FROM Saved_Medications`);
  // returns count of rows deleted
  return result.changes;
}
