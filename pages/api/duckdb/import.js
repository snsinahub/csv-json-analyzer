/**
 * API Route: Import data to DuckDB
 * POST /api/duckdb/import
 */

const { importCSV, importJSON } = require('../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, tableName, fileType } = req.body;

    if (!data || !tableName) {
      return res.status(400).json({ error: 'Missing required fields: data, tableName' });
    }

    let result;

    if (fileType === 'csv') {
      // For CSV, data should be CSV string
      result = await importCSV(data, tableName);
    } else if (fileType === 'json') {
      // For JSON, data should be array or object
      result = await importJSON(data, tableName);
    } else {
      return res.status(400).json({ error: 'Invalid file type. Must be csv or json' });
    }

    res.status(200).json({
      success: true,
      message: `Data imported successfully to table: ${result.tableName}`,
      stats: result
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to import data'
    });
  }
}
