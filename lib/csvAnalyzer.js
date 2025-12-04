/**
 * CSV Dynamic Analyzer
 * Intelligently analyzes CSV data and generates comprehensive reports
 */

/**
 * Detect the type of a field based on its values
 * @param {Array} values - Array of values from a column
 * @param {string} fieldName - Name of the field
 * @returns {Object} Field type information
 */
function detectFieldType(values, fieldName) {
  const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonEmptyValues.length === 0) {
    return { type: 'empty', confidence: 1 };
  }

  const lowerFieldName = fieldName.toLowerCase();
  
  // Check for ID fields
  if (lowerFieldName.includes('id') || lowerFieldName === 'sku') {
    const uniqueRatio = new Set(nonEmptyValues).size / nonEmptyValues.length;
    if (uniqueRatio > 0.8) {
      return { type: 'id', confidence: 0.9 };
    }
  }

  // Check for dates
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}/, // DD-MM-YYYY
  ];
  
  const dateCount = nonEmptyValues.filter(v => 
    datePatterns.some(pattern => pattern.test(v)) || !isNaN(Date.parse(v))
  ).length;
  
  if (dateCount / nonEmptyValues.length > 0.8) {
    return { type: 'date', confidence: dateCount / nonEmptyValues.length };
  }

  // Check for numeric values
  const numericValues = nonEmptyValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
  const numericRatio = numericValues.length / nonEmptyValues.length;
  
  if (numericRatio > 0.9) {
    // Determine if it's currency, percentage, or general numeric
    if (lowerFieldName.includes('price') || lowerFieldName.includes('amount') || 
        lowerFieldName.includes('cost') || lowerFieldName.includes('salary')) {
      return { type: 'currency', confidence: 0.95 };
    }
    if (lowerFieldName.includes('percent') || lowerFieldName.includes('rate')) {
      return { type: 'percentage', confidence: 0.95 };
    }
    if (lowerFieldName.includes('quantity') || lowerFieldName.includes('count')) {
      return { type: 'integer', confidence: 0.9 };
    }
    return { type: 'numeric', confidence: numericRatio };
  }

  // Check for email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailCount = nonEmptyValues.filter(v => emailPattern.test(v)).length;
  if (emailCount / nonEmptyValues.length > 0.8) {
    return { type: 'email', confidence: emailCount / nonEmptyValues.length };
  }

  // Check for categories (low unique values relative to total)
  const uniqueValues = new Set(nonEmptyValues);
  const uniqueRatio = uniqueValues.size / nonEmptyValues.length;
  
  if (uniqueRatio < 0.1 && uniqueValues.size < 50) {
    return { type: 'category', confidence: 1 - uniqueRatio };
  }

  // Default to text
  return { type: 'text', confidence: 0.5 };
}

/**
 * Analyze a single field in detail
 * @param {Array} values - Array of values from a column
 * @param {string} fieldName - Name of the field
 * @param {Object} typeInfo - Field type information
 * @returns {Object} Detailed field analysis
 */
function analyzeField(values, fieldName, typeInfo) {
  const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const totalCount = values.length;
  const nullCount = totalCount - nonEmptyValues.length;
  const uniqueCount = new Set(nonEmptyValues).size;

  const analysis = {
    fieldName,
    type: typeInfo.type,
    totalCount,
    nullCount,
    uniqueCount,
    completeness: ((nonEmptyValues.length / totalCount) * 100).toFixed(1),
  };

  // Type-specific analysis
  switch (typeInfo.type) {
    case 'numeric':
    case 'currency':
    case 'percentage':
    case 'integer':
      const numericValues = nonEmptyValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (numericValues.length > 0) {
        const sorted = [...numericValues].sort((a, b) => a - b);
        const sum = numericValues.reduce((a, b) => a + b, 0);
        analysis.min = sorted[0];
        analysis.max = sorted[sorted.length - 1];
        analysis.avg = sum / numericValues.length;
        analysis.sum = sum;
        analysis.median = sorted[Math.floor(sorted.length / 2)];
      }
      break;

    case 'date':
      const dates = nonEmptyValues.map(v => new Date(v)).filter(d => !isNaN(d));
      if (dates.length > 0) {
        const sortedDates = dates.sort((a, b) => a - b);
        analysis.earliest = sortedDates[0].toISOString().split('T')[0];
        analysis.latest = sortedDates[sortedDates.length - 1].toISOString().split('T')[0];
        analysis.range = Math.ceil((sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24));
      }
      break;

    case 'category':
      const frequencies = {};
      nonEmptyValues.forEach(v => {
        frequencies[v] = (frequencies[v] || 0) + 1;
      });
      const topCategories = Object.entries(frequencies)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([value, count]) => ({ value, count, percentage: ((count / nonEmptyValues.length) * 100).toFixed(1) }));
      analysis.topValues = topCategories;
      analysis.distribution = frequencies;
      break;

    case 'id':
      const duplicates = totalCount - uniqueCount;
      analysis.duplicates = duplicates;
      analysis.uniqueRatio = ((uniqueCount / totalCount) * 100).toFixed(1);
      break;

    case 'email':
      const domains = {};
      nonEmptyValues.forEach(email => {
        const domain = email.split('@')[1];
        if (domain) {
          domains[domain] = (domains[domain] || 0) + 1;
        }
      });
      analysis.topDomains = Object.entries(domains)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([domain, count]) => ({ domain, count }));
      break;

    default:
      // Text analysis
      if (uniqueCount < 20) {
        const frequencies = {};
        nonEmptyValues.forEach(v => {
          frequencies[v] = (frequencies[v] || 0) + 1;
        });
        analysis.topValues = Object.entries(frequencies)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }));
      }
  }

  return analysis;
}

/**
 * Detect business pattern in the CSV data
 * @param {Object} fieldTypes - Map of field names to their types
 * @returns {string} Detected business pattern
 */
function detectBusinessPattern(fieldTypes) {
  const fieldNames = Object.keys(fieldTypes).map(f => f.toLowerCase());
  const types = Object.values(fieldTypes).map(t => t.type);

  // E-commerce orders
  if (fieldNames.some(f => f.includes('order')) && 
      fieldNames.some(f => f.includes('customer')) &&
      (fieldNames.some(f => f.includes('product')) || fieldNames.some(f => f.includes('category')))) {
    return 'ecommerce_orders';
  }

  // Sales data
  if (fieldNames.some(f => f.includes('sale')) || 
      (fieldNames.some(f => f.includes('amount') || f.includes('revenue')) && 
       fieldNames.some(f => f.includes('date')))) {
    return 'sales_data';
  }

  // Customer data
  if (fieldNames.some(f => f.includes('customer')) && 
      (fieldNames.some(f => f.includes('email')) || fieldNames.some(f => f.includes('name')))) {
    return 'customer_data';
  }

  // Inventory data
  if ((fieldNames.some(f => f.includes('product')) || fieldNames.some(f => f.includes('sku'))) &&
      (fieldNames.some(f => f.includes('quantity')) || fieldNames.some(f => f.includes('stock')))) {
    return 'inventory_data';
  }

  // Transaction logs
  if (fieldNames.some(f => f.includes('transaction')) || 
      (fieldNames.some(f => f.includes('timestamp') || f.includes('date')) && 
       fieldNames.some(f => f.includes('amount')))) {
    return 'transaction_logs';
  }

  return 'generic';
}

/**
 * Generate business insights based on data pattern
 * @param {Array} data - Parsed CSV data
 * @param {Object} fieldAnalyses - Map of field analyses
 * @param {string} pattern - Detected business pattern
 * @returns {Array} Array of insight objects
 */
function generateBusinessInsights(data, fieldAnalyses, pattern) {
  const insights = [];

  // Data quality insight
  const completenessValues = Object.values(fieldAnalyses).map(f => parseFloat(f.completeness));
  const avgCompleteness = completenessValues.reduce((a, b) => a + b, 0) / completenessValues.length;
  
  if (avgCompleteness === 100) {
    insights.push({
      type: 'success',
      icon: 'check circle',
      text: `Data quality: 100% complete with no missing values`,
      priority: 'high'
    });
  } else if (avgCompleteness >= 90) {
    insights.push({
      type: 'success',
      icon: 'check circle',
      text: `Data quality: ${avgCompleteness.toFixed(1)}% complete - excellent data quality`,
      priority: 'high'
    });
  } else {
    insights.push({
      type: 'warning',
      icon: 'exclamation triangle',
      text: `Data quality: ${avgCompleteness.toFixed(1)}% complete - some fields have missing values`,
      priority: 'high'
    });
  }

  // Pattern-specific insights
  switch (pattern) {
    case 'ecommerce_orders':
      // Find customer and order fields
      const customerField = Object.keys(fieldAnalyses).find(f => f.toLowerCase().includes('customer'));
      const orderField = Object.keys(fieldAnalyses).find(f => f.toLowerCase().includes('order'));
      const categoryField = Object.keys(fieldAnalyses).find(f => f.toLowerCase().includes('category'));
      const countryField = Object.keys(fieldAnalyses).find(f => f.toLowerCase().includes('country'));
      const dateField = Object.keys(fieldAnalyses).find(f => fieldAnalyses[f].type === 'date');

      if (customerField && orderField) {
        const uniqueCustomers = fieldAnalyses[customerField].uniqueCount;
        const totalOrders = fieldAnalyses[orderField].totalCount;
        const uniqueCountries = countryField ? fieldAnalyses[countryField].uniqueCount : null;
        
        let text = `${totalOrders} orders from ${uniqueCustomers} unique customer${uniqueCustomers !== 1 ? 's' : ''}`;
        if (uniqueCountries) {
          text += ` across ${uniqueCountries} ${uniqueCountries !== 1 ? 'countries' : 'country'}`;
        }
        
        insights.push({
          type: 'info',
          icon: 'shopping cart',
          text,
          priority: 'high'
        });
      }

      if (categoryField && fieldAnalyses[categoryField].topValues) {
        const topCategory = fieldAnalyses[categoryField].topValues[0];
        insights.push({
          type: 'info',
          icon: 'star',
          text: `${topCategory.value} is the top category (${topCategory.percentage}% of orders)`,
          priority: 'medium'
        });
      }

      if (dateField && fieldAnalyses[dateField].latest) {
        insights.push({
          type: 'info',
          icon: 'calendar',
          text: `Order date range: ${fieldAnalyses[dateField].earliest} to ${fieldAnalyses[dateField].latest} (${fieldAnalyses[dateField].range} days)`,
          priority: 'medium'
        });
      }
      break;

    case 'sales_data':
      const amountField = Object.keys(fieldAnalyses).find(f => 
        f.toLowerCase().includes('amount') || f.toLowerCase().includes('revenue') || f.toLowerCase().includes('price')
      );
      
      if (amountField && fieldAnalyses[amountField].avg) {
        insights.push({
          type: 'success',
          icon: 'dollar',
          text: `Average transaction value: $${fieldAnalyses[amountField].avg.toFixed(2)}`,
          priority: 'high'
        });
        
        insights.push({
          type: 'info',
          icon: 'chart line',
          text: `Total revenue: $${fieldAnalyses[amountField].sum.toFixed(2)} (Range: $${fieldAnalyses[amountField].min} - $${fieldAnalyses[amountField].max})`,
          priority: 'medium'
        });
      }
      break;

    case 'customer_data':
      const emailField = Object.keys(fieldAnalyses).find(f => fieldAnalyses[f].type === 'email');
      
      if (emailField && fieldAnalyses[emailField].topDomains) {
        const topDomain = fieldAnalyses[emailField].topDomains[0];
        insights.push({
          type: 'info',
          icon: 'mail',
          text: `Top email domain: ${topDomain.domain} (${topDomain.count} customers)`,
          priority: 'medium'
        });
      }
      break;
  }

  // Check for duplicates
  const idFields = Object.entries(fieldAnalyses).filter(([, analysis]) => analysis.type === 'id');
  idFields.forEach(([fieldName, analysis]) => {
    if (analysis.duplicates > 0) {
      insights.push({
        type: 'warning',
        icon: 'copy',
        text: `${analysis.duplicates} duplicate ${fieldName} value${analysis.duplicates !== 1 ? 's' : ''} detected`,
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'success',
        icon: 'check',
        text: `All ${fieldName} values are unique`,
        priority: 'low'
      });
    }
  });

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate visualization recommendations
 * @param {Object} fieldAnalyses - Map of field analyses
 * @param {string} pattern - Detected business pattern
 * @returns {Array} Array of chart recommendations
 */
function generateVisualizationRecommendations(fieldAnalyses, pattern) {
  const recommendations = [];

  const dateFields = Object.entries(fieldAnalyses).filter(([, a]) => a.type === 'date');
  const numericFields = Object.entries(fieldAnalyses).filter(([, a]) => 
    ['numeric', 'currency', 'integer'].includes(a.type)
  );
  const categoryFields = Object.entries(fieldAnalyses).filter(([, a]) => a.type === 'category');

  // Time series for date + numeric
  if (dateFields.length > 0 && numericFields.length > 0) {
    recommendations.push({
      type: 'Line Chart',
      purpose: `Track ${numericFields[0][0]} trends over time`,
      fields: [dateFields[0][0], numericFields[0][0]]
    });
  }

  // Pie/Bar chart for categories
  if (categoryFields.length > 0) {
    recommendations.push({
      type: 'Pie Chart',
      purpose: `Show distribution of ${categoryFields[0][0]}`,
      fields: [categoryFields[0][0]]
    });
    
    recommendations.push({
      type: 'Bar Chart',
      purpose: `Compare values across ${categoryFields[0][0]}`,
      fields: [categoryFields[0][0]]
    });
  }

  // Histogram for numeric distributions
  if (numericFields.length > 0) {
    recommendations.push({
      type: 'Histogram',
      purpose: `Analyze distribution of ${numericFields[0][0]}`,
      fields: [numericFields[0][0]]
    });
  }

  // Scatter plot for two numeric fields
  if (numericFields.length >= 2) {
    recommendations.push({
      type: 'Scatter Plot',
      purpose: `Explore relationship between ${numericFields[0][0]} and ${numericFields[1][0]}`,
      fields: [numericFields[0][0], numericFields[1][0]]
    });
  }

  return recommendations.slice(0, 4); // Return top 4 recommendations
}

/**
 * Main function to generate comprehensive dynamic report
 * @param {Array} csvData - Parsed CSV data
 * @returns {Object} Complete dynamic analysis report
 */
export function generateDynamicReport(csvData) {
  if (!csvData || csvData.length === 0) {
    return { error: 'No data to analyze' };
  }

  const startTime = Date.now();
  
  // Get field names
  const fields = Object.keys(csvData[0]);
  
  // Detect field types
  const fieldTypes = {};
  fields.forEach(field => {
    const values = csvData.map(row => row[field]);
    fieldTypes[field] = detectFieldType(values, field);
  });

  // Analyze each field in detail
  const fieldAnalyses = {};
  fields.forEach(field => {
    const values = csvData.map(row => row[field]);
    fieldAnalyses[field] = analyzeField(values, field, fieldTypes[field]);
  });

  // Detect business pattern
  const pattern = detectBusinessPattern(fieldTypes);

  // Generate business insights
  const insights = generateBusinessInsights(csvData, fieldAnalyses, pattern);

  // Generate visualization recommendations
  const visualizationRecommendations = generateVisualizationRecommendations(fieldAnalyses, pattern);

  // Calculate data quality metrics
  const totalFields = fields.length;
  const totalCells = csvData.length * fields.length;
  const nullCells = Object.values(fieldAnalyses).reduce((sum, f) => sum + f.nullCount, 0);
  const completeness = ((totalCells - nullCells) / totalCells * 100).toFixed(1);

  const processingTime = Date.now() - startTime;

  return {
    summary: {
      rowCount: csvData.length,
      columnCount: fields.length,
      pattern,
      completeness: parseFloat(completeness),
      processingTime
    },
    fieldAnalyses,
    insights,
    visualizationRecommendations,
    dataQuality: {
      totalCells,
      completeCells: totalCells - nullCells,
      nullCells,
      completeness: parseFloat(completeness),
      fields: totalFields
    }
  };
}
