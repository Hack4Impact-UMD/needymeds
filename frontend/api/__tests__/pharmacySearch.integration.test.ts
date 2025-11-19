import fs from 'fs';
import path from 'path';
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const canTestDatabase = () => {
  try {
    const dbPath = path.resolve(__dirname, '../../pharmacy-database/pharmacy.db');
    return fs.existsSync(dbPath);
  } catch {
    return false;
  }
};

async function testDatabaseFile(): Promise<{
  success: boolean;
  error?: string;
  tableExists?: boolean;
  rowCount?: number;
}> {
  try {
    const dbPath = path.resolve(__dirname, '../../pharmacy-database/pharmacy.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    try {
      const result = await db.get('SELECT COUNT(*) as count FROM Pharmacy');
      const count = result?.count ?? 0;

      await db.close();

      return {
        success: true,
        tableExists: true,
        rowCount: count,
      };
    } catch (queryError: any) {
      await db.close();

      if (
        queryError?.message?.includes('no such table') ||
        queryError?.message?.includes('SQLITE_ERROR')
      ) {
        return {
          success: false,
          error: 'Table "Pharmacy" does not exist',
          tableExists: false,
        };
      }

      return {
        success: false,
        error: `Query error: ${queryError?.message || 'Unknown error'}`,
        tableExists: false,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Database connection failed: ${err?.message || 'Unknown error'}`,
      tableExists: false,
    };
  }
}

describe('Pharmacy Search Database Integration', () => {
  const hasDatabase = canTestDatabase();

  beforeAll(() => {
    if (!hasDatabase) {
      console.warn(
        'Skipping database integration tests: pharmacy.db file not found at pharmacy-database/pharmacy.db'
      );
    }
  });

  describe('testDatabaseFile', () => {
    it('should connect to the database file and verify table exists', async () => {
      if (!hasDatabase) {
        console.log('Skipping: Database file not found');
        return;
      }

      const result = await testDatabaseFile();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result.tableExists).toBe(true);
      expect(result.rowCount).toBeGreaterThanOrEqual(0);
      console.log(`✅ Database connection successful. Found ${result.rowCount} pharmacies.`);
    }, 10000);

    it('should verify database schema matches expected structure', async () => {
      if (!hasDatabase) {
        return;
      }

      const dbPath = path.resolve(__dirname, '../../pharmacy-database/pharmacy.db');
      const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      try {
        // Check that all expected columns exist
        const tableInfo = await db.all('PRAGMA table_info(Pharmacy)');
        const columns = tableInfo.map((row: any) => row.name);

        expect(columns).toContain('name');
        expect(columns).toContain('address_line1');
        expect(columns).toContain('address_line2');
        expect(columns).toContain('city');
        expect(columns).toContain('state');
        expect(columns).toContain('latitude');
        expect(columns).toContain('longitude');

        // Verify can query a sample row
        const sample = await db.get(
          'SELECT name, address_line1, city, state, latitude, longitude FROM Pharmacy LIMIT 1'
        );
        expect(sample).toBeDefined();
        if (sample) {
          expect(sample).toHaveProperty('name');
          expect(sample).toHaveProperty('address_line1');
          expect(sample).toHaveProperty('city');
          expect(sample).toHaveProperty('state');
        }

        await db.close();
        console.log('✅ Database schema verification successful');
      } catch (err) {
        await db.close();
        throw err;
      }
    }, 10000);
  });

  describe('database data validation', () => {
    it('should verify database has data and correct data types', async () => {
      if (!hasDatabase) {
        return;
      }

      const dbPath = path.resolve(__dirname, '../../pharmacy-database/pharmacy.db');
      const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      try {
        // Check row count
        const countResult = await db.get('SELECT COUNT(*) as count FROM Pharmacy');
        const count = countResult?.count ?? 0;
        expect(count).toBeGreaterThan(0);
        console.log(`✅ Database contains ${count} pharmacy records`);

        // Verify data types and non-null required fields
        const sample = await db.get(`
          SELECT name, address_line1, city, state, latitude, longitude 
          FROM Pharmacy 
          WHERE name IS NOT NULL 
            AND city IS NOT NULL 
            AND state IS NOT NULL
          LIMIT 1
        `);

        expect(sample).toBeDefined();
        if (sample) {
          expect(typeof sample.name).toBe('string');
          expect(sample.name.length).toBeGreaterThan(0);
          expect(typeof sample.city).toBe('string');
          expect(typeof sample.state).toBe('string');

          // Check if coordinates exist (they should for most records)
          if (sample.latitude !== null && sample.longitude !== null) {
            expect(typeof sample.latitude).toBe('number');
            expect(typeof sample.longitude).toBe('number');
            expect(sample.latitude).toBeGreaterThanOrEqual(-90);
            expect(sample.latitude).toBeLessThanOrEqual(90);
            expect(sample.longitude).toBeGreaterThanOrEqual(-180);
            expect(sample.longitude).toBeLessThanOrEqual(180);
          }
        }

        await db.close();
      } catch (err) {
        await db.close();
        throw err;
      }
    }, 10000);
  });
});
