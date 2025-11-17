/**
 * Claude API Integration Tests
 * Priority: 🟠 HIGH
 *
 * Validates API contract with Anthropic Claude API
 */

import { test, expect } from '@playwright/test';

test.describe('Claude API Integration @integration', () => {
  test.skip(!process.env.CLAUDE_API_KEY, 'Claude API key not configured');

  test('should return valid response for standard query', async ({ request }) => {
    const response = await request.post('https://api.anthropic.com/v1/messages', {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      data: {
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: 'Write a 2-sentence product announcement for a Chrome extension.',
          },
        ],
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validate response contract
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('type', 'message');
    expect(body).toHaveProperty('role', 'assistant');
    expect(body).toHaveProperty('content');
    expect(body.content).toBeInstanceOf(Array);
    expect(body.content[0]).toHaveProperty('type', 'text');
    expect(body.content[0].text.length).toBeGreaterThan(0);

    // Validate usage tracking
    expect(body).toHaveProperty('usage');
    expect(body.usage.input_tokens).toBeGreaterThan(0);
    expect(body.usage.output_tokens).toBeGreaterThan(0);
  });

  test('should respect max_tokens limit', async ({ request }) => {
    const response = await request.post('https://api.anthropic.com/v1/messages', {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      data: {
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
        max_tokens: 10, // Very low limit
        messages: [
          {
            role: 'user',
            content: 'Write a long essay about AI.',
          },
        ],
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.usage.output_tokens).toBeLessThanOrEqual(10);
  });

  test('should reject invalid API key', async ({ request }) => {
    const response = await request.post('https://api.anthropic.com/v1/messages', {
      headers: {
        'x-api-key': 'sk-ant-invalid-key',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      data: {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error.type).toBe('authentication_error');
  });

  test('should handle invalid model name', async ({ request }) => {
    const response = await request.post('https://api.anthropic.com/v1/messages', {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      data: {
        model: 'claude-invalid-model',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error.type).toBe('invalid_request_error');
  });

  test('should validate response time is acceptable', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.post('https://api.anthropic.com/v1/messages', {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      data: {
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'Hello' }],
      },
    });

    const latency = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(latency).toBeLessThan(30000); // Should respond in <30s
  });
});
