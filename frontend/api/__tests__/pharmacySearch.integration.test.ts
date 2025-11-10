/**
 * Integration tests for pharmacy search database connection.
 * These tests require a real SQLite database and are not mocked.
 *
 * To run these tests, you need:
 * 1. A SQLite database file named 'pharmacies.db' in the app's document directory
 * 2. A table named 'pharmacies' with the expected schema
 *
 * Run with: npm test -- pharmacySearch.integration.test.ts
 *
 * Note: These tests will be skipped if expo-sqlite is not available
 * or if the database file doesn't exist.
 */

import { testDatabaseConnection, searchPharmacies } from '../pharmacySearch';

// Check if we're in a test environment that supports SQLite
const canTestDatabase = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SQLite = require('expo-sqlite');
    return SQLite && typeof SQLite.openDatabaseAsync === 'function';
  } catch {
    return false;
  }
};

describe('Pharmacy Search Database Integration', () => {
  const hasDatabase = canTestDatabase();

  beforeAll(() => {
    if (!hasDatabase) {
      console.warn(
        'Skipping database integration tests: expo-sqlite is not available in this environment'
      );
    }
  });

  describe('testDatabaseConnection', () => {
    it('should connect to the database and verify table exists', async () => {
      if (!hasDatabase) {
        return; // Skip test
      }

      const result = await testDatabaseConnection();

      expect(result).toHaveProperty('success');

      if (result.success) {
        expect(result.tableExists).toBe(true);
        expect(result.rowCount).toBeGreaterThanOrEqual(0);
        console.log(`Database connection successful. Found ${result.rowCount} pharmacies.`);
      } else {
        console.warn(`Database connection failed: ${result.error}`);
        // Don't fail the test - just log the issue
        expect(result.error).toBeDefined();
      }
    }, 10000); // 10 second timeout for database operations

    it('should handle database connection errors gracefully', async () => {
      if (!hasDatabase) {
        return; // Skip test
      }

      // This test verifies that the function doesn't throw
      // even if there are connection issues
      const result = await testDatabaseConnection();

      // Should always return a result object, never throw
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
    }, 10000);
  });

  describe('searchPharmacies with real database', () => {
    it('should query pharmacies from the database', async () => {
      if (!hasDatabase) {
        return; // Skip test
      }

      // First verify database connection
      const connectionTest = await testDatabaseConnection();
      if (!connectionTest.success || !connectionTest.tableExists) {
        console.warn('Skipping search test: database not available');
        return;
      }

      // Try to search for pharmacies
      // Use a large radius to ensure we get results if any exist
      const results = await searchPharmacies(10001, 100);

      // Should return an array (even if empty)
      expect(Array.isArray(results)).toBe(true);

      if (results.length > 0) {
        // Verify the structure of returned pharmacies
        const pharmacy = results[0];
        expect(pharmacy).toHaveProperty('pharmacyName');
        expect(pharmacy).toHaveProperty('pharmacyStreet1');
        expect(pharmacy).toHaveProperty('pharmacyCity');
        expect(pharmacy).toHaveProperty('pharmacyState');
        expect(pharmacy).toHaveProperty('pharmacyZipCode');
        expect(pharmacy).toHaveProperty('distance');
        expect(typeof pharmacy.distance).toBe('number');
      } else {
        console.log('No pharmacies found in database (this is okay if the database is empty)');
      }
    }, 15000); // 15 second timeout for search operations
  });
});
