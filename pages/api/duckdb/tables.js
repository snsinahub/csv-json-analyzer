/**
 * API Route: List all tables in DuckDB
 * GET /api/duckdb/tables
 */

const { listTables } = require('../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tables = await listTables();

    res.status(200).json({
      success: true,
      tables: tables,
      count: tables.length
    });
  } catch (error) {
    console.error('List tables error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to list tables'
    });
  }
}
