import { act, render, waitFor } from '@testing-library/react-native';

import { create_database } from '@/api/savedDB';
import { SavedPharmacy } from '@/api/types';
import { useSavedPharmacies } from '../use-saved-pharmacies';

jest.mock('@/api/savedPharmaciesDb', () => ({
  create_database: jest.fn(),
}));

describe('useSavedPharmacies hook', () => {
  let mockDb: {
    getAllAsync: jest.Mock;
    runAsync: jest.Mock;
  };

  let latestHook: ReturnType<typeof useSavedPharmacies> | undefined;

  function TestComponent() {
    latestHook = useSavedPharmacies();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      getAllAsync: jest.fn().mockResolvedValue([]),
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    };

    (create_database as jest.Mock).mockResolvedValue(mockDb);
    latestHook = undefined;
  });

  it('initializes the database and loads pharmacies', async () => {
    const rows: SavedPharmacy[] = [
      { npi: '1111111111', name: 'CVS Pharmacy', address: '123 Sycamore St' },
    ];

    mockDb.getAllAsync.mockResolvedValueOnce(rows);

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.loading).toBe(false);
      expect(latestHook?.pharmacies).toEqual(rows);
      expect(latestHook?.error).toBeNull();
    });

    expect(create_database).toHaveBeenCalled();
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM Saved_Pharmacies ORDER BY pharmacy_name ASC'
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

  it('handles errors when loading pharmacies', async () => {
    mockDb.getAllAsync.mockRejectedValueOnce(new Error('load failed'));

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.loading).toBe(false);
      expect(latestHook?.error).toBe('load failed');
      expect(latestHook?.pharmacies).toEqual([]);
    });
  });

  it('saves a pharmacy and reloads the list', async () => {
    const initialRows: SavedPharmacy[] = [];
    const savedRows: SavedPharmacy[] = [
      { npi: '1111111111', name: 'CVS Pharmacy', address: '123 Sycamore St' },
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
      await latestHook?.savePharmacy({
        npi: '1111111111',
        name: 'CVS Pharmacy',
        address: '123 Sycamore St',
      });
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO Saved_Pharmacies'),
      expect.any(Array)
    );

    await waitFor(() => {
      expect(mockDb.getAllAsync.mock.calls.length).toBeGreaterThan(callsBeforeSave);
      expect(latestHook?.pharmacies).toEqual(savedRows);
      expect(latestHook?.error).toBeNull();
    });
  });

  it('deletes a pharmacy and reloads the list', async () => {
    const initialRows: SavedPharmacy[] = [
      { npi: '1111111111', name: 'CVS Pharmacy', address: '123 Sycamore St' },
    ];
    const afterDeleteRows: SavedPharmacy[] = [];

    mockDb.getAllAsync
      .mockResolvedValueOnce(initialRows) // initial load
      .mockResolvedValueOnce(afterDeleteRows); // after delete

    render(<TestComponent />);

    await waitFor(() => {
      expect(latestHook).toBeDefined();
      expect(latestHook?.loading).toBe(false);
      expect(latestHook?.pharmacies).toEqual(initialRows);
    });

    const callsBeforeDelete = mockDb.getAllAsync.mock.calls.length;
    await act(async () => {
      await latestHook?.deletePharmacy('1111111111');
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM Saved_Pharmacies WHERE npi = ?', [
      '1111111111',
    ]);

    await waitFor(() => {
      expect(mockDb.getAllAsync.mock.calls.length).toBeGreaterThan(callsBeforeDelete);
      expect(latestHook?.pharmacies).toEqual(afterDeleteRows);
    });
  });
});
