import * as SQLite from 'expo-sqlite';

import { create_database } from '../savedMedicationsDb';
import {
  saveMedication,
  getAllMedications,
  getMedicationByID,
  searchMedications,
  deleteMedication,
  deleteAllMedications,
} from '../savedMedicationsCRUD';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('create_database', () => {
  const mockExecAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue({
      execAsync: mockExecAsync,
    });
  });

  it('opens the database and creates the Saved_Medications table', async () => {
    const db = await create_database();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('saved_data.db');
    expect(mockExecAsync).toHaveBeenCalledTimes(1);

    const sql = mockExecAsync.mock.calls[0][0] as string;
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS Saved_Medications');
    expect(sql).toContain('drug_name TEXT NOT NULL');

    expect(db).toBeDefined();
  });

  it('propagates errors from SQLite', async () => {
    (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValueOnce(new Error('DB failed'));

    await expect(create_database()).rejects.toThrow('DB failed');
  });
});

// reusable mock db factory so each test gets a clean copy
function makeMockDb(overrides?: Partial<Record<string, jest.Mock>>) {
  return {
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    ...overrides,
  };
}

// test saveMedication function
describe('saveMedication', () => {
  it('inserts a medication and returns it with id and last_saved_date', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    });

    const input = { drug_name: 'Ibuprofen', form: 'tablet', strength: '200mg', quantity: 30 };
    const result = await saveMedication(db as any, input);

    expect(db.runAsync).toHaveBeenCalledTimes(1);
    const sql = db.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('INSERT INTO Saved_Medications');

    expect(result.id).toBe(1);
    expect(result.drug_name).toBe('Ibuprofen');
    expect(result.last_saved_date).toBeDefined();
  });

  it('inserts with only required field drug_name, nulls the rest', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 2, changes: 1 }),
    });

    const result = await saveMedication(db as any, { drug_name: 'Aspirin' });

    const values = db.runAsync.mock.calls[0][1] as any[];
    expect(values[0]).toBe('Aspirin'); // drug_name
    expect(values[1]).toBeNull(); // pharmacy_npi
    expect(values[2]).toBeNull(); // form
    expect(values[3]).toBeNull(); // strength
    expect(values[4]).toBeNull(); // quantity
    expect(result.id).toBe(2);
  });
});

// test getAllMedications function
describe('getAllMedications', () => {
  it('returns all rows from Saved_Medications', async () => {
    const mockRows = [
      { id: 1, drug_name: 'Ibuprofen', last_saved_date: '2026-02-01T00:00:00.000Z' },
      { id: 2, drug_name: 'Aspirin', last_saved_date: '2026-02-02T00:00:00.000Z' },
    ];
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue(mockRows) });
    const result = await getAllMedications(db as any);

    expect(db.getAllAsync).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0].drug_name).toBe('Ibuprofen');
  });

  it('returns an empty array when no medications are saved', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([]) });
    const result = await getAllMedications(db as any);
    expect(result).toEqual([]);
  });
});

// test getMedicationByID function
describe('getMedicationByID', () => {
  it('returns the medication when found', async () => {
    const mockRow = { id: 1, drug_name: 'Ibuprofen', last_saved_date: '2024-01-01T00:00:00.000Z' };
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(mockRow) });
    const result = await getMedicationByID(db as any, 1);

    expect(db.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), [1]);
    expect(result).toEqual(mockRow);
  });

  it('returns null when the id does not exist', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    const result = await getMedicationByID(db as any, 999);
    expect(result).toBeNull();
  });
});

// test searchMedications function
describe('searchMedications', () => {
  it('returns matching medications for a partial name', async () => {
    const mockRows = [{ id: 1, drug_name: 'Ibuprofen' }];
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue(mockRows) });

    const result = await searchMedications(db as any, 'ibu');

    const values = db.getAllAsync.mock.calls[0][1] as any[];
    expect(values[0]).toBe('%ibu%');
    expect(result).toHaveLength(1);
    expect(result[0].drug_name).toBe('Ibuprofen');
  });

  it('returns an empty array when no medications match', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([]) });
    const result = await searchMedications(db as any, 'xyz');
    expect(result).toEqual([]);
  });
});

// test deleteMedication function
describe('deleteMedication', () => {
  it('returns true when the medication is deleted', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    });

    const result = await deleteMedication(db as any, 1);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM Saved_Medications WHERE id = ?'),
      [1]
    );
    expect(result).toBe(true);
  });

  it('returns false when the id does not exist', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
    });

    const result = await deleteMedication(db as any, 999);
    expect(result).toBe(false);
  });
});

// test deleteAllMedications function
describe('deleteAllMedications', () => {
  it('deletes all medications and returns the count', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 5 }),
    });

    const result = await deleteAllMedications(db as any);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM Saved_Medications')
    );
    expect(result).toBe(5);
  });

  it('returns 0 when the table is already empty', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
    });

    const result = await deleteAllMedications(db as any);
    expect(result).toBe(0);
  });
});
