# End-to-End Tests with Playwright

This directory contains end-to-end tests for the CSV Analyzer application using Playwright with integrated axe-core accessibility testing.

## Features

- **Comprehensive E2E Tests**: Tests for all major pages and features
- **Accessibility Testing**: Integrated axe-core scans on every page
- **Screenshots**: Automatic screenshots on every test for visual verification
- **HTML Reports**: Rich HTML reports with screenshots and accessibility results
- **Multi-Browser Support**: Tests run on Chromium, Firefox, WebKit, and mobile viewports
- **Video Recording**: Videos captured for all Chromium tests

## Prerequisites

Before running tests, install dependencies:

```bash
npm install
```

Then install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View the last test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test tests/e2e/homepage.spec.js
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
tests/
└── e2e/
    ├── homepage.spec.js          # Homepage/Dashboard tests
    ├── analyze.spec.js            # CSV analysis page tests
    ├── table-view.spec.js         # Table view page tests
    ├── schema-designer.spec.js    # Schema designer tests
    ├── data-generator.spec.js     # Data generator tests
    └── generate-update.spec.js    # Generate and Update page tests
```

## Test Reports

After running tests, you can find:

- **HTML Report**: `playwright-report/index.html` - Rich interactive report with screenshots and traces
- **Screenshots**: `test-results/screenshots/` - Full-page screenshots for each test
- **Videos**: `test-results/` - Video recordings (Chromium only)
- **JSON Results**: `test-results/results.json` - Machine-readable test results

## Accessibility Testing

Every test includes accessibility scanning using axe-core:

1. **Automatic Scans**: Each test runs an accessibility scan using the `checkAccessibilityAndScreenshot` helper
2. **Violation Reports**: Any accessibility violations cause the test to fail
3. **Detailed Results**: Accessibility scan results are attached to the HTML report
4. **WCAG Compliance**: Tests check for WCAG 2.1 Level A and AA violations

## Screenshots

Screenshots are automatically captured:

- **On Every Test**: Full-page screenshots saved to `test-results/screenshots/`
- **In HTML Report**: Screenshots embedded in the test report for easy viewing
- **On Failure**: Additional screenshots on test failures

## Writing New Tests

To add a new test:

1. Create a new `.spec.js` file in `tests/e2e/`
2. Import the accessibility helper:
   ```javascript
   const { test, expect } = require('@playwright/test');
   const AxeBuilder = require('@axe-core/playwright').default;
   ```
3. Use the `checkAccessibilityAndScreenshot` helper in your tests:
   ```javascript
   await checkAccessibilityAndScreenshot(page, testInfo, 'my-test-screenshot');
   ```

Example test template:

```javascript
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function checkAccessibilityAndScreenshot(page, testInfo, screenshotName) {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(screenshotName, { 
    body: screenshot, 
    contentType: 'image/png' 
  });
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: 'application/json',
  });
  
  expect(accessibilityScanResults.violations).toEqual([]);
}

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }, testInfo) => {
    await page.goto('/my-page');
    await expect(page.locator('h1')).toBeVisible();
    await checkAccessibilityAndScreenshot(page, testInfo, 'my-feature-test');
  });
});
```

## CI/CD Integration

The tests are configured to run automatically in CI environments:

- **Retries**: Tests retry up to 2 times on CI
- **Workers**: Single worker on CI to avoid resource conflicts
- **Reporting**: HTML and JSON reports generated
- **No Browser Auto-open**: Reports don't auto-open on CI

## Troubleshooting

### Tests timing out
- Increase the timeout in `playwright.config.js`
- Check that the dev server is starting correctly

### Browser not found
- Run `npx playwright install` to install browsers

### Accessibility violations
- Check the HTML report for detailed violation information
- Review the attached accessibility scan results in the report

## Configuration

Test configuration is in `playwright.config.js`. Key settings:

- **baseURL**: `http://localhost:3000`
- **testDir**: `./tests/e2e`
- **Workers**: Parallel execution (1 on CI)
- **Retries**: 0 locally, 2 on CI
- **Screenshots**: On for Chromium, on-failure for others
- **Video**: On for Chromium, on-failure for others
- **Trace**: On first retry

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [axe-core Playwright Integration](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Accessibility Testing Guide](https://www.deque.com/axe/)
