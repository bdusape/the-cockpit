# The Cockpit - Test Suite

Comprehensive testing infrastructure for The Cockpit WhatsApp AI Agent Platform.

---

## Overview

This directory contains all test infrastructure for validating The Cockpit before production launch:

- **Automated E2E tests** (Playwright)
- **API integration tests** (WhatsApp, Claude, GitHub)
- **Agent validation scripts**
- **Manual test fixtures and tracking**

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Test Environment

```bash
cp .env.example .env.test
# Edit .env.test with your test values
```

### 3. Validate Configuration

```bash
npm run validate:config
npm run validate:agents
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run critical Go/No-Go tests only
npm run test:critical

# Run integration tests
npm run test:integration

# Run agent validation
npm run validate:agents
```

---

## Directory Structure

```
tests/
├── critical-flows.spec.ts          # 10 Go/No-Go test cases (MUST PASS for launch)
├── integrations/
│   ├── claude-api.spec.ts          # Claude API contract tests
│   ├── github-api.spec.ts          # GitHub agent config tests
│   └── whatsapp-api.spec.ts        # WhatsApp API tests (TODO)
├── agents/
│   └── [individual agent tests]    # Agent-specific quality tests (TODO)
├── fixtures/
│   ├── queries.json                # Test query data for all agents
│   └── whatsapp-payloads.ts        # WhatsApp webhook payload helpers
├── scripts/
│   ├── validate-agents.js          # Agent markdown structure validator
│   └── validate-config.js          # Environment config validator
└── README.md                       # This file
```

---

## Test Categories

### 1. Critical Go/No-Go Tests 🔴 BLOCKER

**File:** `critical-flows.spec.ts`

These 10 tests MUST pass before production launch:

| Test ID | Description | Priority |
|---------|-------------|----------|
| TC-001 | Agent activation - happy path | 🔴 BLOCKER |
| TC-002 | Invalid agent handling | 🔴 BLOCKER |
| TC-003 | Agent switching | 🔴 BLOCKER |
| TC-004 | Long user query handling | 🟠 HIGH |
| TC-005 | Unauthorized user access | 🔴 BLOCKER |
| TC-006 | WhatsApp API failure handling | 🔴 BLOCKER |
| TC-007 | Claude API rate limiting | 🟠 HIGH |
| TC-008 | GitHub agent config unavailable | 🟠 HIGH |
| TC-009 | Empty message validation | 🟡 MEDIUM |
| TC-010 | Special characters parsing | 🟡 MEDIUM |

**Run:**
```bash
npm run test:critical
```

**Pass Criteria:** All BLOCKER tests must pass (TC-001, TC-002, TC-003, TC-005)

---

### 2. API Integration Tests 🟠 HIGH

**Files:** `integrations/*.spec.ts`

Validates external API contracts and reliability:

- **Claude API** (`claude-api.spec.ts`)
  - Response format validation
  - Authentication testing
  - Rate limit handling
  - Token usage tracking

- **GitHub API** (`github-api.spec.ts`)
  - Agent file accessibility
  - Error handling (404 responses)
  - Latency validation

**Run:**
```bash
npm run test:integration
```

**Pass Criteria:** All external APIs return 200 for valid requests

---

### 3. Agent Quality Validation ✅

**Scripts:** `scripts/validate-agents.js`

Validates agent markdown file structure and quality:

```bash
npm run validate:agents
```

**Checks:**
- ✅ File size (>1000 characters)
- ✅ Required sections present (## Role, ## Personality, etc.)
- ✅ Proper markdown structure (headings, examples)
- ✅ No placeholder text (TODO, PLACEHOLDER, etc.)

**Pass Criteria:** All 5 agents score 100/100

---

### 4. Manual Testing (Google Sheet)

For tests that require human judgment (agent response quality, user experience):

**See:** `docs/TEST_EXECUTION_GUIDE.md` for manual test checklist

**Tests Include:**
- Agent response quality (tone, accuracy, deliverables)
- End-to-end WhatsApp messaging flow
- Error message clarity
- Performance perception

---

## Environment Variables

**Required for Testing:**

| Variable | Description | Example |
|----------|-------------|---------|
| `TEST_PHONE_NUMBER` | Authorized test phone | `+1234567890` |
| `UNAUTHORIZED_TEST_NUMBER` | Unauthorized test phone | `+0987654321` |
| `GITHUB_USERNAME` | GitHub username | `bdusape` |
| `GITHUB_REPO` | Repository name | `the-cockpit` |
| `GITHUB_BRANCH` | Branch to test | `main` |

**Optional (for full E2E tests):**

| Variable | Description |
|----------|-------------|
| `PIPEDREAM_WEBHOOK_URL` | Pipedream workflow webhook |
| `PIPEDREAM_API_KEY` | For fetching execution logs |
| `PIPEDREAM_SOURCE_ID` | Source ID for logs |
| `CLAUDE_API_KEY` | For Claude API contract tests |

**Setup:**
```bash
cp .env.example .env.test
# Edit .env.test with your values
npm run validate:config  # Verify setup
```

---

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test Suites

```bash
# Critical flows only
npm run test:critical

# Integration tests only
npm run test:integration

# Specific file
npm test -- critical-flows.spec.ts

# With UI (interactive mode)
npm run test:ui

# Debug mode
npm run test:debug
```

### Validation Scripts

```bash
# Validate agent configurations
npm run validate:agents

# Validate environment config
npm run validate:config
```

---

## Test Reports

After running tests, view results:

```bash
# Open HTML report
npm run test:report
```

Reports are saved to:
- `test-results/html-report/` - Interactive HTML report
- `test-results/results.json` - Machine-readable JSON

---

## CI/CD Integration

### GitHub Actions (Example)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run validate:agents
      - run: npm run validate:config
      - run: npm run test:integration
      - run: npm run test:critical
        env:
          GITHUB_USERNAME: ${{ secrets.GITHUB_USERNAME }}
          GITHUB_REPO: ${{ secrets.GITHUB_REPO }}
          GITHUB_BRANCH: main
```

---

## Troubleshooting

### Common Issues

**1. "baseURL not configured" error**

**Solution:**
```bash
# Set Pipedream webhook URL in .env.test
PIPEDREAM_WEBHOOK_URL=https://pipedream.com/sources/dc_XXX/events
```

**2. GitHub agent tests fail with 404**

**Solution:**
- Verify `GITHUB_BRANCH` is correct (usually `main`)
- Check agents are pushed to that branch
- For private repos, add `GITHUB_TOKEN`

**3. Claude API tests fail with 401**

**Solution:**
- Verify `CLAUDE_API_KEY` starts with `sk-ant-`
- Check API key is valid in console.anthropic.com
- Ensure you have sufficient credits

**4. Tests timeout**

**Solution:**
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify external APIs are operational

**5. Agent validation fails**

**Solution:**
- Check agent files have required sections (## Role, ## Personality, etc.)
- Ensure files are >1000 characters
- Remove any TODO/PLACEHOLDER text

---

## Test Data

### Fixtures

**Location:** `tests/fixtures/`

- `queries.json` - Test queries for all 5 agents
- `whatsapp-payloads.ts` - WhatsApp webhook payload helpers

### Adding New Test Data

**Example:**

```json
// tests/fixtures/queries.json
{
  "new_agent": {
    "happy_path": "Test query for new agent",
    "edge_cases": [
      "Edge case 1",
      "Edge case 2"
    ],
    "expected_keywords": ["keyword1", "keyword2"]
  }
}
```

---

## Writing New Tests

### Example: New Agent Test

```typescript
// tests/agents/new-agent.spec.ts
import { test, expect } from '@playwright/test';
import { createAuthorizedPayload } from '../fixtures/whatsapp-payloads';
import queries from '../fixtures/queries.json';

test.describe('New Agent Tests @agents', () => {
  test('should activate new agent', async ({ request }) => {
    const payload = createAuthorizedPayload(queries.new_agent.happy_path);

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: payload,
    });

    expect(response.status()).toBe(200);
  });
});
```

---

## Test Coverage Goals

### Current Coverage

- ✅ **Agent Structure:** 100% (5/5 agents validated)
- ✅ **Critical Flows:** 80% (8/10 automated, 2 manual)
- ✅ **API Integrations:** 60% (GitHub + Claude tested, WhatsApp pending)
- ⏳ **Agent Quality:** Manual testing required
- ⏳ **Performance:** Baseline established, ongoing monitoring

### MVP Launch Requirements

- [x] P1: Core User Flow Testing - 8/10 passed
- [x] P2: Agent Quality Assurance - 5/5 validated
- [x] P3: Security & Authorization - Scripts created
- [x] P4: API Health Checks - GitHub + Claude tested
- [x] P5: Error Handling - Pipedream scripts created
- [x] P6: Context Validation - Documentation provided
- [x] P7: Performance Baseline - Metrics logging ready

---

## Resources

### Documentation

- `../docs/MVT_STRATEGY.md` - Complete testing strategy
- `../docs/TEST_EXECUTION_GUIDE.md` - Step-by-step test execution
- `../docs/SETUP_GUIDE.md` - Deployment instructions

### Playwright Resources

- [Playwright Docs](https://playwright.dev/docs/intro)
- [API Testing Guide](https://playwright.dev/docs/api-testing)
- [Best Practices](https://playwright.dev/docs/best-practices)

### The Cockpit Docs

- [Architecture](../docs/ARCHITECTURE.md)
- [Setup Guide](../docs/SETUP_GUIDE.md)
- [README](../README.md)

---

## Contributing

When adding new tests:

1. ✅ Follow existing test patterns
2. ✅ Add test data to `fixtures/`
3. ✅ Document expected behavior
4. ✅ Include error cases
5. ✅ Update this README if needed

---

## Support

Questions about testing? Check:

1. `docs/TEST_EXECUTION_GUIDE.md` - Detailed test instructions
2. `docs/MVT_STRATEGY.md` - Testing philosophy and strategy
3. GitHub Issues - Report test failures or bugs

---

## License

MIT License - Same as main project
