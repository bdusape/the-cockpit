/**
 * GitHub API Integration Tests
 * Priority: 🟠 HIGH
 *
 * Validates agent configuration files are accessible from GitHub
 */

import { test, expect } from '@playwright/test';

const AGENTS = ['publicist', 'growth-hacker', 'strategist', 'content-strategist', 'credit-advisor'];

test.describe('GitHub Agent Configuration Availability @integration', () => {
  for (const agent of AGENTS) {
    test(`should fetch ${agent}.md from GitHub`, async ({ request }) => {
      const url = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH}/agents/${agent}.md`;

      const response = await request.get(url);

      expect(response.status()).toBe(200);

      const content = await response.text();

      // Validate agent file structure
      expect(content).toContain('## Role'); // Has role definition
      expect(content).toContain('## Personality'); // Has personality traits
      expect(content).toContain('## Core Responsibilities'); // Has responsibilities
      expect(content.length).toBeGreaterThan(1000); // Substantial content

      console.log(`✅ ${agent}.md validated (${content.length} bytes)`);
    });
  }

  test('should handle missing agent file gracefully', async ({ request }) => {
    const url = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH}/agents/nonexistent-agent.md`;

    const response = await request.get(url);

    expect(response.status()).toBe(404);
  });

  test('should fetch agent files within acceptable latency', async ({ request }) => {
    const startTime = Date.now();

    const url = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH}/agents/publicist.md`;

    const response = await request.get(url);

    const latency = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(latency).toBeLessThan(5000); // Should load in <5s
  });
});
