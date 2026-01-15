# CSV & JSON Analyzer

A comprehensive Node.js application for analyzing, generating, querying, and updating CSV and JSON files with both command-line interface (CLI) and web application capabilities.

## ✨ Features

### Web Application Features
- **🔐 Portable GitHub OAuth**: Sign in with GitHub - works everywhere without .env files!
- **CSV/JSON Analysis**: Detailed statistics, dynamic field type detection, business pattern recognition, and interactive visualizations
- **DuckDB SQL Queries**: Embedded database for running SQL queries on CSV/JSON data without external database
- **Table View & Editor**: Paginated data table with sorting, filtering, inline editing, undo/redo, and export capabilities
- **Schema Designer**: Visual schema builder with 28+ data types and 5 pre-built templates
- **Data Generator**: Generate realistic fake data with customizable schemas
- **CSV/JSON Updates**: Add new rows to existing files
- **Responsive Design**: Professional web interface using Bootstrap and Semantic UI
- **Interactive Dashboard**: User-friendly application with drag-and-drop file upload

### CLI Tools
- **CSV Analysis**: Analyze CSV files from command line
- **Data Generation**: Generate sample CSV files
- **CSV Updates**: Add rows to existing CSV files
- **OAuth Configuration**: Interactive setup script for portable OAuth

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Web Framework**: Next.js 16 with React 18
- **Database**: DuckDB (embedded analytical database for SQL queries)
- **Authentication**: NextAuth.js with GitHub OAuth + PKCE Security
- **UI Libraries**: Bootstrap 5.3 (responsive design) + Semantic UI (UI components)
- **Data Processing**: PapaParse (CSV), custom JSON parser with flattening
- **Data Visualization**: Recharts (interactive charts)
- **Data Generation**: @faker-js/faker (realistic fake data)
- **File Handling**: file-saver (client-side downloads)
- **Notifications**: react-hot-toast
- **Security**: AES-256 encrypted credential storage, PKCE OAuth flow

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/snsinahub-org/csv-analyzer.git
cd csv-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. **Set up Portable GitHub OAuth** (1 minute - works everywhere!):

   **🚀 Quick Setup (Recommended):**
   ```bash
   npm run setup-oauth
   ```
   This interactive script will guide you through everything!

   **Or use environment variables (for production):**
   ```bash
   export GITHUB_ID=your_client_id
   export GITHUB_SECRET=your_client_secret
   export NEXTAUTH_SECRET=$(openssl rand -base64 32)
   npm run dev
   ```

   **Need help?** See [OAUTH_QUICKSTART.md](./OAUTH_QUICKSTART.md) or [Full Documentation](./PORTABLE_OAUTH_SETUP.md)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to: http://localhost:3000

6. Click **"Sign in with GitHub"** → Authorize → You're logged in! ✅

**See [START_HERE.md](./START_HERE.md) for detailed setup instructions and [DOC_INDEX.md](./DOC_INDEX.md) for all documentation.**

## 🚀 Quick Start

### Web Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Use the web interface to:
   - **Sign In**: Click the "Sign In" button in the navigation to personalize your experience
   - **Dashboard**: View overview and quick access to all features
   - **Analyze**: Upload CSV/JSON files and view detailed statistics with dynamic insights and visualizations
   - **DuckDB Query**: Run SQL queries on your data without external database setup
   - **Table View**: View, sort, filter, edit CSV/JSON data in a paginated table and export to JSON/CSV
   - **Schema Designer**: Design custom data schemas with 28+ data types
   - **Data Generator**: Generate realistic fake data using pre-built templates or custom schemas
   - **Update**: Add rows to existing CSV/JSON files

### DuckDB SQL Queries

Query your CSV/JSON data using SQL without any database setup:

1. Upload a CSV or JSON file in the **Analyze** page
2. Check "Save to DuckDB for SQL queries"
3. Navigate to **DuckDB Query** page
4. Run SQL queries like:
   ```sql
   SELECT * FROM my_table WHERE amount > 1000;
   SELECT category, COUNT(*), AVG(price) FROM products GROUP BY category;
   ```

**See [DUCKDB_README.md](./DUCKDB_README.md) for complete DuckDB documentation.**

### Command-Line Interface (CLI)

#### Analyze a CSV File

Analyze a CSV file and display detailed statistics:

```bash
node scripts/analyze.js <csv-file-path>
```

**Example:**
```bash
node scripts/analyze.js data/orders.csv
```

**Output:**
- Total rows and columns
- Column names
- Column statistics (unique values, null counts, numeric analysis)

#### Generate a CSV File

Generate a CSV file with sample employee data:

```bash
node scripts/generate.js <output-file-path> [rows]
```

**Example:**
```bash
node scripts/generate.js data/employees.csv 100
```

**Parameters:**
- `output-file-path`: Path where the CSV file will be saved
- `rows` (optional): Number of rows to generate (default: 10)

**Generated Columns:**
- id, firstName, lastName, email, department, salary, age, hireDate

#### Update a CSV File

Add new rows to an existing CSV file:

```bash
node scripts/update.js <input-csv> <output-csv> [rows-to-add]
```

**Example:**
```bash
node scripts/update.js data/orders.csv data/orders-updated.csv 5
```

**Parameters:**
- `input-csv`: Path to the existing CSV file
- `output-csv`: Path where the updated CSV will be saved
- `rows-to-add` (optional): Number of rows to add (default: 1)

## 🏗️ Project Structure

```
csv-analyzer/
├── app/                      # Next.js application routes
│   ├── analyze/             # CSV/JSON analysis page with visualizations
│   ├── table-view/          # Paginated table view with inline editing
│   ├── schema-designer/     # Data schema builder with templates
│   ├── data-generator/      # Template-based data generation
│   ├── duckdb-query/        # SQL query interface for DuckDB
│   ├── generate/            # CSV generation page
│   ├── update/              # CSV/JSON update page
│   ├── api/                 # API routes
│   │   ├── duckdb/         # DuckDB API endpoints (import, query, tables)
│   │   ├── config/         # OAuth configuration endpoints
│   │   └── auth/           # NextAuth.js authentication
│   ├── layout.js            # Root layout with Bootstrap/Semantic UI
│   ├── page.js              # Dashboard homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Navigation.js        # Navigation bar component
│   ├── DynamicReport.js     # Dynamic analysis report
│   ├── VisualizationPanel.js # Chart container
│   ├── DataTable.js         # Paginated data table
│   ├── TablePagination.js   # Pagination controls
│   ├── EditableCell.js      # Inline editable cell
│   ├── ExportModal.js       # JSON export dialog
│   ├── SchemaBuilder.js     # Schema designer
│   ├── ColumnConfig.js      # Column configuration panel
│   └── charts/              # Chart components (5 types)
│       ├── TimeSeriesChart.js
│       ├── PieChartComponent.js
│       ├── BarChartComponent.js
│       ├── HistogramChart.js
│       └── ScatterPlotChart.js
├── data/                    # Sample CSV files
│   ├── orders.csv
│   └── sample.csv
├── lib/                     # Utilities and helpers
│   ├── csvHelper.js         # CSV processing utilities
│   ├── jsonHelper.js        # JSON parsing and flattening
│   ├── csvAnalyzer.js       # Dynamic analysis engine
│   ├── duckdb.js            # DuckDB database operations
│   ├── duckdbLogger.js      # DuckDB logging utilities
│   ├── chartUtils.js        # Chart data preparation
│   ├── schemaGenerator.js   # Data generation with templates
│   ├── tableUtils.js        # Pagination, sorting, filtering
│   ├── exportUtils.js       # JSON/CSV export
│   ├── dataValidation.js    # Type checking and validation
│   ├── editHistory.js       # Undo/redo management
│   └── auth-config.js       # Portable OAuth configuration
├── scripts/                 # CLI scripts and tools
│   ├── analyze.js           # CSV analysis script
│   ├── generate.js          # CSV generation script
│   ├── update.js            # CSV update script
│   ├── setup-oauth.js       # Interactive OAuth setup
│   └── check-auth-setup.js  # OAuth configuration validator
├── public/                  # Static assets
├── docs/                    # Documentation files (28+ guides)
│   ├── DOC_INDEX.md        # Documentation navigation
│   ├── DUCKDB_README.md    # DuckDB usage guide
│   ├── OAUTH_QUICKSTART.md # OAuth setup guide
│   └── ...                  # Additional specialized docs
├── package.json             # Project dependencies
├── next.config.js           # Next.js configuration
├── docker-compose.yml       # Docker orchestration
├── Dockerfile               # Container configuration
├── test-duckdb.js          # DuckDB integration tests
└── README.md                # This file
```

## 🔌 API Reference

### DuckDB API Endpoints

The application provides RESTful API endpoints for DuckDB operations:

#### Import Data
```
POST /api/duckdb/import
Body: { 
  data: string | object,
  tableName: string,
  fileType: 'csv' | 'json' 
}
```
Import CSV or JSON data into a DuckDB table.

#### Execute Query
```
POST /api/duckdb/query
Body: { query: string }
```
Execute SQL SELECT queries on stored tables. Only SELECT statements are allowed for security.

#### List Tables
```
GET /api/duckdb/tables
```
Get a list of all tables in the database.

#### Table Details
```
GET /api/duckdb/table/[tableName]?action=schema|preview|stats
```
- `?action=schema` - Get column definitions and types
- `?action=preview&limit=100` - Preview table data with row limit
- `?action=stats` - Get comprehensive table statistics

### OAuth Configuration API

#### Check Configuration Status
```
GET /api/config/status
```
Verify OAuth configuration is complete.

#### Setup OAuth
```
POST /api/config/setup
Body: { githubId: string, githubSecret: string, nextAuthSecret: string }
```
Configure OAuth credentials programmatically.

For complete API documentation, see [DUCKDB_README.md](./DUCKDB_README.md) and [PORTABLE_OAUTH_SETUP.md](./PORTABLE_OAUTH_SETUP.md).

## Adding New Scripts

To add a new CLI script to the project:

1. **Create the script file** in the `scripts/` directory:
```bash
touch scripts/my-new-script.js
```

2. **Add the shebang** at the top of your script:
```javascript
#!/usr/bin/env node
```

3. **Import the CSV helper** utilities:
```javascript
const { parseCSV, analyzeCSV, generateCSV } = require('../lib/csvHelper');
const path = require('path');
```

4. **Implement your main function**:
```javascript
async function main() {
  const args = process.argv.slice(2);
  
  // Your script logic here
  // Handle arguments
  // Process CSV data
  // Display results
}

main();
```

5. **Make the script executable**:
```bash
chmod +x scripts/my-new-script.js
```

6. **Test your script**:
```bash
node scripts/my-new-script.js [arguments]
```

### Example Custom Script

Here's a template for a new script that counts specific values:

```javascript
#!/usr/bin/env node

const { parseCSV } = require('../lib/csvHelper');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/count-values.js <csv-file> <column-name> <value>');
    process.exit(1);
  }

  const [filePath, columnName, searchValue] = args;

  try {
    const parsed = await parseCSV(path.resolve(filePath));
    const count = parsed.data.filter(row => row[columnName] === searchValue).length;
    
    console.log(`Found ${count} rows where ${columnName} = ${searchValue}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

## 🚢 Deployment

### Production Build

Build the web application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Deployment Options

#### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables:
   - `GITHUB_ID` - GitHub OAuth Client ID
   - `GITHUB_SECRET` - GitHub OAuth Client Secret
   - `NEXTAUTH_SECRET` - NextAuth.js secret (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your production URL
4. Deploy!

See [PORTABLE_OAUTH_SETUP.md](./PORTABLE_OAUTH_SETUP.md) for platform-specific guides.

#### Docker
Use the provided Docker configuration:

```bash
# Build the image
docker build -t csv-analyzer .

# Run with docker-compose
docker-compose up -d
```

Configure environment variables in `.env.docker` file. DuckDB data persists in Docker volumes.

#### Other Platforms
The application supports deployment on:
- **AWS** (EC2, ECS, Elastic Beanstalk, Lambda)
- **Kubernetes** (with persistent volumes for DuckDB)
- **Netlify**
- **Heroku**
- **Railway**
- **Render**

See [PORTABLE_OAUTH_SETUP.md](./PORTABLE_OAUTH_SETUP.md) for detailed deployment guides for each platform.

### Environment Variables

Required for production:
- `GITHUB_ID` - GitHub OAuth application client ID
- `GITHUB_SECRET` - GitHub OAuth application client secret
- `NEXTAUTH_SECRET` - Random string for session encryption (32+ characters)
- `NEXTAUTH_URL` - Full URL of your application

Optional:
- `DUCKDB_PATH` - Path for persistent DuckDB storage (default: `:memory:`)

## 🤝 Contributing & Development

### Development Workflow

Run the development server with hot reload:

```bash
npm run dev
```

### Running Tests

Test DuckDB integration:

```bash
node test-duckdb.js
```

### Project Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the existing code style
4. Test your changes thoroughly
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Code Structure

- **UI Components**: Place in `components/` directory
- **Page Routes**: Add to `app/` directory following Next.js 13+ conventions
- **API Endpoints**: Create in `app/api/` directory
- **Utilities**: Add helper functions to `lib/` directory
- **CLI Scripts**: Add command-line tools to `scripts/` directory

### Documentation

When adding new features:
- Update this README.md with user-facing features
- Create detailed documentation in separate .md files if needed
- Update [DOC_INDEX.md](./DOC_INDEX.md) with links to new documentation
- Add code comments for complex logic

## 📚 Documentation

This project includes comprehensive documentation:

- **[DOC_INDEX.md](./DOC_INDEX.md)** - Complete documentation index and navigation guide
- **[DUCKDB_README.md](./DUCKDB_README.md)** - DuckDB integration and SQL query guide
- **[DUCKDB_FEATURES.md](./DUCKDB_FEATURES.md)** - Complete DuckDB feature list
- **[OAUTH_QUICKSTART.md](./OAUTH_QUICKSTART.md)** - 60-second OAuth setup guide
- **[PORTABLE_OAUTH_SETUP.md](./PORTABLE_OAUTH_SETUP.md)** - Comprehensive deployment guide for all platforms
- **[JSON_SUPPORT_SUMMARY.md](./JSON_SUPPORT_SUMMARY.md)** - JSON file support documentation
- **[START_HERE.md](./START_HERE.md)** - Detailed getting started guide

See [DOC_INDEX.md](./DOC_INDEX.md) for the complete documentation index (28+ guides).

## 📋 Available Helper Functions

The `lib/csvHelper.js` module provides the following functions:

### `parseCSV(filePath)`
- Parses a CSV file and returns structured data
- **Parameters**: `filePath` (string) - Path to CSV file
- **Returns**: Promise<Object> - Parsed CSV data with headers

### `analyzeCSV(data)`
- Analyzes CSV data and returns statistics
- **Parameters**: `data` (Array) - Parsed CSV data
- **Returns**: Object - Analysis results with column statistics

### `generateCSV(data, outputPath)`
- Generates a CSV file from data array
- **Parameters**: 
  - `data` (Array) - Data to convert to CSV
  - `outputPath` (string) - Path to save CSV file
- **Returns**: string - Path to saved file

### `updateCSV(filePath, newData, outputPath)`
- Updates a CSV file with new data
- **Parameters**:
  - `filePath` (string) - Path to existing CSV
  - `newData` (Array) - New rows to add
  - `outputPath` (string) - Path to save updated CSV
- **Returns**: Promise<string> - Path to saved file

## Web Application Features

### Table View

The Table View page provides a comprehensive data table interface with:

- **Pagination**: Navigate through large datasets with configurable rows per page (10, 25, 50, 100)
- **Sorting**: Click column headers to sort data ascending/descending
- **Filtering**: Search within columns using individual filter inputs
- **Inline Editing**: Double-click cells to edit values with type validation
- **Undo/Redo**: Full edit history with undo/redo support
- **Add Rows**: Insert new rows with empty values
- **JSON Export**: Export data to JSON with customizable formatting options
- **CSV Export**: Download edited data as CSV file

**Usage:**
1. Navigate to `/table-view`
2. Upload a CSV file
3. Use pagination, sorting, and filtering to explore data
4. Enable "Edit Mode" to make changes
5. Export to JSON or save changes as CSV

### Data Generator (Schema Designer)

Create custom data schemas and generate realistic fake data:

- **Visual Schema Builder**: Drag-and-drop interface for designing data structures
- **28+ Data Types**: Including names, emails, addresses, dates, numbers, UUIDs, and more
- **Pre-built Templates**: 5 ready-to-use schemas (E-commerce Orders, Customer Database, Product Inventory, Employee Records, Sales Transactions)
- **Type-Specific Configuration**: Set ranges, formats, and constraints per column
- **Reproducible Data**: Use seed values for consistent data generation
- **Preview**: See sample data before generating full dataset
- **Custom Templates**: Save your schemas for reuse

**Supported Data Types:**
- **Numbers**: Sequential, Integer, Decimal, Currency, Percentage
- **Text**: Random text, First/Last/Full names, Company, Job Title
- **Contact**: Email, Phone, URL
- **Location**: Address, City, State, Country, ZIP Code
- **Date/Time**: Date, DateTime
- **Other**: Boolean, Category, Status, UUID, Product, SKU

**Usage:**
1. Navigate to `/schema-designer`
2. Load a template or start from scratch
3. Add/configure columns with data types
4. Set generation options (row count, seed)
5. Preview data
6. Generate and download CSV

### Dynamic Analysis

The Analyze page includes intelligent analysis features:

- **Field Type Detection**: Automatically detects 10+ data types (integers, decimals, emails, phones, dates, URLs, etc.)
- **Business Pattern Recognition**: Identifies common patterns (orders, customers, products, transactions, time-series)
- **Context-Aware Insights**: Generates intelligent insights based on data patterns and anomalies
- **Data Quality Metrics**: Shows completeness, consistency, and validity scores
- **Interactive Visualizations**: 5 chart types (Time Series, Pie, Bar, Histogram, Scatter Plot)
- **Smart Chart Detection**: Automatically suggests appropriate visualizations based on data

**Analysis Features:**
- Summary statistics with visual cards
- Field-by-field analysis with type detection
- Collapsible sections for easy navigation
- Color-coded insight badges (positive, negative, neutral)
- Visualization recommendations
- Export-ready insights

## Sample Data

The `data/` directory contains sample CSV files for testing:

- `orders.csv` - Sample order data
- `sample.csv` - Generic sample data

## Keyboard Shortcuts

### Table View
- `Double-click` cell - Edit cell value
- `Enter` - Save cell edit
- `Escape` - Cancel cell edit

### Schema Designer
- Drag columns to reorder
- Click column to configure

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

All modern browsers with ES6+ support.

## Performance Notes

- **Table View**: Optimized for datasets up to 10,000 rows
- **Data Generator**: Can generate up to 100,000 rows
- **DuckDB**: Handles millions of rows efficiently with SQL queries
- **Large file handling**: Uses chunked processing for files >5000 rows
- **Client-side processing**: CSV/JSON parsing runs in browser
- **Server-side**: DuckDB queries execute on the server for optimal performance

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 💬 Support

For issues, questions, and feature requests:
- Create an issue on the [GitHub repository](https://github.com/snsinahub/csv-json-analyzer/issues)
- Check [DOC_INDEX.md](./DOC_INDEX.md) for comprehensive documentation
- See [OAUTH_QUICKSTART.md](./OAUTH_QUICKSTART.md) for setup help

---

**Built with ❤️ using Next.js, React, DuckDB, Bootstrap, Semantic UI, Recharts, Faker.js, and NextAuth.js**