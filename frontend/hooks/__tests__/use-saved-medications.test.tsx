import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';

import { SavedMedication } from '@/api/types';
import { useSavedMedications } from '../use-saved-medications';
import { create_database } from '@/api/savedMedicationsDb';

jest.mock('@/api/savedMedicationsDb', () => ({
  create_database: jest.fn(),
}));

describe('useSavedMedications hook', () => {
  let mockDb: {
    getAllAsync: jest.Mock;
    runAsync: jest.Mock;
  };

  let latestHook: ReturnType<typeof useSavedMedications> | undefined;

  function TestComponent() {
    latestHook = useSavedMedications();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      getAllAsync: jest.fn().mockResolvedValue([]),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    };

    (create_database as jest.Mock).mockResolvedValue(mockDb);
    latestHook = undefined;
  });

  it('initializes the database and loads medications', async () => {
    const rows: SavedMedication[] = [
      {
        id: 1,
        drug_name: 'Test Drug',
        quantity: 10,
      },
    ];

    mockDb.getAllAsync.mockResolvedValueOnce(rows);

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.loading).toBe(false);
      expect(latestHook?.medications).toEqual(rows);
      expect(latestHook?.error).toBeNull();
    });

    expect(create_database).toHaveBeenCalled();
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM Saved_Medications ORDER BY last_saved_date DESC'
    );
  });

  it('handles errors during initialization', async () => {
    (create_database as jest.Mock).mockRejectedValueOnce(new Error('init failed'));

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.error).toBe('init failed');
    });
  });

  it('handles errors when loading medications', async () => {
    mockDb.getAllAsync.mockRejectedValueOnce(new Error('load failed'));

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.loading).toBe(false);
      expect(latestHook?.error).toBe('load failed');
      expect(latestHook?.medications).toEqual([]);
    });
  });

  it('saves a medication and reloads the list', async () => {
    const initialRows: SavedMedication[] = [];
    const savedRows: SavedMedication[] = [
      {
        id: 1,
        drug_name: 'Saved Drug',
        quantity: 5,
      },
    ];

    mockDb.getAllAsync
      .mockResolvedValueOnce(initialRows) // initial load
      .mockResolvedValueOnce(savedRows); // after save

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.loading).toBe(false);
    });

    const callsBeforeSave = mockDb.getAllAsync.mock.calls.length;
    await act(async () => {
      await latestHook?.saveMedication({
        drug_name: 'Saved Drug',
        quantity: 5,
      });
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Saved_Medications'),
      ['Saved Drug', null, null, null, 5, expect.any(String)]
    );

    await waitFor(() => {
      expect(mockDb.getAllAsync.mock.calls.length).toBeGreaterThan(callsBeforeSave);
      expect(latestHook?.medications).toEqual(savedRows);
      expect(latestHook?.error).toBeNull();
    });
  });

  it('deletes a medication and reloads the list', async () => {
    const initialRows: SavedMedication[] = [
      {
        id: 1,
        drug_name: 'Existing Drug',
        quantity: 1,
      },
    ];

    const afterDeleteRows: SavedMedication[] = [];

    mockDb.getAllAsync
      .mockResolvedValueOnce(initialRows) // initial load
      .mockResolvedValueOnce(afterDeleteRows); // after delete

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.loading).toBe(false);
      expect(latestHook?.medications).toEqual(initialRows);
    });

    const callsBeforeDelete = mockDb.getAllAsync.mock.calls.length;
    await act(async () => {
      await latestHook?.deleteMedication(1);
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM Saved_Medications WHERE id = ?', [1]);

    await waitFor(() => {
      expect(mockDb.getAllAsync.mock.calls.length).toBeGreaterThan(callsBeforeDelete);
      expect(latestHook?.medications).toEqual(afterDeleteRows);
    });
  });
});
