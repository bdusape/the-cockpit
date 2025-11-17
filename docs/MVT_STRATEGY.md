# Minimum Viable Testing (MVT) Strategy for The Cockpit

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** Pre-Production Testing Plan

---

## Executive Summary

The Cockpit is a **serverless, configuration-driven platform** without traditional application code. This unique architecture requires a specialized testing approach focused on:

- **Integration testing** (API orchestration)
- **End-to-end testing** (user flow validation)
- **Configuration validation** (agent prompt quality)
- **Monitoring & observability** (production health)

**Testing Philosophy:** Given the serverless nature and low monthly volume (30-300 messages), we prioritize **manual E2E testing** for MVP launch with **automated monitoring** for production stability.

---

## 1. MVP-Focused Testing Strategy

### 1.1 Test Type Hierarchy

```
Priority Level | Test Type              | Coverage | Why Critical for MVP
---------------|------------------------|----------|--------------------
🔴 CRITICAL    | E2E Integration Tests  | 80%      | Validates entire user journey
🟠 HIGH        | API Contract Tests     | 60%      | Ensures 3rd-party integrations work
🟡 MEDIUM      | Agent Response Quality | 40%      | Validates AI output meets standards
🟢 LOW         | Performance Tests      | 20%      | Nice-to-have; volume is low (<300/mo)
```

### 1.2 Required Test Types for MVP Launch

#### **CRITICAL: End-to-End Integration Tests**

**What:** Test complete user journey from WhatsApp → Workflow → Claude → WhatsApp
**Why:** The Cockpit is an integration layer; if any API fails, the entire system breaks
**Coverage Target:** 100% of critical user flows (5 agents × 2 scenarios each = 10 tests)

**Test Environment:**
- Real WhatsApp Business API (test phone number)
- Real Pipedream workflow (dev environment)
- Real Claude API (with test API key)
- Real GitHub (agent configs on test branch)

**Success Criteria:**
- Message delivered to WhatsApp within 30 seconds
- Agent responds with contextually relevant answer
- No error logs in Pipedream execution history
- Token usage logged correctly

---

#### **HIGH: API Contract Tests**

**What:** Validate that external APIs (WhatsApp, Claude, GitHub) return expected response formats
**Why:** Changes to 3rd-party APIs can break workflows without warning
**Coverage Target:** 100% of API endpoints used

**APIs to Test:**
1. **WhatsApp Business API** (`POST /messages`, `GET /webhook`)
2. **Claude API** (`POST /v1/messages`)
3. **GitHub Raw Content** (`GET /raw/.../agents/{agent}.md`)

**Success Criteria:**
- Status 200 responses for valid requests
- Error handling for 400/401/429/500 responses
- Response schemas match documented contracts
- Authentication tokens valid

---

#### **MEDIUM: Agent Response Quality Tests**

**What:** Manual review of agent outputs against expected deliverables
**Why:** LLM outputs can drift; prompts need validation before launch
**Coverage Target:** 5 agents × 3 test queries each = 15 manual tests

**Test Methodology:**
1. Send standardized test query to each agent
2. Evaluate response quality (relevance, format, tone)
3. Check for hallucinations or off-brand responses
4. Validate output format matches agent spec

**Success Criteria:**
- Agent stays in character
- Delivers expected output format (e.g., Twitter thread for Publicist)
- No inappropriate or off-topic content
- Response length appropriate (not cut off)

---

#### **LOW: Performance & Cost Tests** (Post-MVP)

**What:** Load testing, latency monitoring, cost validation
**Why:** Not critical for MVP (<300 messages/month), but essential for scaling
**Coverage Target:** Baseline metrics established

**Metrics to Track:**
- P50/P95/P99 response latency
- Token usage per agent per query type
- Monthly cost tracking (Claude + WhatsApp)
- Rate limit headroom

**Success Criteria:**
- 95% of responses < 30 seconds
- No rate limit errors from Claude/WhatsApp
- Monthly costs < $30 (budgeted threshold)

---

### 1.3 Test Exclusions for MVP

**Not Required for Launch:**
- ❌ Unit tests (no code to unit test)
- ❌ Load/stress tests (volume too low)
- ❌ UI tests (no UI; WhatsApp is the interface)
- ❌ Database tests (using stateless workflow storage)
- ❌ Security penetration testing (handle in Phase 2)

---

## 2. Go/No-Go Critical Test Cases

These **10 test scenarios** are mandatory for production launch. If any fail, deployment is blocked.

### 2.1 Core Functionality Tests (Go/No-Go)

#### **Test Case 1: Agent Activation - Happy Path**

**Scenario:** User sends `@publicist PropIQ launched on Product Hunt`

**Expected Outcome:**
- ✅ Publicist agent activates
- ✅ Response contains Twitter thread, LinkedIn post, email template
- ✅ Message delivered in < 30 seconds
- ✅ No errors logged in Pipedream

**Failure Impact:** 🔴 **BLOCKER** - Core functionality broken

---

#### **Test Case 2: Invalid Agent Handling**

**Scenario:** User sends `@invalidagent test query`

**Expected Outcome:**
- ✅ System responds with "Agent not found. Available: @publicist, @growth, @strategist, @content, @credit"
- ✅ No 500 errors logged
- ✅ User receives helpful error message

**Failure Impact:** 🔴 **BLOCKER** - Poor error handling breaks UX

---

#### **Test Case 3: Agent Switching**

**Scenario:**
1. User: `@publicist Create launch announcement`
2. Bot: [Publicist response]
3. User: `@strategist Should I delay launch?`

**Expected Outcome:**
- ✅ First message uses Publicist agent
- ✅ Second message switches to Strategist agent
- ✅ No context bleed between agents
- ✅ Both responses contextually appropriate

**Failure Impact:** 🔴 **BLOCKER** - Multi-agent experience broken

---

#### **Test Case 4: Long User Query (Token Limits)**

**Scenario:** User sends 500-word detailed business problem

**Expected Outcome:**
- ✅ Claude accepts query without truncation
- ✅ Response stays within 4096 token limit
- ✅ No timeout errors (<30s response time)

**Failure Impact:** 🟠 **HIGH** - Edge case handling required

---

#### **Test Case 5: Unauthorized User Access**

**Scenario:** Phone number NOT in `AUTHORIZED_USERS` sends `@publicist test`

**Expected Outcome:**
- ✅ Message rejected with "Unauthorized" response
- ✅ No Claude API call made (cost protection)
- ✅ Security event logged in Pipedream

**Failure Impact:** 🔴 **BLOCKER** - Security vulnerability

---

### 2.2 Integration Tests (Go/No-Go)

#### **Test Case 6: WhatsApp API Failure Handling**

**Scenario:** WhatsApp API returns 500 error when sending response

**Expected Outcome:**
- ✅ Workflow retries 3 times (with exponential backoff)
- ✅ Error logged with request ID
- ✅ User receives fallback message: "Service temporarily unavailable"
- ✅ No infinite retry loops

**Failure Impact:** 🔴 **BLOCKER** - Production incidents will escalate

---

#### **Test Case 7: Claude API Rate Limiting**

**Scenario:** User sends 10 messages in 1 minute (exceeds rate limit)

**Expected Outcome:**
- ✅ System detects 429 rate limit error
- ✅ User receives: "Too many requests. Please wait 60 seconds."
- ✅ Workflow pauses/queues subsequent messages
- ✅ No lost messages

**Failure Impact:** 🟠 **HIGH** - User frustration + potential data loss

---

#### **Test Case 8: GitHub Agent Config Unavailable**

**Scenario:** GitHub raw URL returns 404 (agent file moved/deleted)

**Expected Outcome:**
- ✅ Workflow detects missing agent config
- ✅ Falls back to cached version (if available)
- ✅ Sends admin alert: "Agent config missing: publicist.md"
- ✅ User receives graceful error

**Failure Impact:** 🟠 **HIGH** - Agent downtime unacceptable

---

#### **Test Case 9: Empty/Malformed User Message**

**Scenario:** User sends empty message or only whitespace

**Expected Outcome:**
- ✅ System validates input before processing
- ✅ Responds: "Please include a question or command."
- ✅ No Claude API call made (cost saving)

**Failure Impact:** 🟡 **MEDIUM** - Minor UX issue

---

#### **Test Case 10: Special Characters in User Query**

**Scenario:** User sends message with emojis, line breaks, special characters
`@growth How to go viral? 🚀\n\nTried everything:\n- SEO ✅\n- Ads ❌`

**Expected Outcome:**
- ✅ Message parsed correctly (special chars preserved)
- ✅ Claude receives formatted query
- ✅ Response maintains readability in WhatsApp

**Failure Impact:** 🟡 **MEDIUM** - Common user behavior

---

### 2.3 Agent-Specific Tests (Smoke Tests)

**Test Each Agent with Representative Query:**

| Agent | Test Query | Expected Deliverable |
|-------|-----------|---------------------|
| `@publicist` | "PropIQ got 100 Chrome installs" | Twitter thread, LinkedIn post, email |
| `@growth` | "LinkedIn posts get <100 views" | Algorithm analysis, optimization tips |
| `@strategist` | "Pivot from SaaS to content?" | ROI analysis, 90-day plan |
| `@content` | "TikTok script for PropIQ demo" | Hook, script, CTA |
| `@credit` | "Improve 650 credit score?" | Action plan, timeline |

**Success Criteria:**
- ✅ All 5 agents respond within 30 seconds
- ✅ Output format matches agent specification
- ✅ No generic/off-brand responses
- ✅ Tone/personality consistent with agent docs

**Failure Impact:** 🔴 **BLOCKER** - Broken agent = broken value prop

---

## 3. Example Test Configurations

### 3.1 Playwright E2E Test Suite (API-Based)

Since The Cockpit has no UI, we use **Playwright as an API testing framework** to simulate WhatsApp messages.

#### **Setup: Install Dependencies**

```bash
# Initialize Node.js project for testing
npm init -y
npm install --save-dev @playwright/test dotenv
```

#### **Configuration: `playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000, // 60 seconds (Claude API can be slow)
  retries: 2, // Retry flaky API tests
  use: {
    baseURL: process.env.PIPEDREAM_WEBHOOK_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
});
```

---

### 3.2 Example Test: Agent Activation (Happy Path)

**File:** `tests/agents/publicist.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Publicist Agent - Critical Flows', () => {

  test('should activate and generate multi-platform announcement', async ({ request }) => {
    // Simulate WhatsApp webhook payload
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: process.env.TEST_PHONE_NUMBER,
              type: 'text',
              text: {
                body: '@publicist PropIQ just hit 100 Chrome extension installs!'
              }
            }]
          }
        }]
      }]
    };

    // Send to Pipedream webhook
    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
      headers: {
        'X-Hub-Signature': process.env.WHATSAPP_VERIFY_TOKEN,
      },
    });

    // Validate workflow accepted request
    expect(response.status()).toBe(200);

    // Wait for async processing (Pipedream → Claude → WhatsApp)
    await test.step('Wait for agent response', async () => {
      // Poll WhatsApp API to check for bot's response
      // (Alternatively, use Pipedream's execution API to check logs)
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay
    });

    // Fetch execution logs from Pipedream API
    const executionLogs = await request.get(
      `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PIPEDREAM_API_KEY}`,
        },
      }
    );

    const logs = await executionLogs.json();
    const latestExecution = logs.data[0];

    // Assertions
    expect(latestExecution.status).toBe('success');
    expect(latestExecution.steps).toHaveProperty('claude_api_call');

    const claudeResponse = latestExecution.steps.claude_api_call.content[0].text;

    // Validate response contains expected deliverables
    expect(claudeResponse).toContain('Twitter'); // Twitter thread
    expect(claudeResponse).toContain('LinkedIn'); // LinkedIn post
    expect(claudeResponse.length).toBeGreaterThan(200); // Substantial response

    // Validate cost tracking
    expect(latestExecution.metadata.tokens_used).toBeLessThan(4096);
    expect(latestExecution.metadata.cost_usd).toBeLessThan(0.05);
  });

  test('should handle invalid agent gracefully', async ({ request }) => {
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: process.env.TEST_PHONE_NUMBER,
              type: 'text',
              text: {
                body: '@invalidagent test query'
              }
            }]
          }
        }]
      }]
    };

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
    });

    expect(response.status()).toBe(200);

    // Check execution logs
    await new Promise(resolve => setTimeout(resolve, 5000));

    const executionLogs = await request.get(
      `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PIPEDREAM_API_KEY}`,
        },
      }
    );

    const logs = await executionLogs.json();
    const latestExecution = logs.data[0];

    // Should NOT call Claude API (cost optimization)
    expect(latestExecution.steps).not.toHaveProperty('claude_api_call');

    // Should send error message via WhatsApp
    expect(latestExecution.steps.send_whatsapp_message.message).toContain('Agent not found');
    expect(latestExecution.steps.send_whatsapp_message.message).toContain('@publicist');
  });

  test('should enforce authorization', async ({ request }) => {
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '+1234567890', // Unauthorized number
              type: 'text',
              text: {
                body: '@publicist test'
              }
            }]
          }
        }]
      }]
    };

    const response = await request.post(process.env.PIPEDREAM_WEBHOOK_URL!, {
      data: webhookPayload,
    });

    expect(response.status()).toBe(403); // Or 200 with auth error in body

    const executionLogs = await request.get(
      `https://api.pipedream.com/v1/sources/${process.env.PIPEDREAM_SOURCE_ID}/events`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PIPEDREAM_API_KEY}`,
        },
      }
    );

    const logs = await executionLogs.json();
    const latestExecution = logs.data[0];

    // Should block request early
    expect(latestExecution.steps.authorization_check.result).toBe('rejected');
    expect(latestExecution.steps).not.toHaveProperty('claude_api_call');
  });
});
```

---

### 3.3 Example Test: API Contract Validation

**File:** `tests/integrations/claude-api.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Claude API Integration', () => {

  test('should return valid response for standard query', async ({ request }) => {
    const response = await request.post('https://api.anthropic.com/v1/messages', {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      data: {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: 'Write a 2-sentence product announcement for a Chrome extension.'
          }
        ]
      }
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

  test('should handle rate limiting gracefully', async ({ request }) => {
    // Send 51 requests rapidly to trigger rate limit (50/min limit)
    const requests = Array(51).fill(null).map(() =>
      request.post('https://api.anthropic.com/v1/messages', {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        data: {
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }]
        }
      }).catch(err => err)
    );

    const responses = await Promise.all(requests);

    // At least one should be rate limited
    const rateLimitedResponse = responses.find(r => r.status?.() === 429);
    expect(rateLimitedResponse).toBeDefined();

    const body = await rateLimitedResponse.json();
    expect(body.error.type).toBe('rate_limit_error');
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
        messages: [{ role: 'user', content: 'Hi' }]
      }
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error.type).toBe('authentication_error');
  });
});
```

---

### 3.4 Example Test: GitHub Agent Config Availability

**File:** `tests/integrations/github-agents.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const AGENTS = ['publicist', 'growth-hacker', 'strategist', 'content-strategist', 'credit-advisor'];

test.describe('GitHub Agent Configuration Availability', () => {

  for (const agent of AGENTS) {
    test(`should fetch ${agent}.md from GitHub`, async ({ request }) => {
      const url = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/main/agents/${agent}.md`;

      const response = await request.get(url);

      expect(response.status()).toBe(200);

      const content = await response.text();

      // Validate agent file structure
      expect(content).toContain('# Role:'); // Has role definition
      expect(content).toContain('# Personality:'); // Has personality traits
      expect(content).toContain('# Core Responsibilities:'); // Has responsibilities
      expect(content.length).toBeGreaterThan(1000); // Substantial content
    });
  }

  test('should handle missing agent file gracefully', async ({ request }) => {
    const url = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/main/agents/nonexistent-agent.md`;

    const response = await request.get(url);

    expect(response.status()).toBe(404);
  });
});
```

---

### 3.5 Manual Test Checklist (Google Sheet Template)

For MVP, **manual testing** is acceptable given low volume. Create a tracking sheet:

**Sheet URL:** `https://docs.google.com/spreadsheets/d/...` (copy template below)

| Test ID | Category | Scenario | Steps | Expected Result | Status | Tester | Date | Notes |
|---------|----------|----------|-------|-----------------|--------|--------|------|-------|
| TC-001 | Agent Activation | Publicist happy path | 1. Send `@publicist PropIQ launched`<br>2. Wait for response | Twitter thread + LinkedIn post + email | ⏳ Pending | - | - | - |
| TC-002 | Error Handling | Invalid agent | 1. Send `@invalid test` | "Agent not found" message | ⏳ Pending | - | - | - |
| TC-003 | Agent Switching | Multi-agent conversation | 1. `@publicist` query<br>2. `@strategist` query | Both agents respond correctly | ⏳ Pending | - | - | - |
| TC-004 | Edge Case | Long query (500 words) | 1. Send long message | No truncation/timeout | ⏳ Pending | - | - | - |
| TC-005 | Security | Unauthorized user | 1. Send from non-authorized number | Rejected with error | ⏳ Pending | - | - | - |
| TC-006 | Integration | WhatsApp API down | 1. Disable WhatsApp API<br>2. Send message | Retry + fallback message | ⏳ Pending | - | - | - |
| TC-007 | Integration | Claude rate limit | 1. Send 10 rapid messages | Rate limit error handled | ⏳ Pending | - | - | - |
| TC-008 | Integration | GitHub agent missing | 1. Delete agent file<br>2. Trigger agent | Fallback/error message | ⏳ Pending | - | - | - |
| TC-009 | Input Validation | Empty message | 1. Send blank message | "Please include a question" | ⏳ Pending | - | - | - |
| TC-010 | Input Validation | Special characters | 1. Send emojis/line breaks | Parsed correctly | ⏳ Pending | - | - | - |

**Status Legend:**
- ⏳ **Pending** - Not started
- 🔄 **In Progress** - Testing underway
- ✅ **Passed** - Met expected result
- ❌ **Failed** - Did not meet criteria
- 🚫 **Blocked** - Cannot test (dependency issue)

---

### 3.6 Monitoring & Observability (Production Tests)

**Tool:** Pipedream Built-in Logging + Custom Metrics

#### **Setup: Pipedream Metrics Step**

Add this as final step in Pipedream workflow:

```javascript
// Step: Log Metrics
export default defineComponent({
  async run({ steps, $ }) {
    const metrics = {
      timestamp: new Date().toISOString(),
      agent: steps.parse_message.agent,
      user_phone: steps.webhook.from,
      query_length: steps.webhook.message.text.body.length,
      response_length: steps.claude_api.content[0].text.length,
      tokens_used: steps.claude_api.usage.input_tokens + steps.claude_api.usage.output_tokens,
      cost_usd: (steps.claude_api.usage.input_tokens * 0.000003) + (steps.claude_api.usage.output_tokens * 0.000015),
      latency_ms: Date.now() - new Date(steps.webhook.timestamp).getTime(),
      status: 'success',
    };

    // Log to Pipedream
    console.log('METRICS:', JSON.stringify(metrics));

    // Optional: Send to external analytics (Mixpanel, PostHog, etc.)
    // await $send.http({ url: 'https://analytics.example.com', method: 'POST', data: metrics });

    return metrics;
  },
});
```

#### **Alert Configuration**

Create Pipedream error notifications:

```javascript
// Step: Error Handler
export default defineComponent({
  async run({ steps, $ }) {
    if (steps.claude_api.$error) {
      // Send email alert
      await require("@sendgrid/mail").send({
        to: process.env.ADMIN_EMAIL,
        from: 'alerts@thecockpit.app',
        subject: '🚨 The Cockpit: Claude API Error',
        text: `
          Error: ${steps.claude_api.$error.message}
          Agent: ${steps.parse_message.agent}
          User: ${steps.webhook.from}
          Timestamp: ${new Date().toISOString()}
        `,
      });

      // Send fallback message to user
      await $.flow.exit('Error occurred. Our team has been notified.');
    }
  },
});
```

---

## 4. Top 7 MVT Checklist for Launch

**Pre-Deployment Validation Checklist** ✅

### **Priority 1: Core User Flow Testing** 🔴 CRITICAL

**Task:** Execute all 10 Go/No-Go test cases manually
**Effort:** 2-3 hours
**Business Impact:** **BLOCKER** - Cannot launch without validation
**User Risk:** **HIGH** - Broken flows = no value delivered

**Checklist:**
- [ ] TC-001: Publicist agent activation (happy path)
- [ ] TC-002: Invalid agent handling
- [ ] TC-003: Agent switching between conversations
- [ ] TC-004: Long query handling (500+ words)
- [ ] TC-005: Unauthorized user rejection
- [ ] TC-006: WhatsApp API failure retry logic
- [ ] TC-007: Claude API rate limit handling
- [ ] TC-008: GitHub agent config unavailable
- [ ] TC-009: Empty message validation
- [ ] TC-010: Special character parsing

**Acceptance Criteria:** 10/10 tests pass
**Rollback Plan:** If <8/10 pass, delay launch and fix failures

---

### **Priority 2: Agent Quality Assurance** 🔴 CRITICAL

**Task:** Smoke test all 5 agents with representative queries
**Effort:** 1-2 hours
**Business Impact:** **BLOCKER** - Poor agent quality kills retention
**User Risk:** **HIGH** - Bad advice damages reputation

**Test Queries:**

| Agent | Query | Success Criteria |
|-------|-------|------------------|
| `@publicist` | "PropIQ got 100 Chrome installs - create announcement" | Twitter thread + LinkedIn post + email format |
| `@growth` | "LinkedIn posts getting <100 views, what's wrong?" | Algorithm analysis + specific tactics |
| `@strategist` | "Should I pivot from PropIQ to content creation?" | ROI analysis + 90-day plan |
| `@content` | "Create TikTok script for PropIQ demo" | Hook + script + CTA in TikTok format |
| `@credit` | "How to improve 650 credit score in 6 months?" | Action plan + timeline + impact estimate |

**Checklist:**
- [ ] All agents respond in <30 seconds
- [ ] Output format matches agent specification
- [ ] Tone/personality consistent with brand
- [ ] No hallucinations or off-topic content
- [ ] Deliverables are actionable (not generic advice)

**Acceptance Criteria:** 5/5 agents deliver high-quality, on-brand responses
**Rollback Plan:** If agent fails, revise prompt in `agents/{agent}.md` and retest

---

### **Priority 3: Security & Cost Controls** 🟠 HIGH

**Task:** Validate authorization and cost protection mechanisms
**Effort:** 30 minutes
**Business Impact:** **HIGH** - Unauthorized access = runaway costs
**User Risk:** **MEDIUM** - Privacy breach if wrong user gets access

**Checklist:**
- [ ] `AUTHORIZED_USERS` environment variable set in Pipedream
- [ ] Test: Send message from unauthorized number → rejected
- [ ] Test: Send message from authorized number → accepted
- [ ] Verify Claude API call NOT made for unauthorized users
- [ ] Confirm token usage logged for all requests
- [ ] Validate monthly cost alerts configured (<$30 threshold)

**Acceptance Criteria:**
- Unauthorized users blocked 100% of the time
- Cost tracking visible in Pipedream logs
- Alert email sent when monthly cost >$20

**Rollback Plan:** If auth fails, add explicit authorization check as first workflow step

---

### **Priority 4: API Health Checks** 🟠 HIGH

**Task:** Verify all external API integrations are operational
**Effort:** 15 minutes
**Business Impact:** **HIGH** - Any API down = full system down
**User Risk:** **LOW** - Temporary downtime acceptable for MVP

**Checklist:**
- [ ] **WhatsApp Business API**: Test phone number verified
- [ ] **WhatsApp**: Send test message manually → receive confirmation
- [ ] **Claude API**: Test API key valid (send sample request)
- [ ] **Claude API**: Confirm model `claude-sonnet-4-5-20250929` accessible
- [ ] **GitHub**: Verify all 5 agent `.md` files accessible via raw URL
- [ ] **GitHub**: Test with private repo auth if applicable

**Acceptance Criteria:** All APIs return 200 status for valid requests
**Rollback Plan:** If any API unavailable, investigate credentials/access before launch

---

### **Priority 5: Error Handling & Monitoring** 🟡 MEDIUM

**Task:** Configure error logging and alerting in Pipedream
**Effort:** 30-45 minutes
**Business Impact:** **MEDIUM** - Production issues need visibility
**User Risk:** **LOW** - Doesn't block launch, but needed for stability

**Checklist:**
- [ ] Add error handler step in Pipedream workflow (catch all failures)
- [ ] Configure email alerts to admin for workflow errors
- [ ] Test: Trigger error (invalid Claude API key) → verify alert sent
- [ ] Add metrics logging step (tokens, cost, latency)
- [ ] Set up daily summary email (# messages, total cost, avg latency)

**Acceptance Criteria:**
- Error alerts trigger within 5 minutes of failure
- Metrics logged for 100% of successful conversations

**Rollback Plan:** Manual monitoring if alerts fail (check Pipedream dashboard daily)

---

### **Priority 6: Conversation Context Validation** 🟡 MEDIUM

**Task:** Test agent memory/context handling (if ENABLE_MEMORY=true)
**Effort:** 30 minutes
**Business Impact:** **MEDIUM** - Context improves UX but not critical for MVP
**User Risk:** **LOW** - MVP can launch with stateless agents

**Checklist:**
- [ ] **If memory disabled:** Confirm each message treated independently
- [ ] **If memory enabled:** Test multi-turn conversation:
  - Send: `@publicist Create Twitter thread for PropIQ`
  - Bot responds with thread
  - Send: `Make it more punchy`
  - Bot revises *same thread* (not generic response)
- [ ] Verify `clear` command resets conversation history
- [ ] Test memory expiration (24 hours per config)

**Acceptance Criteria:**
- Multi-turn conversations maintain context for ≤10 messages
- Memory cleared on `clear` command
- No memory leaks between different users

**Rollback Plan:** Set `ENABLE_MEMORY=false` if context bleed occurs

---

### **Priority 7: Performance Baseline** 🟢 LOW

**Task:** Establish baseline performance metrics for scaling
**Effort:** 15 minutes
**Business Impact:** **LOW** - Not critical for MVP launch
**User Risk:** **NONE** - Performance acceptable at current volume

**Checklist:**
- [ ] Measure P95 latency for 10 test messages (target: <30s)
- [ ] Calculate average tokens/message (target: <2000 tokens)
- [ ] Validate Pipedream execution time <25s (under 30s timeout)
- [ ] Document baseline cost per message ($0.01-0.05 range)

**Acceptance Criteria:**
- 95% of messages respond in <30 seconds
- Average cost per message <$0.05

**Rollback Plan:** N/A - informational only for MVP

---

## Summary: Go/No-Go Decision Matrix

| Priority | Checklist Item | Status | Blocker? | Notes |
|----------|----------------|--------|----------|-------|
| P1 🔴 | Core User Flow Testing (10 tests) | ⏳ | **YES** | Must pass 8/10 minimum |
| P2 🔴 | Agent Quality Assurance (5 agents) | ⏳ | **YES** | All agents must deliver on-brand outputs |
| P3 🟠 | Security & Cost Controls | ⏳ | **YES** | Unauthorized access = security risk |
| P4 🟠 | API Health Checks | ⏳ | **YES** | Any API down = system unusable |
| P5 🟡 | Error Handling & Monitoring | ⏳ | NO | Nice-to-have; can launch without |
| P6 🟡 | Conversation Context Validation | ⏳ | NO | Can disable memory if buggy |
| P7 🟢 | Performance Baseline | ⏳ | NO | Informational only |

**Launch Decision:** If P1-P4 all ✅, proceed with production deployment.

---

## Post-Launch Monitoring (Days 1-30)

### Week 1: Daily Checks
- [ ] Check Pipedream execution logs for errors (2x/day)
- [ ] Review token usage and costs (daily)
- [ ] Test 1-2 agent interactions manually (daily smoke test)
- [ ] Monitor WhatsApp Business API quotas

### Week 2-4: Weekly Reviews
- [ ] Analyze conversation patterns (which agents most used?)
- [ ] Review user feedback on response quality
- [ ] Check for any rate limiting issues
- [ ] Validate monthly costs tracking toward budget (<$30)

### Month 2+: Continuous Improvement
- [ ] Implement automated E2E tests (Playwright suite)
- [ ] Add conversation quality metrics (thumbs up/down in WhatsApp)
- [ ] Expand agent library based on usage patterns
- [ ] Consider scaling: Redis for memory, Supabase for analytics

---

## Appendix: Testing Tools & Resources

### Recommended Tools

| Tool | Purpose | Cost | Why Use? |
|------|---------|------|----------|
| **Playwright** | API E2E testing | Free (open-source) | Industry standard, great for API tests |
| **Pipedream Logs** | Workflow debugging | Free (included) | Built-in, no setup required |
| **PostHog** | User analytics | Free tier available | Track agent usage patterns |
| **Sentry** | Error monitoring | Free tier available | Production error tracking |
| **Google Sheets** | Manual test tracking | Free | Simple, shareable test case management |

### Test Environment Setup

**Required Environment Variables** (`.env.test`):
```bash
# Test phone numbers
TEST_PHONE_NUMBER=+1234567890
UNAUTHORIZED_TEST_NUMBER=+0987654321

# Pipedream test workflow
PIPEDREAM_WEBHOOK_URL=https://pipedream.com/sources/dc_XXX/events
PIPEDREAM_SOURCE_ID=dc_XXX
PIPEDREAM_API_KEY=your-pipedream-api-key

# Claude test API key (separate from production)
CLAUDE_API_KEY=sk-ant-test-key

# GitHub test branch (use separate branch for test agent configs)
GITHUB_BRANCH=test
```

### Test Data Management

**Test Queries Repository:** Store in `tests/fixtures/queries.json`

```json
{
  "publicist": [
    "PropIQ just hit 100 Chrome extension installs!",
    "Need to announce our Series A funding round",
    "Launching new feature tomorrow, create social posts"
  ],
  "growth": [
    "LinkedIn posts getting <100 views, what's wrong?",
    "How to optimize Twitter algorithm for tech content?",
    "Best posting times for SaaS audience?"
  ],
  "strategist": [
    "Should I pivot from PropIQ to content creation?",
    "Competitor just launched similar product, what to do?",
    "Choosing between feature X or Y with limited budget"
  ],
  "content": [
    "Create TikTok script for PropIQ demo",
    "Need YouTube video outline for productivity tips",
    "Write sponsorship pitch for tech podcast"
  ],
  "credit": [
    "How to improve 650 credit score in 6 months?",
    "Should I pay off credit card or student loan first?",
    "Best credit card for building credit from scratch?"
  ]
}
```

---

## Document Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-17 | Initial MVT strategy created | Claude (Senior Engineering Lead) |

---

**Next Steps:**
1. Review this strategy with team
2. Set up test environment (Playwright + test WhatsApp number)
3. Execute Top 7 MVT Checklist sequentially
4. Document results in tracking sheet
5. Make Go/No-Go decision based on P1-P4 results

**Questions?** Update this document as you learn from production usage.
