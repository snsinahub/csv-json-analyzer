# CSV Analyzer

A comprehensive Node.js application for analyzing, generating, and updating CSV files with both command-line interface (CLI) and web application capabilities.

## Features

- **Dual Interface**: Access functionality through both CLI scripts and a modern web application
- **CSV Analysis**: Detailed statistics, dynamic field type detection, business pattern recognition, and interactive visualizations
- **Table View**: Paginated data table with sorting, filtering, inline editing, and JSON export
- **Data Generator**: Visual schema designer with 5+ templates to generate realistic fake data
- **CSV Updates**: Add new rows to existing CSV files
- **Responsive Design**: Professional web interface using Bootstrap and Semantic UI
- **Interactive Dashboard**: User-friendly web application with drag-and-drop file upload

## Technology Stack

- **Runtime**: Node.js
- **Web Framework**: Next.js 16 with React 18
- **UI Libraries**: Bootstrap 5.3 (responsive design) + Semantic UI (UI components)
- **CSV Processing**: PapaParse
- **Data Visualization**: Recharts (interactive charts)
- **Data Generation**: Faker.js (realistic fake data)
- **File Handling**: file-saver (client-side downloads)
- **Notifications**: react-hot-toast

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

## Usage

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
   - **Dashboard**: View overview and quick access to all features
   - **Analyze**: Upload CSV files and view detailed statistics with dynamic insights and visualizations
   - **Table View**: View, sort, filter, edit CSV data in a paginated table and export to JSON
   - **Data Generator**: Design schemas and generate realistic fake data with pre-built templates
   - **Generate**: Create new CSV files with sample data
   - **Update**: Add rows to existing CSV files

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
- For numeric columns: min, max, average, and sum

#### Generate a CSV File

Create a new CSV file with sample employee data:

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

## Project Structure

```
csv-analyzer/
├── app/                      # Next.js application routes
│   ├── analyze/             # CSV analysis page with visualizations
│   ├── table-view/          # Paginated table view with editing
│   ├── schema-designer/     # Data generator with schema builder
│   ├── generate/            # CSV generation page
│   ├── update/              # CSV update page
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
│   ├── csvAnalyzer.js       # Dynamic analysis engine
│   ├── chartUtils.js        # Chart data preparation
│   ├── schemaGenerator.js   # Data generation with templates
│   ├── tableUtils.js        # Pagination, sorting, filtering
│   ├── exportUtils.js       # JSON/CSV export
│   ├── dataValidation.js    # Type checking and validation
│   └── editHistory.js       # Undo/redo management
├── scripts/                 # CLI scripts
│   ├── analyze.js           # CSV analysis script
│   ├── generate.js          # CSV generation script
│   └── update.js            # CSV update script
├── public/                  # Static assets
├── package.json             # Project dependencies
├── next.config.js           # Next.js configuration
└── README.md                # This file
```

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

## Building for Production

Build the web application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Development

Run the development server with hot reload:

```bash
npm run dev
```

## Available Helper Functions

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

- Table View: Optimized for datasets up to 10,000 rows
- Data Generator: Can generate up to 100,000 rows
- Large file handling: Uses chunked processing for files >5000 rows
- Client-side processing: All operations run in browser (no server required)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

ISC License

## Support

For issues and questions, please create an issue on the [GitHub repository](https://github.com/snsinahub-org/csv-analyzer/issues).

---

**Built with ❤️ using Next.js, React, Bootstrap, Semantic UI, Recharts, and Faker.js**