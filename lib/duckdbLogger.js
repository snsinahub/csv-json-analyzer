/**
 * DuckDB Logger and Schema Storage Utility
 * Stores application logs, schemas, and metadata in DuckDB
 */

/**
 * Store a schema in DuckDB
 * @param {Object} schema - Schema object to store
 * @param {string} name - Name of the schema
 * @param {string} source - Source page/component
 * @returns {Promise<Object>}
 */
export async function storeSchema(schema, name, source = 'schema-designer') {
  try {
    const schemaData = {
      schema_name: name,
      source: source,
      schema_json: JSON.stringify(schema),
      created_at: new Date().toISOString(),
      field_count: schema.columns ? schema.columns.length : (Array.isArray(schema.fields) ? schema.fields.length : Object.keys(schema).length)
    };

    const response = await fetch('/api/duckdb/store-schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schemaData)
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to store schema:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Store generated data in DuckDB
 * @param {Array} data - Generated data array
 * @param {string} tableName - Name for the table
 * @param {string} source - Source of generation
 * @returns {Promise<Object>}
 */
export async function storeGeneratedData(data, tableName, source = 'data-generator') {
  try {
    const response = await fetch('/api/duckdb/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data, 
        tableName, 
        fileType: 'json'
      })
    });

    const result = await response.json();
    
    // Log the generation
    if (result.success) {
      await storeAnalysisLog({
        type: 'data_generation',
        page: source,
        filename: tableName,
        rowCount: data.length,
        columnCount: Object.keys(data[0] || {}).length,
        status: 'success',
        metadata: { source, tableName }
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to store generated data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Store an analysis log in DuckDB
 * @param {Object} logData - Log data to store
 * @returns {Promise<Object>}
 */
export async function storeAnalysisLog(logData) {
  try {
    const log = {
      log_type: logData.type || 'analysis',
      page: logData.page || 'unknown',
      filename: logData.filename || null,
      row_count: logData.rowCount || 0,
      column_count: logData.columnCount || 0,
      file_size: logData.fileSize || 0,
      processing_time: logData.processingTime || 0,
      status: logData.status || 'success',
      error_message: logData.error || null,
      metadata: JSON.stringify(logData.metadata || {}),
      created_at: new Date().toISOString()
    };

    const response = await fetch('/api/duckdb/store-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to store log:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Store file metadata in DuckDB
 * @param {Object} fileData - File metadata
 * @returns {Promise<Object>}
 */
export async function storeFileMetadata(fileData) {
  try {
    const metadata = {
      filename: fileData.filename,
      file_type: fileData.fileType || 'unknown',
      file_size: fileData.fileSize || 0,
      row_count: fileData.rowCount || 0,
      column_count: fileData.columnCount || 0,
      upload_source: fileData.source || 'unknown',
      columns_json: JSON.stringify(fileData.columns || []),
      created_at: new Date().toISOString()
    };

    const response = await fetch('/api/duckdb/store-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to store metadata:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all stored schemas
 * @returns {Promise<Array>}
 */
export async function getStoredSchemas() {
  try {
    const response = await fetch('/api/duckdb/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: 'SELECT * FROM schemas ORDER BY created_at DESC' 
      })
    });

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Failed to get schemas:', error);
    return [];
  }
}

/**
 * Get analysis logs
 * @param {number} limit - Number of logs to retrieve
 * @returns {Promise<Array>}
 */
export async function getAnalysisLogs(limit = 100) {
  try {
    const response = await fetch('/api/duckdb/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: `SELECT * FROM analysis_logs ORDER BY created_at DESC LIMIT ${limit}` 
      })
    });

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Failed to get logs:', error);
    return [];
  }
}

/**
 * Get file metadata history
 * @param {number} limit - Number of records to retrieve
 * @returns {Promise<Array>}
 */
export async function getFileHistory(limit = 50) {
  try {
    const response = await fetch('/api/duckdb/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: `SELECT * FROM file_metadata ORDER BY created_at DESC LIMIT ${limit}` 
      })
    });

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Failed to get file history:', error);
    return [];
  }
}
