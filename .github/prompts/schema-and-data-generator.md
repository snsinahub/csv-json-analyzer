# Schema Designer and Multi-Format Data Generator

## Goal
Add a comprehensive schema designer and fake data generator to the CSV Analyzer application that allows users to define custom data schemas and generate realistic fake data in multiple formats: CSV, JSON, and SQL.

## Context
The application currently focuses on analyzing existing CSV files. This enhancement will add powerful data generation capabilities, enabling users to:
- Design custom data schemas with a visual interface
- Generate realistic fake data based on the schema
- Export generated data in CSV, JSON, or SQL formats
- Use pre-built templates for common data structures
- Import generated data directly into databases

This feature is valuable for developers creating test data, QA teams generating test scenarios, and data scientists needing sample datasets.

## Requirements

### 1. Schema Designer Interface

#### Visual Schema Builder
- Create a new "Data Generator" page/tab in the application
- Drag-and-drop interface for adding and reordering columns
- Real-time schema preview
- Column configuration panel with the following settings per column:
  - **Column Name**: Text input with validation (no spaces, valid identifiers)
  - **Display Label**: User-friendly name for UI
  - **Data Type**: Dropdown selection
  - **Generation Strategy**: Type-specific options
  - **Constraints**: Required, unique, nullable
  - **Default Value**: Optional fallback value

#### Supported Data Types
1. **Text Types**
   - First Name
   - Last Name
   - Full Name
   - Username
   - Company Name
   - Job Title
   - Department
   - Lorem Ipsum (paragraph, sentence, words)
   - Custom Text (user-provided list)

2. **Number Types**
   - Integer (with min/max range)
   - Decimal (with precision, min/max)
   - Percentage (0-100 or 0-1)
   - Currency (with currency symbol)
   - Sequential ID (auto-increment)
   - Random from List (custom number set)

3. **Date/Time Types**
   - Date (with range: start date, end date)
   - Time (with format: 12h/24h)
   - DateTime (combined)
   - Timestamp (Unix timestamp)
   - Date in Future/Past (relative to now)

4. **Contact Types**
   - Email Address
   - Phone Number (with format: US, UK, International)
   - Website URL
   - IP Address (IPv4/IPv6)
   - MAC Address

5. **Location Types**
   - Street Address
   - City
   - State/Province
   - Country
   - ZIP/Postal Code
   - Latitude/Longitude
   - Full Address (combined)

6. **Boolean/Category Types**
   - Boolean (true/false, yes/no, 1/0)
   - Status (active/inactive, pending/approved/rejected)
   - Category (custom list with weights)
   - Enum (predefined values)

7. **Identifier Types**
   - UUID (v4)
   - GUID
   - SKU/Product Code
   - ISBN
   - Credit Card Number (fake, valid format)
   - SSN (fake, valid format)

8. **Advanced Types**
   - JSON Object (nested structure)
   - Array (of any type)
   - File Path
   - Image URL (from placeholder service)
   - Color (hex, rgb, named)
   - Sentence/Paragraph
   - Hashtag
   - Emoji

### 2. Schema Templates

#### Built-in Templates
Provide 10+ ready-to-use schema templates:

1. **E-commerce Order**
   - order_id, customer_name, customer_email, product_name, quantity, unit_price, total_price, order_date, status, shipping_address

2. **Customer Database**
   - customer_id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, country, registration_date, account_status

3. **Product Inventory**
   - product_id, sku, product_name, category, brand, price, cost, quantity_in_stock, reorder_level, supplier_name, last_restocked

4. **Employee Records**
   - employee_id, first_name, last_name, email, department, job_title, hire_date, salary, manager_id, office_location, employment_status

5. **Sales Transactions**
   - transaction_id, sale_date, salesperson_name, customer_name, product_name, quantity, unit_price, discount, tax, total_amount, payment_method

6. **User Accounts**
   - user_id, username, email, password_hash, first_name, last_name, avatar_url, role, created_at, last_login, is_active

7. **Blog Posts**
   - post_id, title, slug, author_name, content, excerpt, category, tags, published_date, view_count, status, featured_image_url

8. **Event Registrations**
   - registration_id, event_name, attendee_name, email, phone, ticket_type, ticket_price, registration_date, check_in_status

9. **IoT Sensor Data**
   - sensor_id, timestamp, temperature, humidity, pressure, location, battery_level, status

10. **Financial Transactions**
    - transaction_id, account_number, transaction_date, description, amount, balance, transaction_type, category, merchant

#### Template Management
- Load template with one click
- Modify loaded template (add/remove/edit columns)
- Save custom templates to localStorage
- Export/Import template definitions (JSON)
- Duplicate existing templates
- Template search and filtering

### 3. Data Generation Options

#### Generation Settings
- **Number of Rows**: Input field (1-100,000 rows)
  - Presets: 10, 50, 100, 500, 1000, 5000
  - Warning for large datasets (>10,000 rows)
- **Seed Value**: Optional number for reproducible data
  - Checkbox: "Use seed for reproducible results"
  - Random seed generator button
- **Locale**: Dropdown (en_US, en_GB, fr_FR, de_DE, es_ES, etc.)
  - Affects names, addresses, phone formats
- **Data Quality Options**:
  - Percentage of null values (0-50%)
  - Include duplicate records (percentage)
  - Add random outliers (for numeric fields)

#### Preview Functionality
- "Preview" button shows first 10-20 rows
- Preview in a modal/panel with table view
- Preview updates when schema changes
- Show warnings if generation might be slow

### 4. Multi-Format Export

#### CSV Format
- **Options**:
  - Delimiter: comma, semicolon, tab, pipe
  - Quote character: double quote, single quote
  - Include header row (on/off)
  - Line ending: CRLF (Windows), LF (Unix)
  - Encoding: UTF-8, UTF-16, ASCII
- **Output**:
  - Download as .csv file
  - Custom filename input
  - Auto-generated filename: `generated_data_YYYYMMDD_HHMMSS.csv`

#### JSON Format
- **Options**:
  - Structure: Array of objects, Object with array, Nested structure
  - Formatting: Pretty-printed (indented), Minified
  - Include metadata: row count, generation date, schema info
  - Root key name (for wrapped structure)
- **Output Example**:
  ```json
  {
    "metadata": {
      "generated_at": "2025-12-04T10:30:00Z",
      "row_count": 100,
      "schema": "customers"
    },
    "data": [
      {
        "customer_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      }
    ]
  }
  ```
- **Output**:
  - Download as .json file
  - Copy to clipboard option
  - Custom filename input

#### SQL Format
- **Options**:
  - Database Type: MySQL, PostgreSQL, SQLite, SQL Server, Oracle
  - Table Name: User input (validated)
  - Include DROP TABLE statement (on/off)
  - Include CREATE TABLE statement (on/off)
  - Insert Style: 
    - Single INSERT per row
    - Bulk INSERT (multiple rows per statement)
    - INSERT with ON CONFLICT/DUPLICATE KEY
  - Data type mapping (auto-detect or manual):
    - Text → VARCHAR(255) or TEXT
    - Number → INT, BIGINT, DECIMAL
    - Date → DATE, DATETIME, TIMESTAMP
    - Boolean → BOOLEAN, TINYINT
  - Add primary key (auto-increment)
  - Add indexes (on specified columns)
  - Add foreign key constraints (if relationships defined)

- **Output Example (PostgreSQL)**:
  ```sql
  -- Generated by CSV Analyzer - 2025-12-04
  
  DROP TABLE IF EXISTS customers;
  
  CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  INSERT INTO customers (first_name, last_name, email, phone, date_of_birth) VALUES
  ('John', 'Doe', 'john.doe@example.com', '+1-555-0123', '1985-03-15'),
  ('Jane', 'Smith', 'jane.smith@example.com', '+1-555-0124', '1990-07-22'),
  ('Bob', 'Johnson', 'bob.j@example.com', '+1-555-0125', '1982-11-30');
  
  -- 3 rows inserted
  ```

- **Output**:
  - Download as .sql file
  - Copy to clipboard
  - Show row count and table info

### 5. Advanced Features

#### Relationships and Dependencies
- Define column relationships:
  - Column B depends on Column A (e.g., city depends on state)
  - Referential integrity (foreign keys)
  - Conditional values (if status=active, then end_date=null)
- Parent-child data generation:
  - Generate related tables (orders + order_items)
  - Maintain referential integrity
  - Export with JOIN-ready data

#### Data Validation Rules
- Add custom validation rules per column:
  - Regex pattern matching
  - Value range constraints
  - Custom JavaScript validation function
  - Cross-column validation (field A > field B)
- Real-time validation in preview
- Show validation errors before export

#### Import/Export Schema
- Export schema definition as JSON
- Import schema from JSON file
- Share schemas via URL (optional: store in GitHub Gist)
- Version control for schemas

## Technical Implementation

### File Structure
```
app/
  data-generator/
    page.js                      # Main data generator page
components/
  SchemaDesigner.js              # Visual schema builder
  ColumnConfigurator.js          # Column settings panel
  TemplateSelector.js            # Template gallery
  DataPreview.js                 # Preview table
  ExportPanel.js                 # Multi-format export controls
  FormatOptions/
    CsvOptions.js                # CSV export settings
    JsonOptions.js               # JSON export settings
    SqlOptions.js                # SQL export settings
lib/
  dataGenerator.js               # Core data generation engine
  formatters/
    csvFormatter.js              # CSV output formatter
    jsonFormatter.js             # JSON output formatter
    sqlFormatter.js              # SQL output formatter
  schemaTemplates.js             # Built-in templates
  schemaValidator.js             # Schema validation
  typeGenerators.js              # Type-specific generators
  sqlTypeMapper.js               # SQL data type mapping
```

### Key Libraries

#### Data Generation
- **@faker-js/faker** (v9.x): Realistic fake data generation
  - Supports 70+ locales
  - Extensive data types (names, addresses, dates, etc.)
  - Deterministic with seed values

#### File Export
- **file-saver**: Download files in browser
- **papaparse**: CSV parsing/generation (already in project)
- **json2csv**: Advanced CSV export options

#### UI Components
- **react-beautiful-dnd**: Drag-and-drop for column reordering
- **react-select**: Enhanced dropdowns for type selection
- **react-syntax-highlighter**: SQL syntax highlighting in preview
- **react-hot-toast**: Success/error notifications

### Core Functions

#### Data Generator Engine
```javascript
// lib/dataGenerator.js

export function generateData(schema, options) {
  const { rowCount, seed, locale, nullPercentage } = options;
  const faker = getFakerInstance(locale, seed);
  
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const row = {};
    schema.columns.forEach(column => {
      row[column.name] = generateFieldValue(column, faker, nullPercentage);
    });
    rows.push(row);
  }
  
  return rows;
}

function generateFieldValue(column, faker, nullPercentage) {
  // Handle null values
  if (Math.random() < nullPercentage / 100 && !column.required) {
    return null;
  }
  
  // Generate based on type
  switch (column.type) {
    case 'firstName':
      return faker.person.firstName();
    case 'email':
      return faker.internet.email();
    case 'integer':
      return faker.number.int({ min: column.min, max: column.max });
    // ... more types
  }
}
```

#### SQL Formatter
```javascript
// lib/formatters/sqlFormatter.js

export function formatAsSQL(data, schema, options) {
  const { tableName, dbType, includeCreate, insertStyle } = options;
  
  let sql = `-- Generated by CSV Analyzer - ${new Date().toISOString()}\n\n`;
  
  if (options.includeDrop) {
    sql += `DROP TABLE IF EXISTS ${tableName};\n\n`;
  }
  
  if (includeCreate) {
    sql += generateCreateTable(schema, tableName, dbType);
  }
  
  sql += generateInsertStatements(data, tableName, insertStyle, dbType);
  
  return sql;
}

function generateCreateTable(schema, tableName, dbType) {
  const columns = schema.columns.map(col => {
    const sqlType = mapToSQLType(col.type, col, dbType);
    const constraints = getConstraints(col, dbType);
    return `  ${col.name} ${sqlType}${constraints}`;
  });
  
  return `CREATE TABLE ${tableName} (\n${columns.join(',\n')}\n);\n\n`;
}

function mapToSQLType(type, column, dbType) {
  const typeMap = {
    mysql: {
      firstName: 'VARCHAR(100)',
      email: 'VARCHAR(255)',
      integer: 'INT',
      decimal: `DECIMAL(${column.precision || 10}, ${column.scale || 2})`,
      date: 'DATE',
      datetime: 'DATETIME',
      boolean: 'TINYINT(1)',
      text: 'TEXT',
      uuid: 'CHAR(36)'
    },
    postgresql: {
      firstName: 'VARCHAR(100)',
      email: 'VARCHAR(255)',
      integer: 'INTEGER',
      decimal: 'NUMERIC',
      date: 'DATE',
      datetime: 'TIMESTAMP',
      boolean: 'BOOLEAN',
      text: 'TEXT',
      uuid: 'UUID'
    },
    // ... more databases
  };
  
  return typeMap[dbType][type] || 'VARCHAR(255)';
}
```

## UI/UX Requirements

### Schema Designer Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Data Generator                    [Load Template ▼] [Save Schema]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Schema Columns:                     Column Configuration:        │
│ ┌───────────────────────┐          ┌──────────────────────────┐ │
│ │ ⋮ customer_id         │◀────────▶│ Column Name:             │ │
│ │   NUMBER | Sequential │          │ [customer_id           ] │ │
│ │                        │          │                          │ │
│ │ ⋮ first_name          │          │ Data Type:               │ │
│ │   TEXT | Random       │          │ [Sequential Number    ▼] │ │
│ │                        │          │                          │ │
│ │ ⋮ email               │          │ ☑ Required  ☑ Unique    │ │
│ │   EMAIL | Auto        │          │ ☐ Nullable              │ │
│ │                        │          │                          │ │
│ │ [+ Add Column]        │          │ Start Value: [1       ] │ │
│ └───────────────────────┘          │ Increment: [1         ] │ │
│                                     └──────────────────────────┘ │
│                                                                   │
│ Generation Settings:                                              │
│ Rows: [1000    ] Seed: [☐ Use seed] [42       ] Locale: [en_US▼]│
│                                                                   │
│ [Preview Data]                                  [Generate Data]  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Export Format:  ⚪ CSV  ⚪ JSON  ⚪ SQL                           │
│                                                                   │
│ SQL Options:                                                      │
│ Table Name: [customers    ] Database: [PostgreSQL ▼]            │
│ ☑ Include DROP TABLE  ☑ Include CREATE TABLE                   │
│ Insert Style: [Bulk INSERT (100 rows/statement)             ▼]  │
│                                                                   │
│ [Download .sql] [Copy to Clipboard]                             │
└─────────────────────────────────────────────────────────────────┘
```

### Template Gallery
```
┌────────────┬────────────┬────────────┬────────────┐
│ 📦 Orders  │ 👤 Customer│ 📊 Products│ 👔 Employee│
│ 8 columns  │ 12 columns │ 11 columns │ 10 columns │
│ [Load]     │ [Load]     │ [Load]     │ [Load]     │
├────────────┼────────────┼────────────┼────────────┤
│ 💳 Sales   │ 👥 Users   │ 📝 Blog    │ 🎟️ Events  │
│ 10 columns │ 9 columns  │ 11 columns │ 8 columns  │
│ [Load]     │ [Load]     │ [Load]     │ [Load]     │
└────────────┴────────────┴────────────┴────────────┘
```

### Data Preview Modal
```
Preview - First 20 of 1000 rows

┌────┬──────────┬────────────┬─────────────────────────┐
│ ID │ Name     │ Email      │ Registration            │
├────┼──────────┼────────────┼─────────────────────────┤
│ 1  │ John Doe │ john@ex... │ 2024-03-15 10:23:45    │
│ 2  │ Jane S.  │ jane@ex... │ 2024-05-22 14:56:12    │
│ 3  │ Bob J.   │ bob@exa... │ 2024-07-08 09:15:33    │
└────┴──────────┴────────────┴─────────────────────────┘

[Close] [Generate & Download]
```

## Validation Checks

- [ ] Schema designer page loads without errors
- [ ] Can add new columns to schema
- [ ] Can remove columns from schema
- [ ] Can reorder columns via drag-and-drop
- [ ] Column configuration panel updates when selecting column
- [ ] All data types are available in dropdown
- [ ] Can set column as required/unique/nullable
- [ ] Can load built-in templates
- [ ] Templates load with correct column definitions
- [ ] Can save custom schema to localStorage
- [ ] Can export schema as JSON file
- [ ] Can import schema from JSON file
- [ ] Row count input validates (1-100,000)
- [ ] Seed value generates reproducible data
- [ ] Locale setting affects generated data (names, addresses)
- [ ] Preview shows correct number of sample rows
- [ ] Preview updates when schema changes
- [ ] Preview shows warnings for large datasets
- [ ] CSV export downloads valid CSV file
- [ ] CSV export respects delimiter/quote settings
- [ ] CSV includes/excludes header based on option
- [ ] JSON export downloads valid JSON file
- [ ] JSON pretty-print formatting works
- [ ] JSON metadata option includes correct info
- [ ] SQL export generates valid SQL for MySQL
- [ ] SQL export generates valid SQL for PostgreSQL
- [ ] SQL export generates valid SQL for SQLite
- [ ] SQL CREATE TABLE statement has correct data types
- [ ] SQL INSERT statements have correct values
- [ ] SQL escapes special characters properly
- [ ] Bulk INSERT groups rows correctly
- [ ] Primary key auto-increment works in SQL
- [ ] UNIQUE constraints added for unique columns
- [ ] NOT NULL constraints added for required columns
- [ ] Generated data matches column types
- [ ] Numeric ranges (min/max) are respected
- [ ] Date ranges are respected
- [ ] Null percentage generates correct null distribution
- [ ] All 10+ templates work correctly
- [ ] Can generate 10,000+ rows without performance issues
- [ ] File downloads work in all browsers
- [ ] Copy to clipboard works
- [ ] No console errors during generation
- [ ] Loading states shown during generation
- [ ] Success notifications appear after export
- [ ] Error messages shown for invalid inputs
- [ ] Mobile responsive design works

## Example Use Cases

### Use Case 1: Generate Test Customers for Database
1. Navigate to "Data Generator" page
2. Click "Load Template" → Select "Customer Database"
3. Modify schema: Remove "country" column
4. Set generation options: 500 rows, seed: 12345
5. Select export format: SQL
6. Configure SQL options: PostgreSQL, table name "customers"
7. Check "Include CREATE TABLE"
8. Click "Generate Data"
9. Download customers.sql
10. Import into PostgreSQL database

### Use Case 2: Create E-commerce Test Data (JSON)
1. Select "E-commerce Order" template
2. Add custom column: "tracking_number" (UUID type)
3. Set 1000 rows, locale: en_US
4. Click "Preview" to verify data
5. Select JSON export format
6. Choose "Pretty-printed" and "Include metadata"
7. Download orders.json
8. Use in API testing

### Use Case 3: Generate CSV for Excel Import
1. Create custom schema from scratch:
   - product_id (Sequential)
   - product_name (Text - Product names)
   - category (Category - [Electronics, Clothing, Food])
   - price (Decimal, min: 10, max: 1000)
   - in_stock (Boolean)
2. Generate 200 rows
3. Export as CSV with semicolon delimiter (for Excel)
4. Download and open in Excel

### Use Case 4: Create Reproducible Test Data
1. Load "Sales Transactions" template
2. Set seed value: 99999
3. Generate 100 rows → Download CSV
4. Share seed with team
5. Team members generate identical data using same seed
6. Use for consistent testing across environments

## Performance Considerations

- **Chunked Generation**: Generate large datasets in chunks to avoid browser freezing
- **Web Workers**: Use web workers for background data generation
- **Streaming**: Stream SQL output for very large datasets (>50k rows)
- **Lazy Loading**: Load templates on demand
- **Memoization**: Cache generated data for re-export in different formats
- **Progress Indicator**: Show progress bar for generation >1000 rows

## Security & Privacy

- All data generation happens client-side (no server required)
- No data sent to external services
- Fake data only - warn users not to use for real sensitive data
- SQL injection prevention in table/column names
- Sanitize all user inputs in generated output

## Future Enhancements (Optional)

- **Graph Data**: Generate graph/network data (nodes & edges)
- **Time Series**: Specialized time-series data generation
- **XML Export**: Add XML as export format
- **Excel Export**: Direct .xlsx file generation
- **API Mocking**: Generate OpenAPI specs from schema
- **NoSQL Formats**: MongoDB, Cassandra query formats
- **Cloud Upload**: Direct upload to AWS S3, Google Cloud Storage
- **Collaboration**: Share schemas via cloud (Firebase)
- **AI-Powered**: Use LLM to generate schema from description
- **Data Relationships**: Visual relationship designer (ER diagram)
- **Import from DB**: Reverse engineer schema from existing database
- **Batch Generation**: Generate multiple related tables at once

## Accessibility

- Keyboard navigation for all controls
- ARIA labels for screen readers
- Focus management in modals
- High contrast mode support
- Clear error messages
- Skip links for complex forms
