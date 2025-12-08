# DuckDB Integration Features

Complete guide to all DuckDB functionality integrated throughout the CSV Analyzer application.

## Overview

DuckDB is an embedded analytical database that enables powerful SQL querying, data storage, and analytics directly within the application. All data is stored locally in an embedded database file with no external server required.

---

## Features by Page

### 1. **DuckDB Query Page** (`/duckdb-query`)

The central hub for all DuckDB operations with four main tabs:

#### **SQL Query Tab**
- Execute custom SQL queries against stored tables
- View query results in interactive tables
- Access sample queries for common operations
- View table schema and statistics
- Features:
  - Syntax highlighting for SQL
  - Query history
  - Result export capabilities
  - Row count and column information

#### **Upload Data Tab**
- Import CSV and JSON files directly to DuckDB
- Automatic table creation from file structure
- File validation and error handling
- Supports nested JSON (auto-flattened)
- Features:
  - Drag-and-drop file upload
  - Automatic data type inference
  - Table naming based on filename
  - Upload statistics

#### **Tables Tab**
- View all available tables in DuckDB
- **Create new tables** with custom schemas
  - Define column names and data types
  - Support for VARCHAR, INTEGER, DOUBLE, BOOLEAN, DATE, TIMESTAMP
- **Delete tables** with confirmation
- Quick navigation to query interface
- Table metadata display

#### **Edit Table Tab**
- **Full CRUD operations** on table data
- **Inline editing** - Click any cell to edit
- **Add new rows** with form-based input
- **Delete rows** individually
- **Add columns** to existing tables
- Real-time data updates
- Spreadsheet-like interface
- Features:
  - Auto-save on cell blur
  - Validation before operations
  - Refresh data functionality
  - Scrollable table view

---

### 2. **Schema Designer** (`/schema-designer`)

Design custom data schemas and generate synthetic data with DuckDB integration:

#### Schema Features
- **Save Schema to DuckDB**
  - Store schema definitions for reuse
  - Track schema metadata (field count, creation date, source)
  - Schemas stored in dedicated `schemas` table
  - Quick retrieval for future use

#### Data Generation
- **Save Generated Data to DuckDB**
  - Store generated datasets as tables
  - Automatic table creation from schema
  - Support for up to 100,000 rows
  - Preserves all column types and constraints

#### Logging
- All generation operations logged to `analysis_logs` table
- Tracks:
  - Schema name and source
  - Row/column counts
  - Processing time
  - Success/error status
  - Generation parameters (seed, locale)

---

### 3. **Data Generator** (`/data-generator`)

Template-based data generation with DuckDB storage:

#### Features
- **Save Generated Data to DuckDB**
  - One-click save for template-generated data
  - Automatic table naming from template
  - Instant availability in DuckDB Query interface

#### Logging
- Generation operations tracked in `analysis_logs`
- Metadata includes:
  - Template ID and name
  - Generation mode (template/custom/design)
  - Row count and processing time
  - Seed and locale information

---

### 4. **Table View** (`/table-view`)

View and edit CSV/JSON files with DuckDB persistence:

#### Features
- **Save to DuckDB**
  - Store uploaded files as tables
  - Preserve all edits and modifications
  - Automatic table naming from filename

#### File Operations
- Upload CSV or JSON files
- View in table or JSON format
- Edit cells inline
- Track edit history
- Export modified data

#### Logging & Metadata
- File uploads logged to `file_upload_history`
- Edit operations tracked in `analysis_logs`
- Stores:
  - Filename and file type
  - Row/column counts
  - Number of edits made
  - Edit mode information

---

### 5. **Update Page** (`/update`)

Add rows to existing CSV/JSON files with DuckDB storage:

#### Features
- **Save Updated Data to DuckDB**
  - Store modified files with added rows
  - Table naming: `{original}_updated`
  - Preserves all original and new data

#### Update Operations
- Generate new rows based on existing data
- Add 1-1,000 rows at once
- Intelligent data generation
- Download updated files

#### Logging
- Update operations logged to `analysis_logs`
- Tracks:
  - Original row count
  - Rows added
  - File type and size
  - Processing metadata

---

### 6. **Analyze Page** (`/analyze`)

File analysis with comprehensive logging:

#### Features
- CSV and JSON file analysis
- Statistical summaries
- Data type detection
- JSON validation and beautification

#### Logging
- All analysis operations logged
- Separate logs for:
  - CSV file analysis
  - JSON file analysis
  - Success and error states
- Metadata includes:
  - File type and size
  - Row/column counts
  - Processing results

---

## Database Tables

### 1. **schemas**
Stores schema definitions from Schema Designer.

**Columns:**
- `id` - Auto-increment primary key
- `schema_name` - Name of the schema
- `source` - Source page (schema-designer, etc.)
- `schema_json` - Full schema definition as JSON
- `field_count` - Number of fields in schema
- `created_at` - Timestamp

**Use Cases:**
- Reuse schema designs
- Share schemas across projects
- Track schema evolution
- Quick schema retrieval

### 2. **analysis_logs**
Tracks all file operations and data generation.

**Columns:**
- `id` - Auto-increment primary key
- `log_type` - Type of operation (analysis, generation, edit, update)
- `page` - Source page
- `filename` - File being processed
- `row_count` - Number of rows
- `column_count` - Number of columns
- `file_size` - File size in bytes
- `processing_time` - Time taken in milliseconds
- `status` - Success or error
- `error_message` - Error details if failed
- `metadata` - Additional JSON metadata
- `created_at` - Timestamp

**Use Cases:**
- Audit trail for all operations
- Performance monitoring
- Error tracking
- Usage analytics

### 3. **file_upload_history**
Stores metadata about uploaded files.

**Columns:**
- `id` - Auto-increment primary key
- `filename` - Original filename
- `file_type` - CSV or JSON
- `file_size` - Size in bytes
- `row_count` - Number of rows
- `column_count` - Number of columns
- `upload_source` - Page where uploaded
- `columns_json` - Column names and types
- `created_at` - Timestamp

**Use Cases:**
- Track file uploads
- Data lineage
- Column mapping
- Upload history

### 4. **Dynamic Data Tables**
User-created tables from imports and generations.

**Features:**
- Custom names based on file/schema
- Automatic schema inference
- Support for all data types
- Full SQL query support

---

## API Endpoints

### Query Operations
- **POST /api/duckdb/query** - Execute SQL queries
- **GET /api/duckdb/tables** - List all tables
- **GET /api/duckdb/table/:name** - Get table details (schema, stats, preview)

### Data Import
- **POST /api/duckdb/import** - Import CSV/JSON data

### Table Operations
- **POST /api/duckdb/table-operations**
  - `create` - Create new table
  - `delete` - Delete table
  - `rename` - Rename table
  - `add-column` - Add column to table
  - `insert` - Insert row
  - `update` - Update row
  - `delete-row` - Delete row

### Storage & Logging
- **POST /api/duckdb/store-schema** - Store schema definition
- **POST /api/duckdb/store-log** - Store analysis log
- **POST /api/duckdb/store-metadata** - Store file metadata

---

## Usage Examples

### Example 1: Create and Query a Table

```javascript
// 1. Create a table via UI (Tables tab)
// - Click "Create New Table"
// - Name: "customers"
// - Add columns: id (INTEGER), name (VARCHAR), email (VARCHAR)

// 2. Insert data via Edit Table tab
// - Click "Add Row"
// - Fill in form

// 3. Query in SQL Query tab
SELECT * FROM customers WHERE id > 100;
```

### Example 2: Generate and Store Data

```javascript
// 1. In Schema Designer
// - Design schema with 5 columns
// - Click "Generate" with 1000 rows
// - Click "Save Schema" to store definition
// - Click "Save to DuckDB" to store data

// 2. Query the data
SELECT column_name, COUNT(*) 
FROM custom_schema 
GROUP BY column_name;
```

### Example 3: Edit and Save File

```javascript
// 1. In Table View
// - Upload CSV file
// - Edit cells as needed
// - Click "Save to DuckDB"

// 2. Query in DuckDB Query tab
SELECT * FROM my_file 
WHERE modified_column = 'new_value';
```

---

## Advanced Features

### 1. **BigInt Support**
All BigInt values automatically converted to Number for JSON serialization.

### 2. **Nested JSON Handling**
Uploaded JSON files are automatically flattened for table storage.

### 3. **Schema Inference**
Automatic data type detection from CSV/JSON files.

### 4. **Error Handling**
Comprehensive error logging for all operations.

### 5. **SQL Injection Protection**
Table names sanitized to prevent SQL injection attacks.

---

## Benefits

### For Data Analysis
- ✅ Store unlimited datasets locally
- ✅ Run complex SQL queries
- ✅ Join multiple tables
- ✅ Aggregate and analyze data
- ✅ Export results to CSV/JSON

### For Development
- ✅ No external database required
- ✅ Zero configuration
- ✅ Fast embedded analytics
- ✅ Full SQL support
- ✅ ACID transactions

### For Collaboration
- ✅ Share database file
- ✅ Export/import schemas
- ✅ Track data lineage
- ✅ Audit logs included

---

## Technical Details

### Database Location
- In-memory by default (`:memory:`)
- Can be configured for persistent storage
- File location: `./data/app.db` (when persistent)

### Supported Data Types
- `VARCHAR` - Text strings
- `INTEGER` - Whole numbers
- `DOUBLE` - Decimal numbers
- `BOOLEAN` - True/false values
- `DATE` - Dates
- `TIMESTAMP` - Date and time

### Performance
- Optimized for analytical queries
- Columnar storage format
- Vectorized query execution
- Efficient compression

### Limitations
- In-memory mode: Data lost on refresh (unless persistent mode enabled)
- File size depends on available memory
- No concurrent multi-user access

---

## Future Enhancements

- [ ] Persistent database option via settings
- [ ] Import/export entire database
- [ ] Scheduled queries
- [ ] Data visualization from queries
- [ ] Schema versioning
- [ ] Query builder UI
- [ ] Table relationships/foreign keys
- [ ] Backup and restore functionality
- [ ] Performance metrics dashboard

---

## Troubleshooting

### Issue: Table not found
**Solution:** Check Tables tab to verify table exists. Re-import if needed.

### Issue: Query fails with syntax error
**Solution:** Validate SQL syntax. Use sample queries as templates.

### Issue: Cannot edit cells
**Solution:** Ensure Edit Mode is enabled in Table View or Edit Table tab.

### Issue: Data not persisting
**Solution:** DuckDB uses in-memory mode by default. Data is lost on page refresh unless saved to persistent storage.

---

## Support

For issues or questions about DuckDB integration:
1. Check this documentation
2. Review API endpoint responses
3. Check `analysis_logs` table for error details
4. Verify table exists in Tables tab

---

**Last Updated:** December 8, 2025
**Version:** 1.0.0
