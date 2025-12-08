/**
 * API endpoint for DuckDB table operations
 * Supports: create, delete, rename, add-column, insert, update, delete-row
 */

const { 
  createTable, 
  dropTable, 
  renameTable, 
  addColumn,
  insertRow,
  updateRow,
  deleteRow,
  listTables
} = require('../../../lib/duckdb');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { operation, tableName, data } = req.body;

    switch (operation) {
      case 'create':
        // Create new table
        // data: { tableName, columns: [{name, type}] }
        if (!data.tableName || !data.columns) {
          return res.status(400).json({ error: 'Table name and columns required' });
        }
        await createTable(data.tableName, data.columns);
        return res.json({ 
          success: true, 
          message: `Table ${data.tableName} created successfully` 
        });

      case 'delete':
        // Delete table
        // data: { tableName }
        if (!data.tableName) {
          return res.status(400).json({ error: 'Table name required' });
        }
        await dropTable(data.tableName);
        return res.json({ 
          success: true, 
          message: `Table ${data.tableName} deleted successfully` 
        });

      case 'rename':
        // Rename table
        // data: { oldName, newName }
        if (!data.oldName || !data.newName) {
          return res.status(400).json({ error: 'Old and new table names required' });
        }
        await renameTable(data.oldName, data.newName);
        return res.json({ 
          success: true, 
          message: `Table renamed from ${data.oldName} to ${data.newName}` 
        });

      case 'add-column':
        // Add column to table
        // data: { tableName, columnName, columnType, defaultValue }
        if (!data.tableName || !data.columnName || !data.columnType) {
          return res.status(400).json({ error: 'Table name, column name and type required' });
        }
        await addColumn(data.tableName, data.columnName, data.columnType, data.defaultValue);
        return res.json({ 
          success: true, 
          message: `Column ${data.columnName} added to ${data.tableName}` 
        });

      case 'insert':
        // Insert row
        // data: { tableName, row: {col1: val1, col2: val2} }
        if (!data.tableName || !data.row) {
          return res.status(400).json({ error: 'Table name and row data required' });
        }
        await insertRow(data.tableName, data.row);
        return res.json({ 
          success: true, 
          message: 'Row inserted successfully' 
        });

      case 'update':
        // Update row
        // data: { tableName, updates: {col: val}, where: {col: val} }
        if (!data.tableName || !data.updates || !data.where) {
          return res.status(400).json({ error: 'Table name, updates and where clause required' });
        }
        await updateRow(data.tableName, data.updates, data.where);
        return res.json({ 
          success: true, 
          message: 'Row updated successfully' 
        });

      case 'delete-row':
        // Delete row
        // data: { tableName, where: {col: val} }
        if (!data.tableName || !data.where) {
          return res.status(400).json({ error: 'Table name and where clause required' });
        }
        await deleteRow(data.tableName, data.where);
        return res.json({ 
          success: true, 
          message: 'Row deleted successfully' 
        });

      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
  } catch (error) {
    console.error('Table operation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
