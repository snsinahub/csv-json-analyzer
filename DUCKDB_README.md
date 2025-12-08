# DuckDB Integration

This application now includes embedded DuckDB database support for powerful data analysis and querying.

## Features

### 🗄️ Embedded Database
- In-memory or persistent storage options
- No external database server required
- Fast analytical queries on CSV/JSON data

### 📊 SQL Queries
- Execute SQL queries directly on your data
- Support for complex analytics (GROUP BY, JOIN, aggregations)
- Only SELECT queries allowed for security

### 📁 File Import
- Import CSV files directly to DuckDB tables
- Import JSON files with automatic schema detection
- Preserve data types and structure

### 📈 Analytics
- Table statistics and metadata
- Column-level analysis
- Row counts and distinct values

## API Endpoints

### Import Data
```
POST /api/duckdb/import
Body: { data: string|object, tableName: string, fileType: 'csv'|'json' }
```

### Execute Query
```
POST /api/duckdb/query
Body: { query: string }
```

### List Tables
```
GET /api/duckdb/tables
```

### Table Details
```
GET /api/duckdb/table/[tableName]?action=schema|preview|stats
```

## Usage Examples

### 1. Upload a CSV File
Navigate to the DuckDB Query page and use the Upload tab to import a CSV or JSON file.

### 2. Execute SQL Queries
```sql
-- Select all data
SELECT * FROM my_table LIMIT 100;

-- Count rows
SELECT COUNT(*) as total_rows FROM my_table;

-- Group by analysis
SELECT category, COUNT(*) as count, AVG(price) as avg_price
FROM products
GROUP BY category;

-- Join tables
SELECT o.order_id, c.customer_name, o.total
FROM orders o
JOIN customers c ON o.customer_id = c.id;
```

### 3. Analyze Data
```sql
-- Find top 10 customers by order count
SELECT customer_id, COUNT(*) as order_count
FROM orders
GROUP BY customer_id
ORDER BY order_count DESC
LIMIT 10;

-- Calculate statistics
SELECT 
  MIN(price) as min_price,
  MAX(price) as max_price,
  AVG(price) as avg_price,
  STDDEV(price) as std_price
FROM products;
```

## Library Functions

### Initialize Database
```javascript
import { initDatabase } from '@/lib/duckdb';

// In-memory database
await initDatabase();

// Persistent database
await initDatabase('./data/mydb.duckdb');
```

### Import CSV
```javascript
import { importCSV } from '@/lib/duckdb';

const stats = await importCSV('path/to/file.csv', 'my_table');
console.log(`Imported ${stats.rowCount} rows`);
```

### Import JSON
```javascript
import { importJSON } from '@/lib/duckdb';

const data = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 }
];

const stats = await importJSON(data, 'users');
```

### Execute Queries
```javascript
import { executeQuery } from '@/lib/duckdb';

const results = await executeQuery('SELECT * FROM users WHERE age > 25');
console.log(results);
```

### Get Table Schema
```javascript
import { getTableSchema } from '@/lib/duckdb';

const schema = await getTableSchema('users');
// Returns: [{ column_name: 'id', data_type: 'INTEGER', is_nullable: 'NO' }, ...]
```

### Table Statistics
```javascript
import { getTableStats } from '@/lib/duckdb';

const stats = await getTableStats('users');
console.log(`Rows: ${stats.rowCount}, Columns: ${stats.columnCount}`);
```

## Advanced Features

### 1. Window Functions
```sql
SELECT 
  customer_id,
  order_date,
  total,
  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_sequence
FROM orders;
```

### 2. Common Table Expressions (CTEs)
```sql
WITH monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', order_date) as month,
    SUM(total) as sales
  FROM orders
  GROUP BY month
)
SELECT * FROM monthly_sales ORDER BY month DESC;
```

### 3. JSON Functions
```sql
-- If you have JSON columns
SELECT 
  json_extract(metadata, '$.category') as category,
  COUNT(*) as count
FROM products
GROUP BY category;
```

## Performance Tips

1. **Use LIMIT** for exploration queries
2. **Create indexes** for frequently queried columns (DuckDB auto-optimizes)
3. **Aggregate data** before returning large results
4. **Use appropriate data types** for better storage and query performance

## Security Notes

- Only SELECT queries are allowed through the API
- Table names are sanitized to prevent SQL injection
- In-memory database by default (data not persisted)
- For persistent storage, database file is stored locally

## Troubleshooting

### Large File Imports
For very large files (>1GB), consider:
- Importing in batches
- Using DuckDB's native CSV reader instead of loading into memory
- Increasing Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096 npm run dev`

### Query Timeouts
Complex queries on large datasets may take time. Consider:
- Adding appropriate filters (WHERE clauses)
- Using LIMIT for testing
- Creating materialized views for frequently accessed aggregations

## Future Enhancements

- [ ] Query result export (CSV, JSON, Excel)
- [ ] Saved queries and query history
- [ ] Query execution plans and optimization
- [ ] Multi-table joins UI
- [ ] Real-time query results streaming
- [ ] Parquet file support
- [ ] Database backup and restore

## Learn More

- [DuckDB Documentation](https://duckdb.org/docs/)
- [DuckDB SQL Reference](https://duckdb.org/docs/sql/introduction)
- [DuckDB Node.js Client](https://duckdb.org/docs/api/nodejs/overview)
