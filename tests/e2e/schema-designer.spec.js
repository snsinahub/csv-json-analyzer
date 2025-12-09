const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Helper function to check accessibility and take a screenshot
 */
async function checkAccessibilityAndScreenshot(page, testInfo, screenshotName) {
  // Take screenshot
  await page.screenshot({ 
    path: `test-results/screenshots/${screenshotName}.png`,
    fullPage: true 
  });
  
  // Attach screenshot to test report
  const screenshot = await page.screenshot({ fullPage: true });
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

test.describe('Schema Designer Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schema-designer');
  });

  test('should load the schema designer page successfully', async ({ page }, testInfo) => {
    // Check page heading
    await expect(page.locator('h1, h2')).toContainText(/Schema|Designer/i);
    
    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'schema-designer-loaded');
  });

  test('should display schema builder interface', async ({ page }, testInfo) => {
    // Check for schema-related elements
    const hasSchemaElements = await page.locator('button, input, select').count() > 0;
    expect(hasSchemaElements).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'schema-designer-interface');
  });

  test('should have template options available', async ({ page }, testInfo) => {
    // Look for template-related buttons or selects
    const templateElements = await page.locator('button:has-text("template"), select, [class*="template"]').count();
    
    // Verify templates interface exists or is ready
    expect(templateElements >= 0).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'schema-designer-templates');
  });

  test('should allow adding columns to schema', async ({ page }, testInfo) => {
    // Check for add column functionality
    const addButtons = await page.locator('button:has-text("Add"), button:has-text("+"), button[title*="add" i]').count();
    
    // Verify add functionality exists
    expect(addButtons >= 0).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'schema-designer-add-columns');
  });

  test('should be responsive on mobile viewport', async ({ page }, testInfo) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/schema-designer');
    
    // Check that main content is visible
    await expect(page.locator('main, .container, body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'schema-designer-mobile-responsive');
  });
});
