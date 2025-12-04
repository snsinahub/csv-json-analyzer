# CSV Analyzer

A comprehensive Node.js application for analyzing, generating, and updating CSV files with both command-line interface (CLI) and web application capabilities.

## Features

- **Dual Interface**: Access functionality through both CLI scripts and a modern web application
- **CSV Analysis**: Detailed statistics including row/column counts, data types, min/max/average values
- **CSV Generation**: Create sample CSV files with customizable row counts
- **CSV Updates**: Add new rows to existing CSV files
- **Responsive Design**: Professional web interface using Bootstrap and Semantic UI
- **Interactive Dashboard**: User-friendly web application with drag-and-drop file upload

## Technology Stack

- **Runtime**: Node.js
- **Web Framework**: Next.js with React
- **UI Libraries**: Bootstrap (responsive design) + Semantic UI (UI components)
- **CSV Processing**: PapaParse, csv-parser
- **File Handling**: Multer

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
   - **Analyze**: Upload CSV files and view detailed statistics
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
│   ├── analyze/             # CSV analysis page
│   ├── generate/            # CSV generation page
│   ├── update/              # CSV update page
│   ├── layout.js            # Root layout with Bootstrap/Semantic UI
│   ├── page.js              # Dashboard homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   └── Navigation.js        # Navigation bar component
├── data/                    # Sample CSV files
│   ├── orders.csv
│   └── sample.csv
├── lib/                     # Backend logic
│   └── csvHelper.js         # CSV processing utilities
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

## Sample Data

The `data/` directory contains sample CSV files for testing:

- `orders.csv` - Sample order data
- `sample.csv` - Generic sample data

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

**Built with ❤️ using Next.js, React, Bootstrap, and Semantic UI**