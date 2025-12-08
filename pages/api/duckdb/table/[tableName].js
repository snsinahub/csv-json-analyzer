/**
 * API Route: Get table details (schema, preview, stats)
 * GET /api/duckdb/table/[tableName]
 */

const { getTableSchema, getTablePreview, getTableStats } = require('../../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tableName, action = 'preview', limit = 100 } = req.query;

    if (!tableName) {
      return res.status(400).json({ error: 'Missing table name' });
    }

    let result;

    switch (action) {
      case 'schema':
        result = await getTableSchema(tableName);
        break;
      
      case 'preview':
        result = await getTablePreview(tableName, parseInt(limit));
        break;
      
      case 'stats':
        result = await getTableStats(tableName);
        break;
      
      default:
        return res.status(400).json({ 
          error: 'Invalid action. Use: schema, preview, or stats' 
        });
    }

    res.status(200).json({
      success: true,
      tableName,
      action,
      data: result
    });
  } catch (error) {
    console.error('Table operation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Operation failed'
    });
  }
}
