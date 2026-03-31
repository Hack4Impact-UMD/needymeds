import * as SQLite from 'expo-sqlite';

import { create_database } from '../savedDB';
import {
  deleteAllPharmacies,
  deletePharmacy,
  getAllPharmacies,
  getPharmacyByID,
  savePharmacy,
  searchPharmacies,
} from '../savedPharmaciesCRUD';

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

  it('opens the database and creates the Saved_Pharmacies table', async () => {
    const db = await create_database();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('saved_data.db');
    expect(mockExecAsync).toHaveBeenCalledTimes(1);

    const sql = mockExecAsync.mock.calls[0][0] as string;
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS Saved_Pharmacies');
    expect(sql).toContain('npi TEXT PRIMARY KEY');

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

// test savePharmacy function
describe('savePharmacy', () => {
  it('inserts a pharmacy and returns it', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    });

    const input = { npi: '1234567890', name: 'CVS Pharmacy', address: '123 Sycamore St' };
    const result = await savePharmacy(db as any, input);

    expect(db.runAsync).toHaveBeenCalledTimes(1);
    const sql = db.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('INSERT or REPLACE INTO Saved_Pharmacies');

    expect(result.npi).toBe('1234567890');
    expect(result.name).toBe('CVS Pharmacy');
    expect(result.address).toBe('123 Sycamore St');
  });
});

// test getAllPharmacies function
describe('getAllPharmacies', () => {
  it('returns all rows from Saved_Pharmacies', async () => {
    const mockRows = [
      { npi: '1111111111', name: 'CVS Pharmacy', address: '123 Sycamore St' },
      { npi: '2222222222', name: 'Walgreens', address: '456 Oak Ave' },
    ];
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue(mockRows) });
    const result = await getAllPharmacies(db as any);

    expect(db.getAllAsync).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('CVS Pharmacy');
  });

  it('returns an empty array when no pharmacies are saved', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([]) });
    const result = await getAllPharmacies(db as any);
    expect(result).toEqual([]);
  });
});

// test getPharmacyByID function
describe('getPharmacyByID', () => {
  it('returns the pharmacy when found', async () => {
    const mockRow = { npi: '1111111111', name: 'CVS Pharmacy', address: '123 Sycamore St' };
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(mockRow) });
    const result = await getPharmacyByID(db as any, '1111111111');

    expect(db.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE npi = ?'), [
      '1111111111',
    ]);
    expect(result).toEqual(mockRow);
  });

  it('returns null when the npi does not exist', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    const result = await getPharmacyByID(db as any, '9999999999');
    expect(result).toBeNull();
  });
});

// test searchPharmacies function
describe('searchPharmacies', () => {
  it('returns matching pharmacies for a partial name', async () => {
    const mockRows = [{ npi: '1111111111', name: 'CVS Pharmacy', address: '123 Sycamore St' }];
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue(mockRows) });

    const result = await searchPharmacies(db as any, 'cvs');

    const values = db.getAllAsync.mock.calls[0][1] as any[];
    expect(values[0]).toBe('%cvs%');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('CVS Pharmacy');
  });

  it('returns an empty array when no pharmacies match', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([]) });
    const result = await searchPharmacies(db as any, 'xyz');
    expect(result).toEqual([]);
  });
});

// test deletePharmacy function
describe('deletePharmacy', () => {
  it('returns true when the pharmacy is deleted', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    });

    const result = await deletePharmacy(db as any, '1111111111');

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM Saved_Pharmacies WHERE npi = ?'),
      ['1111111111']
    );
    expect(result).toBe(true);
  });

  it('returns false when the npi does not exist', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
    });

    const result = await deletePharmacy(db as any, '9999999999');
    expect(result).toBe(false);
  });
});

// test deleteAllPharmacies function
describe('deleteAllPharmacies', () => {
  it('deletes all pharmacies and returns the count', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 3 }),
    });

    const result = await deleteAllPharmacies(db as any);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM Saved_Pharmacies')
    );
    expect(result).toBe(3);
  });

  it('returns 0 when the table is already empty', async () => {
    const db = makeMockDb({
      runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
    });

    const result = await deleteAllPharmacies(db as any);
    expect(result).toBe(0);
  });
});
