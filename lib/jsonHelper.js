const fs = require('fs');

/**
 * Parse JSON file and return data
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<Object>} Parsed JSON data
 */
async function parseJSON(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Normalize data to array format
      let normalizedData;
      if (Array.isArray(data)) {
        normalizedData = data;
      } else if (typeof data === 'object' && data !== null) {
        // If it's an object, check if it has a data array property
        if (data.data && Array.isArray(data.data)) {
          normalizedData = data.data;
        } else {
          // Convert single object to array
          normalizedData = [data];
        }
      } else {
        normalizedData = [];
      }
      
      resolve({ data: normalizedData });
    } catch (error) {
      reject(new Error(`Failed to parse JSON: ${error.message}`));
    }
  });
}

/**
 * Analyze JSON data and return statistics
 * @param {Array} data - Parsed JSON data
 * @returns {Object} Analysis results
 */
function analyzeJSON(data) {
  if (!data || data.length === 0) {
    return { error: 'No data to analyze' };
  }

  // Flatten nested objects to get all possible keys
  const getAllKeys = (obj, prefix = '') => {
    let keys = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
    }
    return keys;
  };

  const allKeys = new Set();
  data.forEach(row => {
    getAllKeys(row).forEach(key => allKeys.add(key));
  });

  const columns = Array.from(allKeys);
  const rowCount = data.length;
  const columnCount = columns.length;

  const analysis = {
    rowCount,
    columnCount,
    columns,
    columnStats: {}
  };

  // Helper to get nested value
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  columns.forEach(column => {
    const values = data.map(row => getNestedValue(row, column)).filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = [...new Set(values)];
    
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const isNumeric = numericValues.length > values.length * 0.8 && numericValues.length > 0;

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
 * Generate JSON from data
 * @param {Array} data - Data to convert to JSON
 * @param {string} outputPath - Path to save JSON file
 * @param {boolean} pretty - Whether to pretty-print the JSON
 */
function generateJSON(data, outputPath, pretty = true) {
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  fs.writeFileSync(outputPath, json, 'utf8');
  return outputPath;
}

/**
 * Update JSON file with new data
 * @param {string} filePath - Path to JSON file
 * @param {Array} newData - New data to add/update
 * @param {string} outputPath - Path to save updated JSON
 */
async function updateJSON(filePath, newData, outputPath) {
  const parsed = await parseJSON(filePath);
  const combinedData = [...parsed.data, ...newData];
  return generateJSON(combinedData, outputPath);
}

/**
 * Convert JSON to flat structure suitable for CSV
 * @param {Array} data - JSON data array
 * @returns {Array} Flattened data
 */
function flattenJSON(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  const flatten = (obj, prefix = '') => {
    const flattened = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flatten(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value);
        } else {
          flattened[newKey] = value;
        }
      }
    }
    return flattened;
  };

  return data.map(item => flatten(item));
}

module.exports = {
  parseJSON,
  analyzeJSON,
  generateJSON,
  updateJSON,
  flattenJSON
};
