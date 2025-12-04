/**
 * Chart Utilities
 * Functions for preparing CSV data for visualization
 */

/**
 * Detect which charts are available based on the dynamic report
 * @param {Object} dynamicReport - The dynamic analysis report
 * @returns {Array} Array of available chart types
 */
export function detectAvailableCharts(dynamicReport) {
  if (!dynamicReport || !dynamicReport.fieldAnalyses) {
    return [];
  }

  const availableCharts = [];
  const fieldAnalyses = Object.values(dynamicReport.fieldAnalyses);
  
  const dateFields = fieldAnalyses.filter(f => f.type === 'date');
  const numericFields = fieldAnalyses.filter(f => 
    ['numeric', 'currency', 'integer', 'percentage'].includes(f.type)
  );
  const categoryFields = fieldAnalyses.filter(f => f.type === 'category');

  // Time Series: needs at least one date field and one numeric field
  if (dateFields.length > 0 && numericFields.length > 0) {
    availableCharts.push({
      type: 'timeSeries',
      name: 'Time Series',
      icon: 'chart line',
      description: 'Track trends over time',
      fields: {
        date: dateFields[0].fieldName,
        value: numericFields[0].fieldName
      }
    });
  }

  // Pie Chart: needs category fields
  if (categoryFields.length > 0) {
    availableCharts.push({
      type: 'pie',
      name: 'Pie Chart',
      icon: 'chart pie',
      description: 'Show category distribution',
      fields: {
        category: categoryFields[0].fieldName
      }
    });
  }

  // Bar Chart: needs category fields (can also use numeric for comparison)
  if (categoryFields.length > 0) {
    availableCharts.push({
      type: 'bar',
      name: 'Bar Chart',
      icon: 'chart bar',
      description: 'Compare values across categories',
      fields: {
        category: categoryFields[0].fieldName,
        value: numericFields.length > 0 ? numericFields[0].fieldName : null
      }
    });
  }

  // Histogram: needs numeric fields
  if (numericFields.length > 0) {
    availableCharts.push({
      type: 'histogram',
      name: 'Histogram',
      icon: 'chart bar',
      description: 'Show distribution of values',
      fields: {
        value: numericFields[0].fieldName
      }
    });
  }

  // Scatter Plot: needs at least 2 numeric fields
  if (numericFields.length >= 2) {
    availableCharts.push({
      type: 'scatter',
      name: 'Scatter Plot',
      icon: 'circle',
      description: 'Explore correlations',
      fields: {
        x: numericFields[0].fieldName,
        y: numericFields[1].fieldName
      }
    });
  }

  return availableCharts;
}

/**
 * Prepare data for time series chart
 * @param {Array} csvData - Raw CSV data
 * @param {string} dateField - Name of the date field
 * @param {string} valueField - Name of the numeric field
 * @returns {Array} Formatted data for time series
 */
export function prepareTimeSeriesData(csvData, dateField, valueField) {
  const data = csvData
    .map(row => ({
      date: new Date(row[dateField]),
      dateStr: row[dateField],
      value: parseFloat(row[valueField]) || 0,
      rawRow: row
    }))
    .filter(item => !isNaN(item.date.getTime()) && !isNaN(item.value))
    .sort((a, b) => a.date - b.date);

  // Aggregate by date if there are multiple entries per date
  const aggregated = {};
  data.forEach(item => {
    const dateKey = item.dateStr;
    if (!aggregated[dateKey]) {
      aggregated[dateKey] = {
        date: dateKey,
        total: 0,
        count: 0,
        values: []
      };
    }
    aggregated[dateKey].total += item.value;
    aggregated[dateKey].count += 1;
    aggregated[dateKey].values.push(item.value);
  });

  return Object.values(aggregated).map(item => ({
    date: item.date,
    value: item.total,
    average: item.total / item.count,
    count: item.count
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Prepare data for pie chart
 * @param {Array} csvData - Raw CSV data
 * @param {string} categoryField - Name of the category field
 * @param {number} maxSlices - Maximum number of slices (default 10)
 * @returns {Array} Formatted data for pie chart
 */
export function preparePieChartData(csvData, categoryField, maxSlices = 10) {
  const frequencies = {};
  
  csvData.forEach(row => {
    const category = row[categoryField] || 'Unknown';
    frequencies[category] = (frequencies[category] || 0) + 1;
  });

  const sorted = Object.entries(frequencies)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxSlices);

  const total = sorted.reduce((sum, [, count]) => sum + count, 0);

  return sorted.map(([name, value]) => ({
    name,
    value,
    percentage: ((value / total) * 100).toFixed(1)
  }));
}

/**
 * Prepare data for bar chart
 * @param {Array} csvData - Raw CSV data
 * @param {string} categoryField - Name of the category field
 * @param {string} valueField - Name of the numeric field (optional)
 * @param {number} maxBars - Maximum number of bars (default 15)
 * @returns {Array} Formatted data for bar chart
 */
export function prepareBarChartData(csvData, categoryField, valueField = null, maxBars = 15) {
  if (!valueField) {
    // Count frequency if no value field provided
    return preparePieChartData(csvData, categoryField, maxBars);
  }

  const aggregated = {};
  
  csvData.forEach(row => {
    const category = row[categoryField] || 'Unknown';
    const value = parseFloat(row[valueField]) || 0;
    
    if (!aggregated[category]) {
      aggregated[category] = {
        total: 0,
        count: 0,
        values: []
      };
    }
    
    aggregated[category].total += value;
    aggregated[category].count += 1;
    aggregated[category].values.push(value);
  });

  const result = Object.entries(aggregated)
    .map(([name, data]) => ({
      name,
      value: data.total,
      average: data.total / data.count,
      count: data.count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxBars);

  return result;
}

/**
 * Prepare data for histogram
 * @param {Array} csvData - Raw CSV data
 * @param {string} valueField - Name of the numeric field
 * @param {number} bins - Number of bins (default 10)
 * @returns {Array} Formatted data for histogram
 */
export function prepareHistogramData(csvData, valueField, bins = 10) {
  const values = csvData
    .map(row => parseFloat(row[valueField]))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return [];
  }

  const min = values[0];
  const max = values[values.length - 1];
  const range = max - min;
  const binSize = range / bins;

  const histogram = Array(bins).fill(0).map((_, i) => ({
    range: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
    rangeStart: min + i * binSize,
    rangeEnd: min + (i + 1) * binSize,
    count: 0
  }));

  values.forEach(value => {
    let binIndex = Math.floor((value - min) / binSize);
    if (binIndex >= bins) binIndex = bins - 1; // Handle max value
    if (binIndex < 0) binIndex = 0;
    histogram[binIndex].count++;
  });

  return histogram;
}

/**
 * Prepare data for scatter plot
 * @param {Array} csvData - Raw CSV data
 * @param {string} xField - Name of the X-axis field
 * @param {string} yField - Name of the Y-axis field
 * @param {number} maxPoints - Maximum number of points (default 1000)
 * @returns {Array} Formatted data for scatter plot
 */
export function prepareScatterPlotData(csvData, xField, yField, maxPoints = 1000) {
  const data = csvData
    .map(row => ({
      x: parseFloat(row[xField]),
      y: parseFloat(row[yField]),
      rawRow: row
    }))
    .filter(item => !isNaN(item.x) && !isNaN(item.y));

  // Sample if too many points
  if (data.length > maxPoints) {
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  }

  return data;
}

/**
 * Generate color palette for charts
 * @param {number} count - Number of colors needed
 * @returns {Array} Array of color hex codes
 */
export function generateColorPalette(count) {
  const baseColors = [
    '#667eea', // Purple
    '#764ba2', // Dark purple
    '#f093fb', // Pink
    '#4facfe', // Blue
    '#00f2fe', // Cyan
    '#43e97b', // Green
    '#38f9d7', // Teal
    '#fa709a', // Rose
    '#fee140', // Yellow
    '#30cfd0', // Turquoise
    '#a8edea', // Light cyan
    '#fed6e3', // Light pink
    '#ff9a9e', // Coral
    '#fecfef', // Light purple
    '#ffecd2', // Peach
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

/**
 * Format number for display
 * @param {number} value - Number to format
 * @param {string} type - Type of formatting (currency, percentage, number)
 * @returns {string} Formatted number
 */
export function formatNumber(value, type = 'number') {
  if (type === 'currency') {
    return `$${value.toFixed(2)}`;
  }
  if (type === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
}
