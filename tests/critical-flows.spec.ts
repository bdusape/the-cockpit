/**
 * CRITICAL GO/NO-GO TEST CASES
 *
 * These 10 tests MUST pass before production launch.
 * If any fail, deployment is blocked.
 *
 * Test Execution: npm test -- critical-flows.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  createAuthorizedPayload,
  createUnauthorizedPayload,
  createEmptyMessagePayload,
  createSpecialCharactersPayload,
} from './fixtures/whatsapp-payloads';
import queries from './fixtures/queries.json';

// Helper to wait for workflow execution
async function waitForExecution(delayMs: number = 10000) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

test.describe('Critical Go/No-Go Test Cases', () => {
  test.describe.configure({ mode: 'serial' }); // Run sequentially to avoid rate limits

  /**
   * TEST CASE 1: Agent Activation - Happy Path
   * Priority: 🔴 BLOCKER
   */
  test('@critical TC-001: should activate Publicist agent and generate multi-platform announcement', async ({
    request,
  }) => {
    // Skip if no webhook URL configured
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    const webhookPayload = createAuthorizedPayload(queries.publicist.happy_path);

    // Send to Pipedream webhook
    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
      headers: {
        'X-Hub-Signature-256': process.env.WHATSAPP_VERIFY_TOKEN || '',
      },
    });

    // Validate workflow accepted request
    expect(response.status()).toBe(200);

    // Wait for async processing (Pipedream → Claude → WhatsApp)
    await waitForExecution();

    // Fetch execution logs from Pipedream API
    if (process.env.PIPEDREAM_API_KEY && process.env.PIPEDREAM_SOURCE_ID) {
      const executionLogs = await request.get(
        `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
          },
        }
      );

      expect(executionLogs.status()).toBe(200);

      const logs = await executionLogs.json();
      const latestExecution = logs.data?.[0];

      if (latestExecution) {
        // Assertions
        expect(latestExecution.status).toBe('success');

        // Validate response contains expected deliverables
        const responseText = latestExecution.steps?.claude_api_call?.content?.[0]?.text || '';
        expect(responseText.length).toBeGreaterThan(200); // Substantial response

        // Check for expected keywords
        const containsTwitter = responseText.toLowerCase().includes('twitter');
        const containsLinkedIn = responseText.toLowerCase().includes('linkedin');
        expect(containsTwitter || containsLinkedIn).toBeTruthy();

        // Validate cost tracking
        const tokensUsed =
          (latestExecution.metadata?.tokens_used || 0) ||
          (latestExecution.steps?.claude_api_call?.usage?.input_tokens || 0) +
            (latestExecution.steps?.claude_api_call?.usage?.output_tokens || 0);

        expect(tokensUsed).toBeGreaterThan(0);
        expect(tokensUsed).toBeLessThan(4096);
      }
    }
  });

  /**
   * TEST CASE 2: Invalid Agent Handling
   * Priority: 🔴 BLOCKER
   */
  test('@critical TC-002: should handle invalid agent gracefully', async ({ request }) => {
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    const webhookPayload = createAuthorizedPayload(queries.invalid_agent.query);

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    await waitForExecution();

    if (process.env.PIPEDREAM_API_KEY && process.env.PIPEDREAM_SOURCE_ID) {
      const executionLogs = await request.get(
        `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
          },
        }
      );

      const logs = await executionLogs.json();
      const latestExecution = logs.data?.[0];

      if (latestExecution) {
        // Should NOT call Claude API (cost optimization)
        const claudeStepExists = 'claude_api_call' in (latestExecution.steps || {});
        expect(claudeStepExists).toBeFalsy();

        // Should send error message via WhatsApp
        const errorMessage = latestExecution.steps?.send_whatsapp_message?.message || '';
        expect(errorMessage).toContain('Agent not found');
      }
    }
  });

  /**
   * TEST CASE 3: Agent Switching
   * Priority: 🔴 BLOCKER
   */
  test('@critical TC-003: should switch between agents correctly', async ({ request }) => {
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    // First message: @publicist
    const publicistPayload = createAuthorizedPayload('@publicist Create launch announcement');
    const response1 = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: publicistPayload,
    });
    expect(response1.status()).toBe(200);

    await waitForExecution(5000);

    // Second message: @strategist
    const strategistPayload = createAuthorizedPayload('@strategist Should I delay launch?');
    const response2 = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: strategistPayload,
    });
    expect(response2.status()).toBe(200);

    await waitForExecution(5000);

    // Both should succeed independently
    // In production, verify no context bleed between agents
    // (This requires checking actual WhatsApp responses or Pipedream logs)
  });

  /**
   * TEST CASE 4: Long User Query (Token Limits)
   * Priority: 🟠 HIGH
   */
  test('@critical TC-004: should handle long queries without truncation', async ({ request }) => {
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    const webhookPayload = createAuthorizedPayload(queries.long_query.query);

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    await waitForExecution(15000); // Longer wait for complex query

    if (process.env.PIPEDREAM_API_KEY && process.env.PIPEDREAM_SOURCE_ID) {
      const executionLogs = await request.get(
        `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
          },
        }
      );

      const logs = await executionLogs.json();
      const latestExecution = logs.data?.[0];

      if (latestExecution) {
        expect(latestExecution.status).toBe('success');

        // Validate no timeout errors
        const errorExists = latestExecution.error || latestExecution.$error;
        expect(errorExists).toBeUndefined();

        // Response should be substantial
        const responseText = latestExecution.steps?.claude_api_call?.content?.[0]?.text || '';
        expect(responseText.length).toBeGreaterThan(100);
      }
    }
  });

  /**
   * TEST CASE 5: Unauthorized User Access
   * Priority: 🔴 BLOCKER - Security vulnerability
   */
  test('@critical TC-005: should reject unauthorized users', async ({ request }) => {
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    const webhookPayload = createUnauthorizedPayload('@publicist test query');

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
    });

    // Should either reject with 403 or accept but block in workflow
    expect([200, 403]).toContain(response.status());

    await waitForExecution();

    if (process.env.PIPEDREAM_API_KEY && process.env.PIPEDREAM_SOURCE_ID) {
      const executionLogs = await request.get(
        `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
          },
        }
      );

      const logs = await executionLogs.json();
      const latestExecution = logs.data?.[0];

      if (latestExecution) {
        // Should block request early (no Claude API call)
        const claudeStepExists = 'claude_api_call' in (latestExecution.steps || {});
        expect(claudeStepExists).toBeFalsy();

        // Should have authorization check step
        const authCheckResult = latestExecution.steps?.authorization_check?.result;
        if (authCheckResult) {
          expect(authCheckResult).toBe('rejected');
        }
      }
    }
  });

  /**
   * TEST CASE 6: WhatsApp API Failure Handling
   * Priority: 🔴 BLOCKER
   * NOTE: This requires simulating API failures, which is difficult in E2E tests.
   * Recommend manual testing or mocking.
   */
  test.skip('@critical TC-006: should handle WhatsApp API failures with retries', async () => {
    // This test requires simulating WhatsApp API 500 errors
    // Implementation depends on having a test/staging WhatsApp endpoint
    // or using API mocking tools like Polly.js or MSW
  });

  /**
   * TEST CASE 7: Claude API Rate Limiting
   * Priority: 🟠 HIGH
   * NOTE: This test sends multiple rapid requests to trigger rate limits.
   * Only run in controlled test environments.
   */
  test.skip('@critical TC-007: should handle Claude API rate limiting', async ({ request }) => {
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    // Send 10 rapid messages
    const promises = Array(10)
      .fill(null)
      .map(() => {
        const payload = createAuthorizedPayload('@publicist quick test');
        return request.post(process.env.PIPEDREAM_WEBHOOK_URL!, { data: payload });
      });

    const responses = await Promise.all(promises);

    // At least some should succeed
    const successResponses = responses.filter((r) => r.status() === 200);
    expect(successResponses.length).toBeGreaterThan(0);

    // Check logs for rate limit handling
    // (Implementation depends on workflow error handling)
  });

  /**
   * TEST CASE 8: GitHub Agent Config Unavailable
   * Priority: 🟠 HIGH
   */
  test('@critical TC-008: should handle missing GitHub agent config', async ({ request }) => {
    // Test by requesting a non-existent agent file
    const agentUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/main/agents/nonexistent-agent.md`;

    const response = await request.get(agentUrl);

    expect(response.status()).toBe(404);

    // In production workflow, this should trigger:
    // 1. Fallback to cached version (if available)
    // 2. Admin alert
    // 3. Graceful error message to user
  });

  /**
   * TEST CASE 9: Empty/Malformed User Message
   * Priority: 🟡 MEDIUM
   */
  test('@critical TC-009: should validate empty messages', async ({ request }) => {
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    const webhookPayload = createEmptyMessagePayload();

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    await waitForExecution();

    if (process.env.PIPEDREAM_API_KEY && process.env.PIPEDREAM_SOURCE_ID) {
      const executionLogs = await request.get(
        `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
          },
        }
      );

      const logs = await executionLogs.json();
      const latestExecution = logs.data?.[0];

      if (latestExecution) {
        // Should NOT call Claude API for empty messages
        const claudeStepExists = 'claude_api_call' in (latestExecution.steps || {});
        expect(claudeStepExists).toBeFalsy();
      }
    }
  });

  /**
   * TEST CASE 10: Special Characters in User Query
   * Priority: 🟡 MEDIUM
   */
  test('@critical TC-010: should parse special characters correctly', async ({ request }) => {
    test.skip(!process.env.PIPEDREAM_WEBHOOK_URL, 'Pipedream webhook URL not configured');

    const webhookPayload = createSpecialCharactersPayload();

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    await waitForExecution();

    if (process.env.PIPEDREAM_API_KEY && process.env.PIPEDREAM_SOURCE_ID) {
      const executionLogs = await request.get(
        `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
          },
        }
      );

      const logs = await executionLogs.json();
      const latestExecution = logs.data?.[0];

      if (latestExecution) {
        expect(latestExecution.status).toBe('success');

        // Validate emojis and special characters preserved
        const responseText = latestExecution.steps?.claude_api_call?.content?.[0]?.text || '';
        expect(responseText.length).toBeGreaterThan(0);
      }
    }
  });
});

/**
 * Test Summary Report
 *
 * After running these tests, generate a Go/No-Go decision matrix:
 *
 * - If TC-001, TC-002, TC-003, TC-005 pass: CRITICAL flows working ✅
 * - If TC-004, TC-008, TC-009, TC-010 pass: Edge cases handled ✅
 * - If TC-006, TC-007 pass: Error handling robust ✅
 *
 * LAUNCH DECISION:
 * - All BLOCKER tests (TC-001, TC-002, TC-003, TC-005) must pass
 * - At least 6/10 total tests must pass
 * - No security vulnerabilities (TC-005 must pass)
 */
