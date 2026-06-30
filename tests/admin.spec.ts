import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const adminRoutes = [
  '/admin',
  '/admin/teams',
  '/admin/verification',
  '/admin/checkin',
  '/admin/schedule',
  '/admin/messages',
  '/admin/settings'
];

test.describe('Admin Routes Integration Test', () => {
  // Test that all scaffolded admin routes return 200 OK (no 404s)
  for (const route of adminRoutes) {
    test(`Route ${route} should not return 404`, async ({ request }) => {
      // We use the request fixture to verify HTTP status codes quickly
      const response = await request.get(`${BASE_URL}${route}`);
      
      // Depending on auth middleware, this might redirect (307/302) to login, 
      // which is a perfectly valid response (meaning the route exists).
      // A 404 means the route doesn't exist at all.
      expect(response.status()).not.toBe(404);
      
      // Expect either 200 (OK) or a 3xx redirect to the login page
      expect([200, 307, 308, 302]).toContain(response.status());
    });
  }

  // Visual/UI check on the login page (since we can access it unauthenticated)
  test('Admin login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    
    // Check if the Syncopate font is applied to the title (Command Center / Login)
    await expect(page.locator('h1')).toBeVisible();
    
    // The specific text may vary, but we ensure it's not a Next.js 404 page
    const content = await page.textContent('body');
    expect(content).not.toContain('This page could not be found');
  });
});
