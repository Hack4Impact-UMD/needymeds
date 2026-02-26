import * as SQLite from 'expo-sqlite';
import { SavedMedication } from './types';

// get current date
function date(): string {
  return new Date().toISOString();
}

// insert and save a new medication to the database
export async function saveMedication(
  db: SQLite.SQLiteDatabase,
  med: Omit<SavedMedication, 'id' | 'last_saved_date' | 'last_queried_date'> // provided by the function, not required by user
): Promise<SavedMedication> {
  const now = date();

  // insert new saved med into database
  const result = await db.runAsync(
    `INSERT INTO Saved_Medications
            (drug_name, pharmacy_npi, form, strength, quantity, last_saved_date, last_queried_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      med.drug_name,
      med.pharmacy_npi ?? null,
      med.form ?? null,
      med.strength ?? null,
      med.quantity ?? null,
      now,
      now,
    ]
  );

  // returns the new created med (with its auto-generated id and dates added)
  return {
    ...med,
    id: result.lastInsertRowId,
    last_saved_date: now,
    last_queried_date: now,
  };
}

// retrieve all saved medications
export async function getAllMedications(db: SQLite.SQLiteDatabase): Promise<SavedMedication[]> {
  const now = date();

  // get all rows
  const rows = await db.getAllAsync<SavedMedication>(
    `SELECT * FROM Saved_Medications` // ORDER BY last_saved_date DESC if we want to sort it
  );

  // updates last_queried_date for every row
  if (rows.length > 0) {
    const ids = rows.map((r) => r.id).join(',');
    await db.runAsync(
      `UPDATE Saved_Medications 
            SET last_queried_date = ? 
            WHERE id IN (${ids})`,
      [now]
    );
  }

  // returns back all saved meds in a list
  return rows.map((r) => ({ ...r, last_queried_date: now }));
}

// retrieve a specific medication by its primary key
export async function getMedicationById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<SavedMedication | null> {
  // get the first returned saved med by id
  const row = await db.getFirstAsync<SavedMedication>(
    `SELECT * FROM Saved_Medications 
        WHERE id = ?`,
    [id]
  );

  // update last_queried_date if it exists
  if (row) {
    await db.runAsync(
      `UPDATE Saved_Medications 
            SET last_queried_date = ? 
            WHERE id = ?`,
      [date(), id]
    );
  }

  // return null if not found
  return row ?? null;
}

// search for medications by drug name
export async function searchMedications(
  db: SQLite.SQLiteDatabase,
  drug_name: string
): Promise<SavedMedication[]> {
  const now = date();

  // queries for all meds that have partial and case-insensitive match with given drug name
  const rows = await db.getAllAsync<SavedMedication>(
    `SELECT * FROM Saved_Medications
        WHERE LOWER(drug_name) LIKE LOWER(?)
        ORDER BY last_saved_date DESC`,
    [`%${drug_name}%`]
  );

  //  updates last_queried_date for all matching rows
  if (rows.length > 0) {
    const ids = rows.map((r) => r.id).join(',');
    await db.runAsync(
      `UPDATE Saved_Medications 
            SET last_queried_date = ? 
            WHERE id IN (${ids})`,
      [now]
    );
  }

  return rows.map((r) => ({ ...r, last_queried_date: now }));
}

// update an existing medication by id
export async function updateMedication(
  db: SQLite.SQLiteDatabase,
  id: number,
  changes: Partial<Omit<SavedMedication, 'id' | 'last_saved_date' | 'last_queried_date'>>
): Promise<SavedMedication | null> {
  const now = date();

  const fields = Object.keys(changes) as (keyof typeof changes)[];
  if (fields.length === 0) return getMedicationById(db, id);

  const setClauses = [...fields.map((f) => `${f} = ?`), 'last_saved_date = ?'].join(', ');
  const values = [...fields.map((f) => changes[f] ?? null), now, id];

  // update the med for only each requested change
  await db.runAsync(
    `UPDATE Saved_Medications SET ${setClauses} WHERE id = ?`,
    values as (string | number | null)[]
  );

  // returns the updated row or null if the id wasn't found
  // also updates last_queried_date
  return getMedicationById(db, id);
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
