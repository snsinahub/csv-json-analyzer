#!/usr/bin/env node

const { generateCSV } = require('../lib/csvHelper');
const path = require('path');

/**
 * CSV Generation Script
 * Generates a sample CSV file with dummy data
 * Usage: node scripts/generate.js <output-file-path> [rows]
 */

function generateSampleData(rows = 10) {
  const data = [];
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
  const departments = ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance'];

  for (let i = 1; i <= rows; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const salary = Math.floor(Math.random() * 100000) + 30000;
    const age = Math.floor(Math.random() * 40) + 22;

    data.push({
      id: i,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      department,
      salary,
      age,
      hireDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    });
  }

  return data;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: Please provide an output file path');
    console.log('Usage: node scripts/generate.js <output-file-path> [rows]');
    console.log('Example: node scripts/generate.js data/generated.csv 50');
    process.exit(1);
  }

  const outputPath = path.resolve(args[0]);
  const rows = args[1] ? parseInt(args[1]) : 10;

  if (isNaN(rows) || rows < 1) {
    console.error('Error: Number of rows must be a positive integer');
    process.exit(1);
  }

  try {
    console.log(`Generating CSV file with ${rows} rows...`);
    
    const data = generateSampleData(rows);
    const result = generateCSV(data, outputPath);

    console.log(`\nSuccess! CSV file generated at: ${result}`);
    console.log(`Total rows: ${rows}`);
    console.log(`Columns: ${Object.keys(data[0]).join(', ')}`);

  } catch (error) {
    console.error('Error generating CSV:', error.message);
    process.exit(1);
  }
}

main();
