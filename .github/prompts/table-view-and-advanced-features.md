# CSV Table View and Advanced Features

## Goal
Enhance the CSV Analyzer web application with advanced data manipulation features including tabular display with pagination, JSON export, inline CSV editing, and schema-based CSV generation capabilities.

## Context
The current application successfully analyzes and visualizes CSV data, but users need more interactive features to work with their data. This enhancement will add:
- A full-featured data table with pagination for viewing large CSV files
- Export functionality to convert CSV data to JSON format
- Inline editing capabilities for uploaded CSV files
- A schema designer to create new CSV files from scratch

These features will transform the application from a read-only analyzer into a full-featured CSV data management tool.

## Requirements

### 1. Tabular Display with Pagination
- Create a new "Table View" tab/section on the analyze page
- Display uploaded CSV data in a responsive data table
- Implement pagination:
  - Configurable rows per page (10, 25, 50, 100)
  - Page navigation controls (First, Previous, Next, Last)
  - Display current page info (e.g., "Showing 1-25 of 150 rows")
  - Jump to specific page number
- Table features:
  - Sortable columns (ascending/descending)
  - Column filtering/search
  - Fixed header that stays visible while scrolling
  - Highlight row on hover
  - Responsive design for mobile devices
  - Show column data types (from field analysis)
  - Display total row count

### 2. JSON Export Functionality
- Add "Export to JSON" button in the table view
- Export options:
  - Download as formatted JSON file
  - Copy JSON to clipboard
  - Choose between array of objects or nested structure
  - Option to include only visible/filtered rows or all rows
- JSON format options:
  - Pretty-printed (indented) or minified
  - Include metadata (column types, row count, export date)
- Show export success notification
- Handle large files efficiently (stream for files >5000 rows)

### 3. Inline CSV Editing
- Add "Edit Mode" toggle button in table view
- Editing features:
  - Click cell to edit value inline
  - Add new row button
  - Delete row button (with confirmation)
  - Duplicate row functionality
  - Undo/Redo support for recent changes
  - Show edited cells with visual indicator (highlight/badge)
  - Validate data types during editing (warn if incorrect type)
- Edit actions:
  - "Save Changes" button to download modified CSV
  - "Discard Changes" to revert to original
  - Show count of modified cells
  - Preserve original file name with "_edited" suffix
- Data validation:
  - Maintain data types from original CSV
  - Warn on type mismatches
  - Prevent duplicate IDs if ID column detected
  - Required field validation

### 4. Schema Designer and CSV Generator
- Create new "Schema Designer" tab/page
- Schema definition interface:
  - Add/remove columns
  - Configure each column:
    - Column name
    - Data type (text, number, date, email, phone, boolean, category)
    - Generation rules (random, sequential, pattern, custom values)
    - Constraints (required, unique, min/max, regex pattern)
    - Default values
  - Visual schema builder with drag-and-drop column reordering
  - Save/load schema templates (localStorage)
- Generation options:
  - Number of rows to generate
  - Seed value for reproducible data
  - Preview first 10 rows before generating
- Data generation logic:
  - **Text**: Random names, addresses, lorem ipsum
  - **Number**: Random integers/decimals within range
  - **Date**: Random dates within range or sequential
  - **Email**: Generate realistic email addresses
  - **Phone**: Format-based phone numbers
  - **Boolean**: Random true/false or weighted
  - **Category**: Random selection from predefined list
- Templates:
  - Provide 5+ built-in schema templates:
    - E-commerce Orders
    - Customer Database
    - Product Inventory
    - Sales Transactions
    - Employee Records
  - Allow users to save custom templates
- Export generated CSV:
  - Download as CSV file
  - Directly load into analyzer for preview
  - Show in table view with editing enabled

## Technical Implementation

### File Structure
```
app/
  table-view/
    page.js                    # Main table view page
  schema-designer/
    page.js                    # Schema designer page
components/
  DataTable.js                 # Paginated table component
  TablePagination.js           # Pagination controls
  EditableCell.js              # Inline editable cell component
  SchemaBuilder.js             # Schema designer component
  ColumnConfig.js              # Column configuration form
  ExportOptions.js             # JSON export modal
lib/
  tableUtils.js                # Pagination, sorting, filtering logic
  exportUtils.js               # JSON export utilities
  schemaGenerator.js           # CSV generation from schema
  dataValidation.js            # Data type validation
  editHistory.js               # Undo/redo management
```

### Key Components

#### DataTable Component
```javascript
// Features: pagination, sorting, filtering, editing
- Props: data, columns, editable, onEdit, pageSize, sortable
- State: currentPage, sortColumn, sortDirection, filters, editedCells
- Methods: handleSort, handleFilter, handlePageChange, handleCellEdit
```

#### SchemaBuilder Component
```javascript
// Visual schema designer
- Props: onSchemaChange, initialSchema, templates
- State: columns, generationOptions
- Methods: addColumn, removeColumn, updateColumn, generatePreview, exportCSV
```

### Libraries to Use
- **react-table** or **AG Grid React** - Feature-rich table component
- **faker.js** - Generate realistic fake data
- **file-saver** - File download functionality
- **react-hot-toast** - Success/error notifications

## Output Format

### 1. Install Dependencies
```bash
npm install @tanstack/react-table faker file-saver react-hot-toast
```

### 2. Create Table View Components
- `components/DataTable.js` - Main paginated table
- `components/TablePagination.js` - Pagination controls
- `components/EditableCell.js` - Inline editing
- `components/ColumnFilter.js` - Column search/filter

### 3. Create Export Functionality
- `lib/exportUtils.js` - JSON conversion and download
- `components/ExportModal.js` - Export options UI

### 4. Create Editing Features
- `lib/editHistory.js` - Undo/redo stack
- `lib/dataValidation.js` - Type checking and validation
- `components/EditControls.js` - Save/Discard/Undo buttons

### 5. Create Schema Designer
- `app/schema-designer/page.js` - Main schema page
- `components/SchemaBuilder.js` - Schema configuration
- `components/ColumnConfig.js` - Individual column setup
- `lib/schemaGenerator.js` - Data generation logic
- `lib/schemaTemplates.js` - Built-in templates

### 6. Update Navigation
- Add "Table View" link to navigation
- Add "Schema Designer" link to navigation
- Update analyze page to include table view tab

## UI/UX Requirements

### Table View Design
- Clean, modern table with alternating row colors
- Sticky header that remains visible on scroll
- Loading skeleton while data loads
- Empty state when no data
- Clear visual feedback for sorting/filtering
- Edited cells highlighted in yellow/orange
- Row actions menu (edit, duplicate, delete)

### Schema Designer Design
- Drag-and-drop interface for column ordering
- Color-coded data type badges
- Live preview panel showing sample generated data
- Template selection cards with icons
- Clear "Generate CSV" call-to-action button
- Form validation with helpful error messages

### Responsive Design
- Mobile-friendly table (horizontal scroll or card view)
- Touch-friendly buttons and controls
- Optimized for tablets and desktops
- Collapsible sidebar for schema builder on mobile

## Validation Checks

- [ ] Table displays CSV data correctly with all columns
- [ ] Pagination controls work (First, Prev, Next, Last)
- [ ] Rows per page selector functions (10, 25, 50, 100)
- [ ] Page info displays correctly (X-Y of Z rows)
- [ ] Column sorting works (ascending/descending)
- [ ] Column filtering/search works
- [ ] JSON export downloads valid JSON file
- [ ] JSON export includes all data or filtered data as selected
- [ ] Copy to clipboard works for JSON
- [ ] Edit mode can be toggled on/off
- [ ] Cells are editable when in edit mode
- [ ] Add row button creates new empty row
- [ ] Delete row removes row with confirmation
- [ ] Edited cells show visual indicator
- [ ] Save changes downloads modified CSV
- [ ] Discard changes reverts to original data
- [ ] Undo/redo works for recent edits
- [ ] Data type validation warns on type mismatch
- [ ] Schema designer page loads correctly
- [ ] Can add/remove columns in schema
- [ ] Can configure column properties (name, type, rules)
- [ ] Built-in templates are available and load correctly
- [ ] Can save custom schema templates
- [ ] Preview shows sample generated data
- [ ] Generate CSV creates file with specified rows
- [ ] Generated CSV can be downloaded
- [ ] Generated CSV can be loaded into analyzer
- [ ] All features work with various CSV structures
- [ ] Large files (5000+ rows) perform well
- [ ] Mobile responsive design works correctly
- [ ] No console errors or warnings
- [ ] All buttons and controls have proper loading states
- [ ] Success/error notifications display appropriately

## Example Use Cases

### Use Case 1: View and Export Orders Data
1. Upload orders.csv file
2. Navigate to "Table View" tab
3. See 15 orders displayed with pagination
4. Sort by order_date (descending)
5. Click "Export to JSON"
6. Select "Pretty-printed" and "Include all rows"
7. Download orders.json file

### Use Case 2: Edit CSV Data
1. Open table view for uploaded CSV
2. Enable "Edit Mode"
3. Click cell to edit value (e.g., change quantity from 2 to 3)
4. Add new row for new order
5. See edited cells highlighted
6. Click "Save Changes"
7. Download orders_edited.csv

### Use Case 3: Generate Test Data
1. Navigate to "Schema Designer"
2. Select "E-commerce Orders" template
3. Modify: Set 100 rows, adjust date range
4. Click "Preview" to see sample data
5. Click "Generate CSV"
6. Download or load into analyzer
7. View generated data in table view

## Design Mockup Notes

### Table View Layout
```
[Edit Mode: OFF] [Export to JSON] [Rows per page: 25 ▼]

+-------+----------+----------+-------+--------+
| ID    | Date     | Customer | Total | Status |
+-------+----------+----------+-------+--------+
| 1001  | 2025-... | John Doe | $50   | Paid   |
| 1002  | 2025-... | Jane S.  | $125  | Paid   |
+-------+----------+----------+-------+--------+

[First] [Prev] Page 1 of 6 [Next] [Last]
Showing 1-25 of 150 rows
```

### Schema Designer Layout
```
Schema Name: [Customer Database        ] [Save Template]

Columns:
┌─────────────────────────────────────────────┐
│ ⋮ customer_id | NUMBER | Sequential | Unique│
│ ⋮ name        | TEXT   | Random Names      │
│ ⋮ email       | EMAIL  | Auto-generate     │
│ ⋮ signup_date | DATE   | Random 2024-2025  │
└─────────────────────────────────────────────┘

[+ Add Column]

Generate [100] rows  [Preview] [Generate & Download]
```

## Additional Features (Optional)
- Bulk edit: Apply changes to multiple cells
- Import JSON and convert to CSV
- Merge two CSV files
- Split CSV by column value
- Advanced search with regex support
- Column statistics in table view
- Export to Excel format (.xlsx)
- Dark mode for table view
- Keyboard shortcuts for navigation
- Print-friendly table view
