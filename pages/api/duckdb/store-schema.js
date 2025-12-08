/**
 * API Route: Store schema in DuckDB
 * POST /api/duckdb/store-schema
 */

const { initDatabase, executeQuery } = require('../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { schema_name, source, schema_json, created_at, field_count } = req.body;

    if (!schema_name || !schema_json) {
      return res.status(400).json({ error: 'Missing required fields: schema_name, schema_json' });
    }

    await initDatabase();

    // Create schemas table if not exists
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS schemas (
        id INTEGER PRIMARY KEY,
        schema_name VARCHAR NOT NULL,
        source VARCHAR,
        schema_json VARCHAR NOT NULL,
        field_count INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert schema
    await executeQuery(`
      INSERT INTO schemas (schema_name, source, schema_json, field_count, created_at)
      VALUES ('${schema_name}', '${source}', '${schema_json.replace(/'/g, "''")}', ${field_count || 0}, '${created_at}')
    `);

    res.status(200).json({
      success: true,
      message: `Schema "${schema_name}" stored successfully`
    });
  } catch (error) {
    console.error('Store schema error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to store schema'
    });
  }
}
