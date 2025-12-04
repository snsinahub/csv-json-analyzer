#!/usr/bin/env node

const { parseCSV, analyzeCSV } = require('../lib/csvHelper');
const path = require('path');

/**
 * CSV Analysis Script
 * Analyzes a CSV file and displays statistics
 * Usage: node scripts/analyze.js <csv-file-path>
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: Please provide a CSV file path');
    console.log('Usage: node scripts/analyze.js <csv-file-path>');
    console.log('Example: node scripts/analyze.js data/orders.csv');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  try {
    console.log(`Analyzing CSV file: ${filePath}\n`);
    
    const parsed = await parseCSV(filePath);
    const analysis = analyzeCSV(parsed.data);

    if (analysis.error) {
      console.error('Error:', analysis.error);
      process.exit(1);
    }

    console.log('=== CSV Analysis Results ===\n');
    console.log(`Total Rows: ${analysis.rowCount}`);
    console.log(`Total Columns: ${analysis.columnCount}`);
    console.log(`\nColumns: ${analysis.columns.join(', ')}\n`);

    console.log('=== Column Statistics ===\n');
    
    Object.entries(analysis.columnStats).forEach(([column, stats]) => {
      console.log(`Column: ${column}`);
      console.log(`  Unique Values: ${stats.uniqueCount}`);
      console.log(`  Null/Empty Count: ${stats.nullCount}`);
      console.log(`  Numeric: ${stats.isNumeric ? 'Yes' : 'No'}`);
      
      if (stats.isNumeric) {
        console.log(`  Min: ${stats.min}`);
        console.log(`  Max: ${stats.max}`);
        console.log(`  Average: ${stats.avg.toFixed(2)}`);
        console.log(`  Sum: ${stats.sum}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error analyzing CSV:', error.message);
    process.exit(1);
  }
}

main();
