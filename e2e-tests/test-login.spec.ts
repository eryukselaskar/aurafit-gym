import { test, expect } from '@playwright/test';

test.describe('External Auth Callback Debugger', () => {
  test('should verify window.handleExternalAuth is registered and responds to invocation', async ({ page }) => {
    // Collect console logs from the page
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Go to landing page
    await page.goto('/');

    // Wait for the React app to initialize
    await page.waitForTimeout(1000);

    // Verify handleExternalAuth is registered on window
    const callbackExists = await page.evaluate(() => typeof (window as unknown as { handleExternalAuth?: unknown }).handleExternalAuth === 'function');
    console.log(`Is handleExternalAuth registered? ${callbackExists}`);
    expect(callbackExists).toBe(true);

    // Invoke the callback with a mock payload to test execution
    console.log('Invoking handleExternalAuth...');
    const result = await page.evaluate(async () => {
      try {
        await (window as unknown as { handleExternalAuth: (c: Record<string, unknown>) => Promise<void> }).handleExternalAuth({
          uid: 'debug-uid-123',
          email: 'debug@aurafit.com',
          displayName: 'Debug User',
          photoURL: null,
          idToken: 'debug-fake-token'
        });
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    });

    console.log('Result of invocation:', JSON.stringify(result));
  });
});
