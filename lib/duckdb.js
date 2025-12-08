/**
 * DuckDB Utility Library
 * Provides embedded database functionality for storing and querying CSV/JSON data
 */

const duckdb = require('duckdb');
const path = require('path');
const fs = require('fs');

// Database instance
let db = null;
let connection = null;

/**
 * Initialize DuckDB database
 * @param {string} dbPath - Path to database file (optional, defaults to in-memory)
 * @returns {Promise<void>}
 */
async function initDatabase(dbPath = ':memory:') {
  return new Promise((resolve, reject) => {
    if (db && connection) {
      resolve();
      return;
    }

    // Create data directory if using persistent storage
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    db = new duckdb.Database(dbPath, (err) => {
      if (err) {
        reject(new Error(`Failed to initialize DuckDB: ${err.message}`));
        return;
      }

      connection = db.connect();
      
      // Create metadata table to track uploaded files
      connection.run(`
        CREATE TABLE IF NOT EXISTS file_metadata (
          id INTEGER PRIMARY KEY,
          filename TEXT NOT NULL,
          table_name TEXT NOT NULL UNIQUE,
          file_type TEXT NOT NULL,
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          row_count INTEGER,
          column_count INTEGER,
          file_size INTEGER,
          schema_json TEXT
        )
      `, (err) => {
        if (err) {
          reject(new Error(`Failed to create metadata table: ${err.message}`));
          return;
        }
        resolve();
      });
    });
  });
}

/**
 * Import CSV data into DuckDB
 * @param {string} csvData - CSV content as string
 * @param {string} tableName - Name for the table
 * @param {Object} options - Import options
 * @returns {Promise<Object>}
 */
async function importCSV(csvData, tableName, options = {}) {
  await initDatabase();

  return new Promise((resolve, reject) => {
    const sanitizedTableName = sanitizeTableName(tableName);
    
    // Create temp file for CSV content
    const tempPath = path.join('/tmp', `temp_csv_${Date.now()}.csv`);
    
    try {
      fs.writeFileSync(tempPath, csvData);
      
      const query = `
        CREATE OR REPLACE TABLE ${sanitizedTableName} AS 
        SELECT * FROM read_csv_auto('${tempPath}', 
          header=true,
          auto_detect=true
        )
      `;

      connection.run(query, (err) => {
        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        
        if (err) {
          reject(new Error(`Failed to import CSV: ${err.message}`));
          return;
        }

        // Get table statistics
        connection.all(`
          SELECT COUNT(*) as row_count FROM ${sanitizedTableName}
        `, (err, countResult) => {
          if (err) {
            reject(err);
            return;
          }

          connection.all(`
            SELECT COUNT(*) as column_count 
            FROM information_schema.columns 
            WHERE table_name = '${sanitizedTableName}'
          `, (err, colResult) => {
            if (err) {
              reject(err);
              return;
            }

            const stats = {
              tableName: sanitizedTableName,
              rowCount: Number(countResult[0].row_count),
              columnCount: Number(colResult[0].column_count)
            };

            resolve(stats);
          });
        });
      });
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      reject(new Error(`Failed to import CSV: ${error.message}`));
    }
  });
}

/**
 * Import JSON data into DuckDB
 * @param {Array|Object} jsonData - JSON data to import
 * @param {string} tableName - Name for the table
 * @returns {Promise<Object>}
 */
async function importJSON(jsonData, tableName) {
  await initDatabase();

  return new Promise((resolve, reject) => {
    const sanitizedTableName = sanitizeTableName(tableName);
    
    // Create temp file for JSON data
    const tempPath = path.join('/tmp', `temp_${Date.now()}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(jsonData));

    const query = `
      CREATE OR REPLACE TABLE ${sanitizedTableName} AS 
      SELECT * FROM read_json_auto('${tempPath}')
    `;

    connection.run(query, (err) => {
      if (err) {
        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        reject(new Error(`Failed to import JSON: ${err.message}`));
        return;
      }

      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      // Get table statistics
      connection.all(`
        SELECT COUNT(*) as row_count FROM ${sanitizedTableName}
      `, (err, countResult) => {
        if (err) {
          reject(err);
          return;
        }

        connection.all(`
          SELECT COUNT(*) as column_count 
          FROM information_schema.columns 
          WHERE table_name = '${sanitizedTableName}'
        `, (err, colResult) => {
          if (err) {
            reject(err);
            return;
          }

          const stats = {
            tableName: sanitizedTableName,
            rowCount: Number(countResult[0].row_count),
            columnCount: Number(colResult[0].column_count)
          };

          resolve(stats);
        });
      });
    });
  });
}

/**
 * Convert BigInt values to regular numbers in result set
 * @param {Array} data - Query result data
 * @returns {Array}
 */
function convertBigIntToNumber(data) {
  if (!Array.isArray(data)) return data;
  
  return data.map(row => {
    const converted = {};
    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        converted[key] = typeof row[key] === 'bigint' ? Number(row[key]) : row[key];
      }
    }
    return converted;
  });
}

/**
 * Execute SQL query
 * @param {string} query - SQL query to execute
 * @returns {Promise<Array>}
 */
async function executeQuery(query) {
  await initDatabase();

  return new Promise((resolve, reject) => {
    connection.all(query, (err, result) => {
      if (err) {
        reject(new Error(`Query failed: ${err.message}`));
        return;
      }
      // Convert BigInt values to numbers for JSON serialization
      resolve(convertBigIntToNumber(result));
    });
  });
}

/**
 * Get table schema
 * @param {string} tableName - Name of the table
 * @returns {Promise<Array>}
 */
async function getTableSchema(tableName) {
  const sanitizedTableName = sanitizeTableName(tableName);
  
  return executeQuery(`
    SELECT 
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_name = '${sanitizedTableName}'
    ORDER BY ordinal_position
  `);
}

/**
 * List all tables
 * @returns {Promise<Array>}
 */
async function listTables() {
  return executeQuery(`
    SELECT 
      table_name,
      table_type
    FROM information_schema.tables
    WHERE table_schema = 'main'
    AND table_name != 'file_metadata'
    ORDER BY table_name
  `);
}

/**
 * Get table preview
 * @param {string} tableName - Name of the table
 * @param {number} limit - Number of rows to return
 * @returns {Promise<Array>}
 */
async function getTablePreview(tableName, limit = 100) {
  const sanitizedTableName = sanitizeTableName(tableName);
  return executeQuery(`SELECT * FROM ${sanitizedTableName} LIMIT ${limit}`);
}

/**
 * Search across table
 * @param {string} tableName - Name of the table
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>}
 */
async function searchTable(tableName, searchTerm) {
  const sanitizedTableName = sanitizeTableName(tableName);
  const schema = await getTableSchema(tableName);
  
  // Build WHERE clause to search across all text columns
  const textColumns = schema
    .filter(col => col.data_type === 'VARCHAR')
    .map(col => `CAST(${col.column_name} AS VARCHAR) LIKE '%${searchTerm}%'`);

  if (textColumns.length === 0) {
    return [];
  }

  const whereClause = textColumns.join(' OR ');
  return executeQuery(`
    SELECT * FROM ${sanitizedTableName}
    WHERE ${whereClause}
    LIMIT 1000
  `);
}

/**
 * Export table to CSV
 * @param {string} tableName - Name of the table
 * @param {string} outputPath - Output file path
 * @returns {Promise<void>}
 */
async function exportToCSV(tableName, outputPath) {
  const sanitizedTableName = sanitizeTableName(tableName);
  
  return new Promise((resolve, reject) => {
    connection.run(`
      COPY ${sanitizedTableName} TO '${outputPath}' (HEADER, DELIMITER ',')
    `, (err) => {
      if (err) {
        reject(new Error(`Failed to export to CSV: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Export table to JSON
 * @param {string} tableName - Name of the table
 * @returns {Promise<Array>}
 */
async function exportToJSON(tableName) {
  const sanitizedTableName = sanitizeTableName(tableName);
  return executeQuery(`SELECT * FROM ${sanitizedTableName}`);
}

/**
 * Drop table
 * @param {string} tableName - Name of the table to drop
 * @returns {Promise<void>}
 */
async function dropTable(tableName) {
  const sanitizedTableName = sanitizeTableName(tableName);
  
  return new Promise((resolve, reject) => {
    connection.run(`DROP TABLE IF EXISTS ${sanitizedTableName}`, (err) => {
      if (err) {
        reject(new Error(`Failed to drop table: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Create a new empty table with specified schema
 * @param {string} tableName - Name of the table to create
 * @param {Array} columns - Array of {name, type} objects
 * @returns {Promise<void>}
 */
async function createTable(tableName, columns) {
  await initDatabase();
  const sanitizedTableName = sanitizeTableName(tableName);
  
  return new Promise((resolve, reject) => {
    if (!columns || columns.length === 0) {
      reject(new Error('Columns definition required'));
      return;
    }

    const columnDefs = columns.map(col => {
      const colName = col.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const colType = col.type || 'VARCHAR';
      return `${colName} ${colType}`;
    }).join(', ');

    const query = `CREATE TABLE ${sanitizedTableName} (${columnDefs})`;

    connection.run(query, (err) => {
      if (err) {
        reject(new Error(`Failed to create table: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Insert a row into a table
 * @param {string} tableName - Name of the table
 * @param {Object} row - Object with column:value pairs
 * @returns {Promise<void>}
 */
async function insertRow(tableName, row) {
  await initDatabase();
  const sanitizedTableName = sanitizeTableName(tableName);
  
  return new Promise((resolve, reject) => {
    const columns = Object.keys(row);
    const values = Object.values(row);
    
    const columnNames = columns.join(', ');
    const placeholders = values.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${sanitizedTableName} (${columnNames}) VALUES (${placeholders})`;

    connection.run(query, ...values, (err) => {
      if (err) {
        reject(new Error(`Failed to insert row: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Update a row in a table
 * @param {string} tableName - Name of the table
 * @param {Object} updates - Object with column:value pairs to update
 * @param {Object} where - Object with column:value pairs for WHERE clause
 * @returns {Promise<void>}
 */
async function updateRow(tableName, updates, where) {
  await initDatabase();
  const sanitizedTableName = sanitizeTableName(tableName);
  
  return new Promise((resolve, reject) => {
    const updateClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const whereClauses = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    
    const updateValues = Object.values(updates);
    const whereValues = Object.values(where);
    
    const query = `UPDATE ${sanitizedTableName} SET ${updateClauses} WHERE ${whereClauses}`;

    connection.run(query, ...updateValues, ...whereValues, (err) => {
      if (err) {
        reject(new Error(`Failed to update row: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Delete row(s) from a table
 * @param {string} tableName - Name of the table
 * @param {Object} where - Object with column:value pairs for WHERE clause
 * @returns {Promise<void>}
 */
async function deleteRow(tableName, where) {
  await initDatabase();
  const sanitizedTableName = sanitizeTableName(tableName);
  
  return new Promise((resolve, reject) => {
    const whereClauses = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const whereValues = Object.values(where);
    
    const query = `DELETE FROM ${sanitizedTableName} WHERE ${whereClauses}`;

    connection.run(query, ...whereValues, (err) => {
      if (err) {
        reject(new Error(`Failed to delete row: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Add a column to an existing table
 * @param {string} tableName - Name of the table
 * @param {string} columnName - Name of the new column
 * @param {string} columnType - Data type of the column
 * @param {*} defaultValue - Default value (optional)
 * @returns {Promise<void>}
 */
async function addColumn(tableName, columnName, columnType, defaultValue = null) {
  await initDatabase();
  const sanitizedTableName = sanitizeTableName(tableName);
  const sanitizedColumnName = columnName.replace(/[^a-zA-Z0-9_]/g, '_');
  
  return new Promise((resolve, reject) => {
    let query = `ALTER TABLE ${sanitizedTableName} ADD COLUMN ${sanitizedColumnName} ${columnType}`;
    
    if (defaultValue !== null) {
      query += ` DEFAULT ${typeof defaultValue === 'string' ? `'${defaultValue}'` : defaultValue}`;
    }

    connection.run(query, (err) => {
      if (err) {
        reject(new Error(`Failed to add column: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Rename a table
 * @param {string} oldName - Current table name
 * @param {string} newName - New table name
 * @returns {Promise<void>}
 */
async function renameTable(oldName, newName) {
  await initDatabase();
  const sanitizedOldName = sanitizeTableName(oldName);
  const sanitizedNewName = sanitizeTableName(newName);
  
  return new Promise((resolve, reject) => {
    const query = `ALTER TABLE ${sanitizedOldName} RENAME TO ${sanitizedNewName}`;

    connection.run(query, (err) => {
      if (err) {
        reject(new Error(`Failed to rename table: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * Get table statistics
 * @param {string} tableName - Name of the table
 * @returns {Promise<Object>}
 */
async function getTableStats(tableName) {
  const sanitizedTableName = sanitizeTableName(tableName);
  const schema = await getTableSchema(tableName);
  
  const columnStats = [];
  
  for (const col of schema) {
    const stats = await executeQuery(`
      SELECT 
        '${col.column_name}' as column_name,
        COUNT(*) as total_count,
        COUNT(${col.column_name}) as non_null_count,
        COUNT(*) - COUNT(${col.column_name}) as null_count,
        COUNT(DISTINCT ${col.column_name}) as distinct_count
      FROM ${sanitizedTableName}
    `);
    
    columnStats.push(stats[0]);
  }
  
  return {
    tableName: sanitizedTableName,
    rowCount: columnStats[0]?.total_count || 0,
    columnCount: schema.length,
    columns: columnStats
  };
}

/**
 * Sanitize table name to prevent SQL injection
 * @param {string} name - Table name
 * @returns {string}
 */
function sanitizeTableName(name) {
  // Remove special characters, keep alphanumeric and underscores
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
async function closeDatabase() {
  return new Promise((resolve) => {
    if (connection) {
      connection.close();
      connection = null;
    }
    if (db) {
      db.close(() => {
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initDatabase,
  importCSV,
  importJSON,
  executeQuery,
  getTableSchema,
  listTables,
  getTablePreview,
  searchTable,
  exportToCSV,
  exportToJSON,
  dropTable,
  createTable,
  insertRow,
  updateRow,
  deleteRow,
  addColumn,
  renameTable,
  getTableStats,
  sanitizeTableName,
  closeDatabase
};
