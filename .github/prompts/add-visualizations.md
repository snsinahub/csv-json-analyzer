Goal:
Enhance the CSV Analyzer web application to dynamically generate and display interactive data visualizations based on uploaded CSV files, providing users with visual insights through charts and graphs.

Context:
The current application analyzes CSV data and provides statistical insights, but lacks visual representation of the data. Users need to see their data visualized through charts to better understand patterns, trends, and distributions. The visualization system should be intelligent enough to automatically determine which chart types are most appropriate based on the detected field types and data patterns, while also allowing users to explore all available visualization options.

The application already has:
- Dynamic CSV analysis with field type detection
- Pattern recognition for different CSV structures
- Business insights generation
- Data quality metrics

Now we need to add interactive visualizations that complement these analytical features.

Requirements:
- Integrate a charting library (Chart.js or Recharts) into the Next.js application
- Create a new visualization engine that:
  - Analyzes uploaded CSV data to determine optimal chart types
  - Generates appropriate datasets for each visualization type
  - Renders charts dynamically based on detected data patterns
  
- Implement 5 core visualization types:
  1. **Time Series Chart**: For date fields with numeric values over time
  2. **Pie Chart**: For categorical data distribution (top 5-10 categories)
  3. **Bar Chart**: For comparing numeric values across categories
  4. **Histogram**: For showing distribution of numeric values
  5. **Scatter Plot**: For exploring correlations between two numeric fields
  
- Display visualizations on the homepage after CSV upload:
  - Show relevant charts automatically based on data
  - Display all chart details (title, legend, axes labels)
  - Make charts responsive and interactive
  - Allow users to toggle between different chart views
  - Provide download/export options for charts
  
- Smart chart selection logic:
  - If CSV has date + numeric fields → show Time Series Chart
  - If CSV has category fields → show Pie Chart and Bar Chart
  - If CSV has numeric fields → show Histogram
  - If CSV has 2+ numeric fields → show Scatter Plot option
  - Display only relevant charts based on data structure

- Visual enhancements:
  - Add a dedicated "Visualizations" section on the homepage
  - Use tabs or cards to organize different chart types
  - Show chart loading states
  - Add tooltips for interactive data points
  - Include chart configuration options (colors, labels, etc.)
  - Make charts responsive for mobile devices

Constraints:
- Must use a React-compatible charting library (Chart.js with react-chartjs-2 OR Recharts)
- Charts must render client-side without additional API calls
- Performance: Handle datasets up to 10,000 rows efficiently
- Charts must be responsive and mobile-friendly
- Must maintain existing upload and analysis functionality
- Use existing Bootstrap styling for consistency
- TypeScript types must be properly defined for all chart data
- Charts should automatically update when new CSV is uploaded
- Memory efficient: Don't duplicate large datasets unnecessarily

Output Format:
- Install charting library:
  - `npm install chart.js react-chartjs-2` OR `npm install recharts`
  - Install types: `npm install --save-dev @types/chart.js` (if using Chart.js)

- Create new utility file `src/lib/chart-utils.ts`:
  - Add types: `ChartData`, `ChartConfig`, `VisualizationType`
  - Add function: `generateChartData(csvData, chartType)` - Prepares data for specific chart
  - Add function: `detectAvailableCharts(dynamicReport)` - Determines which charts to show
  - Add function: `prepareTimeSeriesData()`, `preparePieChartData()`, etc.

- Create visualization components in `src/components/`:
  - `TimeSeriesChart.tsx` - Line/area chart for time-based data
  - `PieChartComponent.tsx` - Pie chart for category distribution
  - `BarChartComponent.tsx` - Bar chart for categorical comparisons
  - `HistogramChart.tsx` - Histogram for numeric distributions
  - `ScatterPlotChart.tsx` - Scatter plot for correlations
  - `VisualizationPanel.tsx` - Container component managing all charts

- Update `src/app/page.tsx`:
  - Add visualization state management
  - Import and render VisualizationPanel component
  - Add chart selection/toggle functionality
  - Position visualizations after dynamic report section

- Add styling in `src/app/globals.css`:
  - Chart container styles
  - Responsive chart layouts
  - Tab/card styles for chart organization
  - Loading spinner for charts

Checks:
- [x] Charting library installed (Chart.js or Recharts)
- [x] Chart utility functions created in chart-utils.ts
- [x] TypeScript types defined for chart data structures
- [x] Time Series Chart component created and working
- [x] Pie Chart component created and working
- [x] Bar Chart component created and working
- [x] Histogram component created and working
- [x] Scatter Plot component created and working
- [x] VisualizationPanel container component created
- [x] Smart chart detection implemented (shows only relevant charts)
- [x] Charts display correctly on homepage after upload
- [x] Charts are responsive on mobile devices
- [x] Interactive tooltips working on hover
- [x] Chart legends display correctly
- [x] Axes labels are clear and properly formatted
- [x] Charts handle large datasets (5000+ rows) efficiently
- [x] Charts update automatically when new CSV uploaded
- [x] Loading states shown while generating charts
- [x] Charts can be toggled/switched between views
- [x] Chart colors are visually appealing and accessible
- [x] All chart details visible (title, labels, data points)
- [x] Existing CSV analysis functionality preserved
- [x] No TypeScript errors
- [x] Charts work with various CSV structures (orders, sales, generic data)

Examples of Expected Visualizations:
For orders.csv:
- Time Series: Orders over time (order_date vs quantity/price)
- Pie Chart: Product category distribution
- Bar Chart: Sales by country or category
- Histogram: Price distribution
- Scatter Plot: Quantity vs Price correlation

For sales.csv:
- Time Series: Revenue trend over months
- Pie Chart: Sales by region
- Bar Chart: Top performing products
- Histogram: Deal size distribution
- Scatter Plot: Sales amount vs discount relationship
