const Papa = require('papaparse');
const fs = require('fs');

/**
 * Parse CSV file and return data
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Object>} Parsed CSV data
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (error) => reject(error)
    });
  });
}

/**
 * Analyze CSV data and return statistics
 * @param {Array} data - Parsed CSV data
 * @returns {Object} Analysis results
 */
function analyzeCSV(data) {
  if (!data || data.length === 0) {
    return { error: 'No data to analyze' };
  }

  const columns = Object.keys(data[0]);
  const rowCount = data.length;
  const columnCount = columns.length;

  const analysis = {
    rowCount,
    columnCount,
    columns,
    columnStats: {}
  };

  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(v => v !== null && v !== '');
    const uniqueValues = [...new Set(values)];
    
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const isNumeric = numericValues.length > values.length * 0.8;

    analysis.columnStats[column] = {
      uniqueCount: uniqueValues.length,
      nullCount: data.length - values.length,
      isNumeric
    };

    if (isNumeric && numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const avg = sum / numericValues.length;
      const sorted = [...numericValues].sort((a, b) => a - b);
      
      analysis.columnStats[column].min = sorted[0];
      analysis.columnStats[column].max = sorted[sorted.length - 1];
      analysis.columnStats[column].avg = avg;
      analysis.columnStats[column].sum = sum;
    }
  });

  return analysis;
}

/**
 * Generate CSV from data
 * @param {Array} data - Data to convert to CSV
 * @param {string} outputPath - Path to save CSV file
 */
function generateCSV(data, outputPath) {
  const csv = Papa.unparse(data);
  fs.writeFileSync(outputPath, csv, 'utf8');
  return outputPath;
}

/**
 * Update CSV file with new data
 * @param {string} filePath - Path to CSV file
 * @param {Array} newData - New data to add/update
 * @param {string} outputPath - Path to save updated CSV
 */
async function updateCSV(filePath, newData, outputPath) {
  const parsed = await parseCSV(filePath);
  const combinedData = [...parsed.data, ...newData];
  return generateCSV(combinedData, outputPath);
}

module.exports = {
  parseCSV,
  analyzeCSV,
  generateCSV,
  updateCSV
};
