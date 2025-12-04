Goal:
Create a CLI script to analyze the orders.csv file and provide business insights about order statistics, customer behavior, and product distribution.

Context:
The orders.csv file contains e-commerce order data with the following columns:
- order_id: Unique identifier for each order
- customer_id: Unique identifier for each customer
- order_date: Date when the order was placed
- ship_country: Country where the order is shipped
- product_category: Category of the product ordered
- quantity: Number of items ordered
- unit_price_usd: Price per unit in USD
- discount_pct: Discount percentage applied
- payment_method: Payment method used

Requirements:
- Create a new CLI script in the `scripts/` directory named `analyze-orders.js`
- The script should analyze `data/orders.csv` and display the following metrics:
  - Total number of orders
  - Number of unique customers
  - Order date range (first order date, last order date)
  - Number of countries you ship to
  - Number of product categories
- Display the results in a clear, formatted output
- Use the existing CSV utilities from `src/lib/csv-utils.ts` if applicable
- Follow the same pattern as existing CLI scripts (analyze.js, csv-to-json.js, generate-csv.js)
- Add colored terminal output for better readability
- Include usage documentation in the script comments

Constraints:
- Must use Node.js and the papaparse library
- Script should be executable from command line
- Must handle file not found errors gracefully
- Output should be human-readable and well-formatted
- Should work with the existing project structure

Output Format:
- Create `scripts/analyze-orders.js` with:
  - Shebang line: `#!/usr/bin/env node`
  - Usage documentation in comments
  - Main analysis function
  - Formatted console output with colors
- Add npm script to package.json: `"analyze-orders": "node scripts/analyze-orders.js"`
- Update `scripts/README.md` with documentation for the new script

Checks:
- [x] Script created in scripts/analyze-orders.js
- [x] Script displays total number of orders
- [x] Script shows number of unique customers
- [x] Script shows order date range (first and last order date)
- [x] Script shows number of countries shipped to
- [x] Script shows number of product categories
- [x] Script uses colored output for readability
- [x] Script handles errors gracefully
- [x] npm script added to package.json
- [x] Documentation updated in scripts/README.md
- [x] Script can be run with: npm run analyze-orders
