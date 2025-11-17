const fs = require('fs');
const { parse } = require('csv-parse/sync');
const dotenv = require('dotenv');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const ENV_PATH = path.resolve(__dirname, '.env');
if (!fs.existsSync(ENV_PATH)) {
  throw new Error(`Missing .env file for: ${ENV_PATH}`);
}
dotenv.config({ path: ENV_PATH });

if (!process.env.DATASHEET_PATH) {
  throw new Error('Missing required environment variable DATASHEET_PATH (raw dataset)');
}

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable DATABASE_URL (location for database)');
}

const DATASHEET_PATH = path.resolve(__dirname, process.env.DATASHEET_PATH);
const DATABASE_URL = path.resolve(__dirname, process.env.DATABASE_URL);

async function connectDB() {
  return open({
    filename: DATABASE_URL,
    driver: sqlite3.Database,
  });
}

async function createEmptyDB(db) {
  await db.exec('DROP TABLE IF EXISTS Pharmacy;');
  await db.exec(`
    CREATE TABLE Pharmacy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pharm_id INTEGER,
        npi_id INTEGER,
        name TEXT,
        affiliation_id INTEGER,
        affiliation_name TEXT,
        chain_id INTEGER,
        chain_name TEXT,
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        state TEXT,
        zipcode TEXT,
        phone_no TEXT,
        fax_no TEXT,
        county TEXT,
        latitude REAL,
        longitude REAL
    );
  `);
  console.log('Pharmacy table created.');
}

async function extractData() {
  console.log('Extracting pharmacy data from spreadsheet');
  if (!fs.existsSync(DATASHEET_PATH)) {
    throw new Error(`CSV file not found: ${DATASHEET_PATH}`);
  }

  const csv = fs.readFileSync(DATASHEET_PATH, 'utf8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });
  console.log(`Extracted ${records.length} records`);

  return records;
}

function formatData(records) {
  console.log('Processing data');

  const cleanString = (str) => {
    const trimmed = str?.trim();
    return trimmed === '' ? null : (trimmed ?? null);
  };

  const parseOptionalInt = (value) => {
    const cleaned = cleanString(value);
    if (cleaned === null) return null;
    const parsed = Number.parseInt(cleaned, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const parseOptionalFloat = (value) => {
    const cleaned = cleanString(value);
    if (cleaned === null) return null;
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  };

  return records.map((row) => ({
    pharm_id: parseOptionalInt(row['Pharmacy ID']),
    npi_id: parseOptionalInt(row['Pharmacy NPI ID']),
    name: cleanString(row['Pharmacy Name']),
    affiliation_id: parseOptionalInt(row['Pharmacy Affiliation ID']),
    affiliation_name: cleanString(row['Pharmacy Affiliation Name']),
    chain_id: parseOptionalInt(row['Pharmacy Chain ID']),
    chain_name: cleanString(row['Pharmacy Chain Name']),
    address_line1: cleanString(row['Pharmacy Address Line 1']),
    address_line2: cleanString(row['Pharmacy Address Line 2']),
    city: cleanString(row['Pharmacy City Name']),
    state: cleanString(row['Pharmacy State CD']),
    zipcode: cleanString(row['Pharmacy Zip CD']),
    phone_no: cleanString(row['Pharmacy Phone No']),
    fax_no: cleanString(row['Pharmacy Fax No']),
    county: cleanString(row['Pharmacy County Name']),
    latitude: parseOptionalFloat(row['Pharmacy Latitude']),
    longitude: parseOptionalFloat(row['Pharmacy Longitude']),
  }));
}

async function loadData(db, pharmacies) {
  console.log('Loading data into SQLite DB');
  const insertStmt = await db.prepare(`
        INSERT INTO Pharmacy (
            pharm_id, npi_id, name, affiliation_id, affiliation_name,
            chain_id, chain_name, address_line1, address_line2,
            city, state, zipcode, phone_no, fax_no, county, latitude, longitude
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

  await db.exec('BEGIN TRANSACTION;');
  for (const row of pharmacies) {
    await insertStmt.run([
      row.pharm_id,
      row.npi_id,
      row.name,
      row.affiliation_id,
      row.affiliation_name,
      row.chain_id,
      row.chain_name,
      row.address_line1,
      row.address_line2,
      row.city,
      row.state,
      row.zipcode,
      row.phone_no,
      row.fax_no,
      row.county,
      row.latitude,
      row.longitude,
    ]);
  }
  await db.exec('COMMIT;');
  await insertStmt.finalize();

  console.log(`${pharmacies.length} records inserted`);
}

async function previewData(db, limit = 5) {
  console.log(`\nPreview of top ${limit} rows:`);
  const rows = await db.all(`SELECT * FROM Pharmacy LIMIT ?`, [limit]);
  console.table(rows);
}

async function main() {
  let db;
  try {
    db = await connectDB();

    await createEmptyDB(db);

    const data = await extractData();
    const clean_data = formatData(data);
    await loadData(db, clean_data);

    await previewData(db);

    console.log('Data ingestion complete!');
  } catch (error) {
    console.error('Error occurred: ', error.message);
  } finally {
    if (db) {
      await db.close();
      console.log('Database connection closed.');
    }
  }
}

main().catch((err) => console.error('Data Ingestion Error:', err));
