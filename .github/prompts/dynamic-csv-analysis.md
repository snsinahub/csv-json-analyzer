Goal:
Enhance the web application to dynamically analyze uploaded CSV files and generate comprehensive analytical reports directly on the homepage, with intelligent field detection and context-aware insights.

Context:
The current web application displays basic statistics (row count, column count, data types) when a CSV is uploaded. We need to enhance it to provide deeper, dynamic analysis based on the actual fields detected in the CSV file. For example:
- If the CSV contains date fields, show date range analysis
- If it contains category fields, show distribution and counts
- If it contains numeric fields, show statistical analysis (sum, average, min, max)
- If it contains customer/ID fields, show unique counts
- Automatically detect business metrics based on common field patterns

The analysis should be intelligent and adapt to any CSV structure, not just order data.

Requirements:
- Enhance the homepage (`src/app/page.tsx`) to display dynamic analysis results
- Create a new utility function in `src/lib/csv-utils.ts` called `generateDynamicReport(csvData)` that:
  - Automatically detects field types (dates, categories, IDs, numeric values, text)
  - Identifies common business patterns (orders, customers, transactions, products, etc.)
  - Generates context-aware insights based on detected patterns
  - Returns structured report data with metrics, charts suggestions, and key findings
  
- Display the dynamic report on the homepage below the current statistics section with:
  - **Key Metrics Card**: Highlight the most important insights
  - **Field Analysis Section**: Show detailed analysis for each detected field type
  - **Business Insights**: Display auto-generated insights (e.g., "Top selling category", "Most active customer")
  - **Data Quality**: Show completeness, duplicates, and data quality metrics
  - **Visualizations Suggestions**: Recommend chart types based on data patterns
  
- Support intelligent pattern detection for common CSV types:
  - E-commerce orders (order_id, customer_id, product, price, date, quantity)
  - Sales data (date, amount, region, sales_rep, product)
  - Customer data (customer_id, name, email, registration_date, status)
  - Inventory data (product_id, sku, quantity, location, category)
  - Transaction logs (transaction_id, timestamp, amount, type, status)
  - Generic CSV files (provide general analysis)

- Add visual enhancements:
  - Progress indicators during analysis
  - Collapsible sections for detailed metrics
  - Color-coded insights (green for positive, yellow for warnings, red for issues)
  - Icons for different metric types
  - Responsive cards layout using Bootstrap

Constraints:
- Must work with any CSV structure, not just predefined formats
- Analysis must be performed client-side without additional API calls
- Must maintain existing upload and preview functionality
- Performance: Handle files up to 10,000 rows efficiently
- Must be mobile-responsive
- Use existing Bootstrap styling for consistency
- TypeScript types must be properly defined

Output Format:
- Update `src/lib/csv-utils.ts`:
  - Add `generateDynamicReport(csvData: CSVData)` function
  - Add types: `DynamicReport`, `FieldAnalysis`, `BusinessInsight`, `DataQualityMetrics`
  - Add helper functions for pattern detection
  
- Update `src/app/page.tsx`:
  - Add dynamic report state management
  - Create new component sections for report display
  - Add collapsible/expandable sections
  - Implement smooth transitions and loading states
  
- Create new components (optional):
  - `src/components/DynamicReport.tsx` - Main report component
  - `src/components/FieldAnalysisCard.tsx` - Individual field analysis
  - `src/components/InsightsPanel.tsx` - Business insights display

Checks:
- [ ] `generateDynamicReport()` function created in csv-utils.ts
- [ ] Automatic field type detection implemented (dates, numbers, categories, IDs, text)
- [ ] Pattern recognition for common CSV types (orders, sales, customers, etc.)
- [ ] Key metrics section displays on homepage after upload
- [ ] Field-by-field detailed analysis shown
- [ ] Business insights auto-generated based on data patterns
- [ ] Data quality metrics displayed (completeness, duplicates, nulls)
- [ ] Visualization recommendations provided
- [ ] Date range analysis for date fields
- [ ] Category distribution for categorical fields
- [ ] Statistical analysis for numeric fields (sum, avg, min, max, median)
- [ ] Unique value counts for ID/identifier fields
- [ ] Top values/frequency analysis for appropriate fields
- [ ] Collapsible sections implemented for detailed views
- [ ] Color-coded insights (green/yellow/red)
- [ ] Icons added for visual clarity
- [ ] Responsive design maintained
- [ ] Loading states during analysis
- [ ] Handles large files (5000+ rows) without performance issues
- [ ] TypeScript types properly defined
- [ ] Works with various CSV structures (not just orders)
- [ ] Existing upload and preview functionality preserved

Examples of Dynamic Insights:
- "15 orders from 13 unique customers across 6 countries"
- "Sales peaked on 2025-10-03 with 4 orders"
- "Electronics is the top category (40% of orders)"
- "Average order value: $245.67"
- "Data quality: 100% complete, 0 duplicates"
- "Recommended charts: Time series for order trends, Pie chart for category distribution"
