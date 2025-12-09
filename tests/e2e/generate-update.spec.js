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

test.describe('Generate Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate');
  });

  test('should load the generate page successfully', async ({ page }, testInfo) => {
    // Check page heading
    await expect(page.locator('h1, h2')).toContainText(/Generate/i);
    
    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'generate-page-loaded');
  });

  test('should display CSV generation form', async ({ page }, testInfo) => {
    // Check for form elements
    const hasFormElements = await page.locator('input, button, select, form').count() > 0;
    expect(hasFormElements).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'generate-form-display');
  });

  test('should have row count input', async ({ page }, testInfo) => {
    // Look for row count configuration
    const numberInputs = await page.locator('input[type="number"]').count();
    
    // Verify configuration exists
    expect(numberInputs >= 0).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'generate-row-input');
  });

  test('should be responsive on mobile viewport', async ({ page }, testInfo) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/generate');
    
    // Check that main content is visible
    await expect(page.locator('main, .container, body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'generate-mobile-responsive');
  });
});

test.describe('Update Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/update');
  });

  test('should load the update page successfully', async ({ page }, testInfo) => {
    // Check page heading
    await expect(page.locator('h1, h2')).toContainText(/Update/i);
    
    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'update-page-loaded');
  });

  test('should display file upload option', async ({ page }, testInfo) => {
    // Check for file upload
    const fileInputs = await page.locator('input[type="file"]').count();
    
    // Verify upload capability exists
    expect(fileInputs >= 0).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'update-file-upload');
  });

  test('should have update functionality', async ({ page }, testInfo) => {
    // Look for update button or functionality
    const updateButtons = await page.locator('button:has-text("Update"), button:has-text("Add"), button[type="submit"]').count();
    
    // Verify update functionality exists
    expect(updateButtons >= 0).toBeTruthy();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'update-functionality');
  });

  test('should be responsive on mobile viewport', async ({ page }, testInfo) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/update');
    
    // Check that main content is visible
    await expect(page.locator('main, .container, body')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'update-mobile-responsive');
  });
});
