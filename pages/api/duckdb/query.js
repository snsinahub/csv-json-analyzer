/**
 * API Route: Execute SQL query on DuckDB
 * POST /api/duckdb/query
 */

const { executeQuery } = require('../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing required field: query' });
    }

    // Basic SQL injection protection - only allow SELECT queries
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return res.status(400).json({ 
        error: 'Only SELECT queries are allowed for security reasons' 
      });
    }

    const result = await executeQuery(query);

    res.status(200).json({
      success: true,
      data: result,
      rowCount: result.length
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Query execution failed'
    });
  }
}
