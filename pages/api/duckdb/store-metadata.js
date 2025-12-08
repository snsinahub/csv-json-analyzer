/**
 * API Route: Store file metadata in DuckDB
 * POST /api/duckdb/store-metadata
 */

const { initDatabase, executeQuery } = require('../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, file_type, file_size, row_count, column_count, upload_source, columns_json, created_at } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Missing required field: filename' });
    }

    await initDatabase();

    // Create file_metadata table if not exists (different from the built-in one)
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS file_upload_history (
        id INTEGER PRIMARY KEY,
        filename VARCHAR NOT NULL,
        file_type VARCHAR,
        file_size INTEGER,
        row_count INTEGER,
        column_count INTEGER,
        upload_source VARCHAR,
        columns_json VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert metadata
    const escapedColumns = columns_json ? `'${columns_json.replace(/'/g, "''")}'` : 'NULL';

    await executeQuery(`
      INSERT INTO file_upload_history (filename, file_type, file_size, row_count, column_count, upload_source, columns_json, created_at)
      VALUES ('${filename.replace(/'/g, "''")}', '${file_type}', ${file_size || 0}, ${row_count || 0}, ${column_count || 0}, '${upload_source}', ${escapedColumns}, '${created_at}')
    `);

    res.status(200).json({
      success: true,
      message: `Metadata for "${filename}" stored successfully`
    });
  } catch (error) {
    console.error('Store metadata error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to store metadata'
    });
  }
}
