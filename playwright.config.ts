import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Playwright configuration for The Cockpit API testing
 *
 * This config is optimized for testing serverless integrations:
 * - WhatsApp Business API
 * - Anthropic Claude API
 * - GitHub API (agent configs)
 * - Pipedream workflow execution
 */
export default defineConfig({
  testDir: './tests',

  // Test timeouts
  timeout: 60000, // 60 seconds (Claude API can be slow)
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  // Fail fast on CI, but allow retries locally
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry flaky API tests
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'], // Console output
  ],

  // Shared settings for all tests
  use: {
    // Base URL for API requests (Pipedream webhook)
    baseURL: process.env.PIPEDREAM_WEBHOOK_URL,

    // Default headers
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },

    // Tracing
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  // Test projects (organize by test type)
  projects: [
    {
      name: 'critical-flows',
      testMatch: /critical-flows\.spec\.ts/,
      retries: 0, // No retries for Go/No-Go tests - must pass first time
    },
    {
      name: 'agent-quality',
      testMatch: /agents\/.*\.spec\.ts/,
      retries: 1,
    },
    {
      name: 'api-contracts',
      testMatch: /integrations\/.*\.spec\.ts/,
      retries: 2, // External APIs can be flaky
    },
    {
      name: 'security',
      testMatch: /security\.spec\.ts/,
      retries: 0, // Security tests must be deterministic
    },
  ],
});
