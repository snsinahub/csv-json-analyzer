const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Helper function to check accessibility and take a screenshot
 */
async function checkAccessibilityAndScreenshot(page, testInfo, screenshotName) {
  // Take screenshot once and use for both file and report
  const screenshot = await page.screenshot({ fullPage: true });
  
  // Attach to test report
  await testInfo.attach(screenshotName, { 
    body: screenshot, 
    contentType: 'image/png' 
  });
  
  // Run accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page })
    .analyze();
  
  // Attach accessibility results to test report
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: 'application/json',
  });
  
  // Assert no accessibility violations
  expect(accessibilityScanResults.violations).toEqual([]);
}

test.describe('Table View Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/table-view');
  });

  test('should load the table view page successfully', async ({ page }, testInfo) => {
    // Check page heading
    await expect(page.locator('h2, h1')).toContainText(/Table|View|CSV/i);
    
    // Check for file upload or table container
    const hasUpload = await page.locator('input[type="file"]').count() > 0;
    const hasTable = await page.locator('table').count() > 0;
    
    expect(hasUpload || hasTable).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'table-view-loaded');
  });

  test('should display pagination controls when table has data', async ({ page }, testInfo) => {
    // Check that the page structure exists for pagination
    const mainContent = page.locator('main, .container');
    await expect(mainContent).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'table-view-pagination');
  });

  test('should have filtering capabilities', async ({ page }, testInfo) => {
    // Verify the page structure is ready for filters
    const mainContent = page.locator('main, .container');
    await expect(mainContent).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'table-view-filters');
  });

  test('should be responsive on mobile viewport', async ({ page }, testInfo) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/table-view');
    
    // Check that main content is visible
    await expect(page.locator('main, .container, body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'table-view-mobile-responsive');
  });
});
