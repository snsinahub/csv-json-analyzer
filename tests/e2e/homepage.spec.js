const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Helper function to check accessibility and take a screenshot
 */
async function checkAccessibilityAndScreenshot(page, testInfo, screenshotName) {
  // Take screenshot once and use for both file and report
  const screenshot = await page.screenshot({ fullPage: true });
  
  // Save to file
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

test.describe('Homepage/Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }, testInfo) => {
    // Check page title
    await expect(page).toHaveTitle(/CSV Analyzer/);
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('CSV Analyzer');
    await expect(page.locator('.lead')).toContainText('Powerful tools for analyzing');
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'homepage-loaded');
  });

  test('should display all feature cards', async ({ page }, testInfo) => {
    // Check that all feature cards are visible
    const featureCards = page.locator('.feature-card');
    await expect(featureCards).toHaveCount(7); // 7 features total
    
    // Verify specific features
    await expect(page.getByText('Analyze CSV')).toBeVisible();
    await expect(page.getByText('Table View')).toBeVisible();
    await expect(page.getByText('Schema Designer')).toBeVisible();
    await expect(page.getByText('Data Generator')).toBeVisible();
    await expect(page.getByText('Generate CSV')).toBeVisible();
    await expect(page.getByText('Update CSV')).toBeVisible();
    await expect(page.getByText('DuckDB Query')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'homepage-feature-cards');
  });

  test('should navigate to analyze page', async ({ page }, testInfo) => {
    // Click on "Start Analysis" button
    await page.click('text=Start Analysis');
    
    // Verify navigation
    await expect(page).toHaveURL('/analyze');
    await expect(page.locator('h2')).toContainText('CSV');
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'navigate-to-analyze');
  });

  test('should display stats cards', async ({ page }, testInfo) => {
    // Check for stats cards
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(3);
    
    // Verify stats content
    await expect(page.getByText('Files Processed')).toBeVisible();
    await expect(page.getByText('Avg Processing Time')).toBeVisible();
    await expect(page.getByText('Last Analyzed')).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'homepage-stats-cards');
  });

  test('should display CLI information section', async ({ page }, testInfo) => {
    // Scroll to CLI section
    await page.locator('text=Command Line Interface').scrollIntoViewIfNeeded();
    
    // Verify CLI section
    await expect(page.getByText('Command Line Interface')).toBeVisible();
    await expect(page.locator('pre code')).toContainText('node scripts/analyze.js');
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'homepage-cli-section');
  });

  test('should have working navigation links', async ({ page }, testInfo) => {
    // Test navigation to different pages
    const links = [
      { text: 'Analyze', url: '/analyze' },
      { text: 'View', url: '/table-view' },
      { text: 'Design', url: '/schema-designer' },
    ];
    
    for (const link of links) {
      await page.goto('/');
      await page.click(`text=${link.text}`);
      await expect(page).toHaveURL(link.url);
      
      // Take screenshot of each page
      await page.screenshot({ 
        path: `test-results/screenshots/navigation-${link.url.replace('/', '')}.png`,
        fullPage: true 
      });
    }
    
    // Final screenshot
    await page.goto('/');
    await checkAccessibilityAndScreenshot(page, testInfo, 'homepage-navigation-tested');
  });

  test('should be responsive on mobile viewport', async ({ page }, testInfo) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.feature-card').first()).toBeVisible();
    
    // Check accessibility and take screenshot
    await checkAccessibilityAndScreenshot(page, testInfo, 'homepage-mobile-responsive');
  });
});
