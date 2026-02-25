import * as SQLite from 'expo-sqlite';

import { create_database } from '../savedMedicationsDb';

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
