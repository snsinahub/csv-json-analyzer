# Playwright E2E Tests - Quick Start Guide

## Installation

1. Install dependencies (including Playwright and axe-core):
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Quick Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# View the HTML report from last run
npm run test:e2e:report
```

### Run Specific Tests

```bash
# Run only homepage tests
npx playwright test homepage

# Run only accessibility tests
npx playwright test --grep accessibility

# Run specific browser
npx playwright test --project=chromium
```

## What You Get

### 📸 Screenshots
- **Location**: `test-results/screenshots/`
- **Frequency**: Every test execution
- **Type**: Full-page screenshots
- **Included in**: HTML report

### 📊 HTML Report
- **Location**: `playwright-report/index.html`
- **Contains**: 
  - Test results with pass/fail status
  - Embedded screenshots
  - Accessibility scan results (JSON)
  - Video recordings (Chromium tests)
  - Trace files for debugging
- **View**: `npm run test:e2e:report` or open `playwright-report/index.html` in browser

### ♿ Accessibility Testing
- **Tool**: axe-core integrated with Playwright
- **Coverage**: Every test page
- **Standards**: WCAG 2.1 Level A & AA
- **Results**: Attached to HTML report as JSON
- **Behavior**: Tests fail if violations found

### 🎥 Videos
- **Location**: `test-results/`
- **Recording**: All Chromium tests
- **Format**: WebM
- **Purpose**: Visual debugging of test execution

## Test Coverage

✅ Homepage/Dashboard (7 tests)
- Page loading and content
- Feature cards display
- Navigation functionality
- Stats display
- CLI section
- Mobile responsiveness
- Accessibility compliance

✅ Analyze Page (5 tests)
- Page loading
- File upload interface
- Analysis options
- Mobile responsiveness
- Accessibility compliance

✅ Table View Page (4 tests)
- Table display
- Pagination controls
- Filtering capabilities
- Mobile responsiveness
- Accessibility compliance

✅ Schema Designer Page (5 tests)
- Page loading
- Schema builder interface
- Template options
- Column management
- Mobile responsiveness
- Accessibility compliance

✅ Data Generator Page (5 tests)
- Page loading
- Template selection
- Row configuration
- Generate functionality
- Mobile responsiveness
- Accessibility compliance

✅ Generate & Update Pages (8 tests)
- Both pages loading
- Form elements
- File operations
- Mobile responsiveness
- Accessibility compliance

**Total: 34 end-to-end tests** covering all major application pages

## Viewing Results

### After Running Tests

1. **Terminal Output**: Real-time test results
2. **HTML Report**: Automatically opens (or run `npm run test:e2e:report`)
3. **Screenshots**: Browse `test-results/screenshots/`
4. **Videos**: Available in `test-results/` (for Chromium)

### HTML Report Features

- Click on any test to see details
- View screenshots inline
- Download trace files for debugging
- Filter by pass/fail status
- Search across all tests
- View accessibility scan results

## CI/CD Integration

Tests are configured to run in CI environments:
- Automatic retries (2x on CI)
- JSON results output
- No browser auto-open
- Single worker to avoid conflicts

## Troubleshooting

**Issue**: Browsers not found
```bash
npx playwright install
```

**Issue**: Tests timeout
- Check dev server is running: `npm run dev`
- Increase timeout in `playwright.config.js`

**Issue**: Port already in use
- Stop other processes on port 3000
- Or change port in `playwright.config.js`

## Next Steps

1. Run tests: `npm run test:e2e`
2. View report: `npm run test:e2e:report`
3. Check screenshots in `test-results/screenshots/`
4. Review accessibility results in HTML report
5. Add more tests as needed in `tests/e2e/`

For detailed documentation, see `tests/README.md`
