// Data validation utilities for type checking and validation

export function detectDataType(value) {
  if (value === null || value === undefined || value === '') {
    return 'empty';
  }
  
  const strValue = String(value).trim();
  
  // Boolean
  if (/^(true|false|yes|no|0|1)$/i.test(strValue)) {
    return 'boolean';
  }
  
  // Number
  if (!isNaN(strValue) && !isNaN(parseFloat(strValue))) {
    return strValue.includes('.') ? 'decimal' : 'integer';
  }
  
  // Date
  const dateValue = new Date(strValue);
  if (!isNaN(dateValue.getTime()) && strValue.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
    return 'date';
  }
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
    return 'email';
  }
  
  // Phone
  if (/^[\d\s\-\+\(\)]+$/.test(strValue) && strValue.replace(/\D/g, '').length >= 10) {
    return 'phone';
  }
  
  // URL
  if (/^https?:\/\/.+/.test(strValue)) {
    return 'url';
  }
  
  return 'text';
}

export function validateValue(value, expectedType, constraints = {}) {
  const errors = [];
  
  // Check required
  if (constraints.required && (value === null || value === undefined || value === '')) {
    errors.push('This field is required');
    return { valid: false, errors };
  }
  
  // If empty and not required, it's valid
  if (value === null || value === undefined || value === '') {
    return { valid: true, errors: [] };
  }
  
  const strValue = String(value).trim();
  
  // Type validation
  switch (expectedType) {
    case 'integer':
    case 'decimal':
      if (isNaN(strValue)) {
        errors.push(`Expected ${expectedType} but got "${value}"`);
      } else {
        const numValue = parseFloat(strValue);
        if (constraints.min !== undefined && numValue < constraints.min) {
          errors.push(`Value must be at least ${constraints.min}`);
        }
        if (constraints.max !== undefined && numValue > constraints.max) {
          errors.push(`Value must be at most ${constraints.max}`);
        }
      }
      break;
      
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
        errors.push('Invalid email format');
      }
      break;
      
    case 'phone':
      const digits = strValue.replace(/\D/g, '');
      if (digits.length < 10) {
        errors.push('Phone number must have at least 10 digits');
      }
      break;
      
    case 'url':
      if (!/^https?:\/\/.+/.test(strValue)) {
        errors.push('Invalid URL format');
      }
      break;
      
    case 'date':
      const dateValue = new Date(strValue);
      if (isNaN(dateValue.getTime())) {
        errors.push('Invalid date format');
      }
      break;
  }
  
  // Pattern validation
  if (constraints.pattern && !new RegExp(constraints.pattern).test(strValue)) {
    errors.push(`Value does not match required pattern`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function inferColumnTypes(data) {
  if (!data || data.length === 0) return {};
  
  const columns = Object.keys(data[0]);
  const columnTypes = {};
  
  columns.forEach(column => {
    const types = {};
    let nonEmptyCount = 0;
    
    // Sample up to 100 rows for type detection
    const sampleSize = Math.min(100, data.length);
    for (let i = 0; i < sampleSize; i++) {
      const value = data[i][column];
      if (value !== null && value !== undefined && value !== '') {
        const type = detectDataType(value);
        types[type] = (types[type] || 0) + 1;
        nonEmptyCount++;
      }
    }
    
    // Get most common type
    let mostCommonType = 'text';
    let maxCount = 0;
    
    Object.entries(types).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    });
    
    // If more than 20% are empty, mark as nullable
    const emptyPercentage = ((sampleSize - nonEmptyCount) / sampleSize) * 100;
    
    columnTypes[column] = {
      type: mostCommonType,
      nullable: emptyPercentage > 20,
      emptyPercentage: Math.round(emptyPercentage)
    };
  });
  
  return columnTypes;
}

export function checkDuplicates(data, column) {
  const seen = new Set();
  const duplicates = [];
  
  data.forEach((row, index) => {
    const value = row[column];
    if (value !== null && value !== undefined && value !== '') {
      if (seen.has(value)) {
        duplicates.push({ row: index + 1, value });
      } else {
        seen.add(value);
      }
    }
  });
  
  return duplicates;
}
