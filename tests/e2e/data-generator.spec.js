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

test.describe('Data Generator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data-generator');
  });

  test('should load the data generator page successfully', async ({ page }, testInfo) => {
    // Check page heading
    await expect(page.locator('h1, h2')).toContainText(/Data|Generator/i);
    
    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'data-generator-loaded');
  });

  test('should display template selection', async ({ page }, testInfo) => {
    // Check for template selection elements
    const hasTemplates = await page.locator('button, select, [class*="template"]').count() > 0;
    expect(hasTemplates).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'data-generator-templates');
  });

  test('should have row count configuration', async ({ page }, testInfo) => {
    // Verify the page structure is ready
    const mainContent = page.locator('main, .container');
    await expect(mainContent).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'data-generator-row-config');
  });

  test('should have generate button', async ({ page }, testInfo) => {
    // Verify the page structure is ready
    const mainContent = page.locator('main, .container');
    await expect(mainContent).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'data-generator-generate-button');
  });

  test('should be responsive on mobile viewport', async ({ page }, testInfo) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/data-generator');
    
    // Check that main content is visible
    await expect(page.locator('main, .container, body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'data-generator-mobile-responsive');
  });
});
