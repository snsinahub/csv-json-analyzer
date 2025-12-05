// Export utilities for JSON conversion and file downloads
import { saveAs } from 'file-saver';

export function convertToJSON(data, options = {}) {
  const {
    structure = 'array', // 'array' or 'object'
    includeMetadata = false,
    pretty = true
  } = options;
  
  let jsonData;
  
  if (structure === 'array') {
    jsonData = data;
  } else {
    jsonData = { data };
  }
  
  if (includeMetadata) {
    const metadata = {
      generatedAt: new Date().toISOString(),
      rowCount: data.length,
      columnCount: data.length > 0 ? Object.keys(data[0]).length : 0
    };
    
    if (structure === 'array') {
      jsonData = { metadata, data };
    } else {
      jsonData.metadata = metadata;
    }
  }
  
  return pretty 
    ? JSON.stringify(jsonData, null, 2)
    : JSON.stringify(jsonData);
}

export function downloadJSON(data, filename = 'export.json', options = {}) {
  try {
    const jsonString = convertToJSON(data, options);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    saveAs(blob, filename);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function copyToClipboard(data, options = {}) {
  try {
    const jsonString = convertToJSON(data, options);
    navigator.clipboard.writeText(jsonString);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function downloadCSV(data, filename = 'export.csv') {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    
    // Get headers from first row
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (value == null) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getExportFilename(originalFilename, suffix = '', extension = 'json') {
  if (!originalFilename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `export_${timestamp}${suffix}.${extension}`;
  }
  
  // Remove extension from original filename
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}${suffix}.${extension}`;
}
