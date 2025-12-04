#!/usr/bin/env node

const { parseCSV, generateCSV } = require('../lib/csvHelper');
const path = require('path');

/**
 * CSV Update Script
 * Updates a CSV file by adding new rows
 * Usage: node scripts/update.js <input-csv> <output-csv>
 */

function generateNewRow(existingData) {
  // Get column names from existing data
  if (!existingData || existingData.length === 0) {
    return null;
  }

  const columns = Object.keys(existingData[0]);
  const newRow = {};

  // Generate sample data based on column names
  columns.forEach(col => {
    const lowerCol = col.toLowerCase();
    
    if (lowerCol.includes('id')) {
      newRow[col] = existingData.length + 1;
    } else if (lowerCol.includes('name')) {
      newRow[col] = 'New Entry';
    } else if (lowerCol.includes('email')) {
      newRow[col] = 'new.entry@example.com';
    } else if (lowerCol.includes('date')) {
      newRow[col] = new Date().toISOString().split('T')[0];
    } else if (lowerCol.includes('price') || lowerCol.includes('amount') || lowerCol.includes('salary')) {
      newRow[col] = Math.floor(Math.random() * 1000);
    } else {
      // Sample existing values for other columns
      const sampleValues = existingData.map(row => row[col]).filter(v => v);
      newRow[col] = sampleValues[Math.floor(Math.random() * sampleValues.length)] || 'New Value';
    }
  });

  return newRow;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Error: Please provide input and output file paths');
    console.log('Usage: node scripts/update.js <input-csv> <output-csv> [rows-to-add]');
    console.log('Example: node scripts/update.js data/orders.csv data/orders-updated.csv 5');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = path.resolve(args[1]);
  const rowsToAdd = args[2] ? parseInt(args[2]) : 1;

  if (isNaN(rowsToAdd) || rowsToAdd < 1) {
    console.error('Error: Number of rows must be a positive integer');
    process.exit(1);
  }

  try {
    console.log(`Reading CSV file: ${inputPath}`);
    
    const parsed = await parseCSV(inputPath);
    const existingData = parsed.data;

    console.log(`Current rows: ${existingData.length}`);
    console.log(`Adding ${rowsToAdd} new row(s)...`);

    // Generate and add new rows
    for (let i = 0; i < rowsToAdd; i++) {
      const newRow = generateNewRow(existingData);
      if (newRow) {
        existingData.push(newRow);
      }
    }

    // Save updated CSV
    generateCSV(existingData, outputPath);

    console.log(`\nSuccess! Updated CSV saved to: ${outputPath}`);
    console.log(`New total rows: ${existingData.length}`);

  } catch (error) {
    console.error('Error updating CSV:', error.message);
    process.exit(1);
  }
}

main();
