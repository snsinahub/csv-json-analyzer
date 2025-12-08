/**
 * API Route: Store analysis log in DuckDB
 * POST /api/duckdb/store-log
 */

const { initDatabase, executeQuery } = require('../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { log_type, page, filename, row_count, column_count, file_size, processing_time, status, error_message, metadata, created_at } = req.body;

    await initDatabase();

    // Create analysis_logs table if not exists
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS analysis_logs (
        id INTEGER PRIMARY KEY,
        log_type VARCHAR,
        page VARCHAR,
        filename VARCHAR,
        row_count INTEGER,
        column_count INTEGER,
        file_size INTEGER,
        processing_time DOUBLE,
        status VARCHAR,
        error_message VARCHAR,
        metadata VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert log
    const escapedFilename = filename ? `'${filename.replace(/'/g, "''")}'` : 'NULL';
    const escapedError = error_message ? `'${error_message.replace(/'/g, "''")}'` : 'NULL';
    const escapedMetadata = metadata ? `'${metadata.replace(/'/g, "''")}'` : 'NULL';

    await executeQuery(`
      INSERT INTO analysis_logs (log_type, page, filename, row_count, column_count, file_size, processing_time, status, error_message, metadata, created_at)
      VALUES ('${log_type}', '${page}', ${escapedFilename}, ${row_count || 0}, ${column_count || 0}, ${file_size || 0}, ${processing_time || 0}, '${status}', ${escapedError}, ${escapedMetadata}, '${created_at}')
    `);

    res.status(200).json({
      success: true,
      message: 'Log stored successfully'
    });
  } catch (error) {
    console.error('Store log error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to store log'
    });
  }
}
