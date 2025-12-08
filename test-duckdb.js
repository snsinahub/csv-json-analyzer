/**
 * Test DuckDB Integration
 * Run with: node test-duckdb.js
 */

const {
  initDatabase,
  importCSV,
  importJSON,
  executeQuery,
  getTableSchema,
  listTables,
  getTableStats,
  closeDatabase
} = require('./lib/duckdb');

async function testDuckDB() {
  console.log('🧪 Testing DuckDB Integration...\n');

  try {
    // 1. Initialize database
    console.log('1️⃣ Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized\n');

    // 2. Import JSON data
    console.log('2️⃣ Importing JSON data...');
    const testData = [
      { id: 1, name: 'Alice', age: 30, city: 'New York' },
      { id: 2, name: 'Bob', age: 25, city: 'Los Angeles' },
      { id: 3, name: 'Charlie', age: 35, city: 'Chicago' },
      { id: 4, name: 'Diana', age: 28, city: 'New York' },
      { id: 5, name: 'Eve', age: 32, city: 'Los Angeles' }
    ];
    
    const importStats = await importJSON(testData, 'users');
    console.log(`✅ Imported ${importStats.rowCount} rows into ${importStats.tableName}\n`);

    // 3. List tables
    console.log('3️⃣ Listing tables...');
    const tables = await listTables();
    console.log('Tables:', tables.map(t => t.table_name).join(', '));
    console.log('✅ Found', tables.length, 'table(s)\n');

    // 4. Get table schema
    console.log('4️⃣ Getting table schema...');
    const schema = await getTableSchema('users');
    console.log('Schema:');
    schema.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    console.log('✅ Schema retrieved\n');

    // 5. Execute queries
    console.log('5️⃣ Executing queries...\n');

    // Query 1: Select all
    console.log('Query: SELECT * FROM users LIMIT 3');
    const allUsers = await executeQuery('SELECT * FROM users LIMIT 3');
    console.table(allUsers);

    // Query 2: Filter by age
    console.log('\nQuery: SELECT * FROM users WHERE age > 28');
    const olderUsers = await executeQuery('SELECT * FROM users WHERE age > 28');
    console.table(olderUsers);

    // Query 3: Group by city
    console.log('\nQuery: SELECT city, COUNT(*) as count FROM users GROUP BY city');
    const cityStats = await executeQuery('SELECT city, COUNT(*) as count FROM users GROUP BY city ORDER BY count DESC');
    console.table(cityStats);

    // Query 4: Aggregations
    console.log('\nQuery: SELECT AVG(age) as avg_age, MIN(age) as min_age, MAX(age) as max_age FROM users');
    const ageStats = await executeQuery('SELECT AVG(age) as avg_age, MIN(age) as min_age, MAX(age) as max_age FROM users');
    console.table(ageStats);

    console.log('✅ Queries executed successfully\n');

    // 6. Get table statistics
    console.log('6️⃣ Getting table statistics...');
    const stats = await getTableStats('users');
    console.log(`Table: ${stats.tableName}`);
    console.log(`Rows: ${stats.rowCount}`);
    console.log(`Columns: ${stats.columnCount}`);
    console.log('✅ Statistics retrieved\n');

    // 7. Close database
    console.log('7️⃣ Closing database...');
    await closeDatabase();
    console.log('✅ Database closed\n');

    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testDuckDB().catch(console.error);
