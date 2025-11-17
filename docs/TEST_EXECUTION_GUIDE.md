# Test Execution Guide - The Cockpit MVP Testing

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** Ready for Execution

---

## Pre-Requisites Checklist

Before running any tests, ensure the following are set up:

### Required Infrastructure

- [ ] **WhatsApp Business API** account created
- [ ] **Test WhatsApp phone number** verified and active
- [ ] **Pipedream** account created (or n8n/Zapier alternative)
- [ ] **Pipedream workflow** deployed (see SETUP_GUIDE.md)
- [ ] **Claude API key** obtained from console.anthropic.com
- [ ] **GitHub repository** accessible (agents pushed to main branch)

### Environment Configuration

- [ ] Copy `.env.example` to `.env.test`
- [ ] Fill in all required values in `.env.test`
- [ ] Run configuration validator: `npm run validate:config`

### Test Dependencies Installed

```bash
npm install
```

Verify installation:
```bash
npx playwright --version
# Should output: Version 1.40.0 or higher
```

---

## Test Execution Workflow

### Step 1: Validate Foundation (5 minutes)

**1.1 Validate Agent Configurations**

```bash
npm run validate:agents
```

**Expected Output:**
```
✅ publicist.md - Score: 100/100
✅ growth-hacker.md - Score: 100/100
✅ strategist.md - Score: 100/100
✅ content-strategist.md - Score: 100/100
✅ credit-advisor.md - Score: 100/100

✅ All agents validated successfully!
```

**If Failed:** Check agent markdown files have required sections (## Role, ## Personality, etc.)

---

**1.2 Validate Environment Configuration**

```bash
npm run validate:config
```

**Expected Output:**
```
✅ TEST_PHONE_NUMBER: +1234567890
✅ GITHUB_USERNAME: bdusape
✅ GITHUB_REPO: the-cockpit
✅ GITHUB_BRANCH: main
...
✅ All environment variables configured correctly!
```

**If Failed:** Update `.env.test` with missing values

---

### Step 2: API Health Checks (15 minutes)

**2.1 Test GitHub Agent Accessibility**

```bash
npm run test -- integrations/github-api.spec.ts
```

**Expected Output:**
```
✅ should fetch publicist.md from GitHub
✅ should fetch growth-hacker.md from GitHub
✅ should fetch strategist.md from GitHub
✅ should fetch content-strategist.md from GitHub
✅ should fetch credit-advisor.md from GitHub
✅ should handle missing agent file gracefully
✅ should fetch agent files within acceptable latency

7 passed (5.2s)
```

**If Failed:**
- Check `GITHUB_USERNAME`, `GITHUB_REPO`, `GITHUB_BRANCH` in `.env.test`
- Verify agents are pushed to the specified branch
- Check if repository is public (or add `GITHUB_TOKEN` for private repos)

---

**2.2 Test Claude API (Optional - requires API key)**

```bash
npm run test -- integrations/claude-api.spec.ts
```

**Expected Output:**
```
✅ should return valid response for standard query
✅ should respect max_tokens limit
✅ should reject invalid API key
✅ should handle invalid model name
✅ should validate response time is acceptable

5 passed (12.8s)
```

**If Failed:**
- Verify `CLAUDE_API_KEY` is valid (starts with `sk-ant-`)
- Check API key has sufficient credits/quota
- Ensure `CLAUDE_MODEL` is valid model name

**💰 Cost:** ~$0.01 for this test suite (approximately 2,000 tokens)

---

### Step 3: Critical Go/No-Go Tests (Manual + Automated)

These tests require a **deployed Pipedream workflow** with WhatsApp connected.

**3.1 Automated E2E Tests (requires Pipedream setup)**

```bash
npm run test -- critical-flows.spec.ts
```

**Expected Output:**
```
✅ TC-001: should activate Publicist agent [BLOCKER]
✅ TC-002: should handle invalid agent gracefully [BLOCKER]
✅ TC-003: should switch between agents correctly [BLOCKER]
✅ TC-004: should handle long queries without truncation [HIGH]
✅ TC-005: should reject unauthorized users [BLOCKER - SECURITY]
⊘ TC-006: should handle WhatsApp API failures (skipped - requires mocking)
⊘ TC-007: should handle Claude API rate limiting (skipped - avoid rate limits)
✅ TC-008: should handle missing GitHub agent config [HIGH]
✅ TC-009: should validate empty messages [MEDIUM]
✅ TC-010: should parse special characters correctly [MEDIUM]

8 passed, 2 skipped (45.3s)
```

**If Tests are Skipped:**
- Check `PIPEDREAM_WEBHOOK_URL` is set in `.env.test`
- Verify `PIPEDREAM_API_KEY` and `PIPEDREAM_SOURCE_ID` are configured
- Ensure Pipedream workflow is deployed and active

**Launch Decision:**
- ✅ **PASS** if all BLOCKER tests (TC-001, TC-002, TC-003, TC-005) pass
- ❌ **FAIL** if any BLOCKER test fails

---

**3.2 Manual E2E Tests (via WhatsApp)**

**⚠️ IMPORTANT:** These tests require sending actual WhatsApp messages to your test number.

Create a test tracking sheet (Google Sheets template):

| Test ID | Scenario | Action | Expected Result | Status | Notes |
|---------|----------|--------|-----------------|--------|-------|
| **TC-M01** | Agent activation | Send: `@publicist PropIQ hit 100 installs!` | Receives Twitter thread + LinkedIn post + email within 30s | ⏳ | |
| **TC-M02** | Invalid agent | Send: `@invalidagent test` | Receives error: "Agent not found..." | ⏳ | |
| **TC-M03** | Agent switching | Send: `@publicist test` then `@strategist test` | Both agents respond correctly | ⏳ | |
| **TC-M04** | Long query | Send 500-word detailed message | No truncation, response in <30s | ⏳ | |
| **TC-M05** | Unauthorized user | Send from unauthorized number | Rejected with "Unauthorized" message | ⏳ | |
| **TC-M06** | Empty message | Send blank/whitespace only | Error: "Please include a question" | ⏳ | |
| **TC-M07** | Special chars | Send: `@growth How to go viral? 🚀\n\nSEO ✅` | Parses emojis/line breaks correctly | ⏳ | |
| **TC-M08** | Publicist quality | Send: `@publicist` with real launch news | Output is on-brand, actionable | ⏳ | |
| **TC-M09** | Growth quality | Send: `@growth` with engagement problem | Specific, data-driven recommendations | ⏳ | |
| **TC-M10** | Strategist quality | Send: `@strategist` with business decision | ROI analysis + risk assessment | ⏳ | |

**Status Legend:**
- ⏳ **Pending** - Not started
- ✅ **Passed** - Met expected result
- ❌ **Failed** - Did not meet criteria
- 🚫 **Blocked** - Cannot test

**Execution:**
1. Open WhatsApp on your phone
2. Send message to your WhatsApp Business number
3. Wait for bot response (should arrive in <30 seconds)
4. Verify response matches expected result
5. Update status in tracking sheet
6. Document any issues in Notes column

**Pass Criteria:**
- All BLOCKER tests (TC-M01, TC-M02, TC-M03, TC-M05) must pass
- At least 8/10 total tests must pass
- No security vulnerabilities (TC-M05 must pass)

---

### Step 4: Agent Quality Validation (30 minutes)

**4.1 Agent Structure Validation (Automated)**

Already completed in Step 1 ✅

**4.2 Agent Response Quality (Manual)**

Test each agent with representative queries:

**Publicist Agent Test:**
```
You: @publicist PropIQ just got 100 Chrome extension installs! Create announcement content.

Expected Deliverables:
✅ Twitter thread (3-5 tweets with hooks)
✅ LinkedIn post (professional tone, value-focused)
✅ Email template (benefit-focused)
✅ On-brand tone (enthusiastic but not over-the-top)
✅ Includes metrics/social proof
✅ Clear CTAs

Quality Score: ___/10
```

**Growth Hacker Agent Test:**
```
You: @growth My LinkedIn posts are getting <100 views. What's wrong with my strategy?

Expected Deliverables:
✅ Algorithm analysis (platform-specific insights)
✅ Data-driven recommendations (not generic advice)
✅ Specific tactics (posting times, hashtags, formats)
✅ A/B test suggestions
✅ Realistic expectations

Quality Score: ___/10
```

**Strategist Agent Test:**
```
You: @strategist Should I pivot from PropIQ (SaaS) to content creation? I'm at $2k MRR.

Expected Deliverables:
✅ ROI analysis (quantitative comparison)
✅ Risk assessment (pros/cons)
✅ 90-day action plan (specific steps)
✅ Decision framework (how to evaluate)
✅ No generic platitudes

Quality Score: ___/10
```

**Content Strategist Agent Test:**
```
You: @content Create TikTok script for PropIQ demo - target real estate investors.

Expected Deliverables:
✅ Hook (first 3 seconds grabs attention)
✅ Full script (shot-by-shot breakdown)
✅ CTA (clear next action)
✅ Platform-optimized (TikTok best practices)
✅ Length appropriate (30-60 seconds)

Quality Score: ___/10
```

**Credit Advisor Agent Test:**
```
You: @credit How to improve 650 credit score in 6 months? I have $5k in CC debt.

Expected Deliverables:
✅ Action plan (prioritized steps)
✅ Timeline (realistic milestones)
✅ Impact estimates (score improvement projections)
✅ Specific tactics (not generic advice)
✅ Disclaim limitations (not financial advice)

Quality Score: ___/10
```

**Pass Criteria:**
- All agents score ≥7/10
- No hallucinations or off-topic responses
- Tone/personality consistent with agent spec
- Output format matches deliverables

**If Failed:** Update agent prompts in `agents/{agent}.md` and retest

---

### Step 5: Security & Authorization (10 minutes)

**5.1 Verify Authorization Configuration**

```bash
# Check AUTHORIZED_USERS is set
grep AUTHORIZED_USERS .env
```

**Expected Output:**
```
AUTHORIZED_USERS=1234567890,0987654321
```

**If Not Set:** Add your phone number(s) to `.env` in Pipedream

---

**5.2 Test Unauthorized Access Rejection**

1. Send message from phone number NOT in `AUTHORIZED_USERS`
2. Verify bot responds with: "⛔ Unauthorized. This service is private."
3. Check Pipedream logs - should NOT see Claude API call (cost protection)

**Pass Criteria:**
- ✅ Unauthorized users blocked 100% of the time
- ✅ No Claude API calls for unauthorized users
- ✅ Error message is clear and helpful

**If Failed:** Add authorization check as first step in Pipedream workflow using `workflows/pipedream/authorization-check.js`

---

**5.3 Cost Protection Verification**

Check Pipedream logs for cost tracking:

```
Expected Log Entry:
📊 METRICS: {
  "tokens_total": 1523,
  "cost_total_usd": 0.0273,
  "status": "success"
}
```

**Pass Criteria:**
- ✅ Token usage logged for every request
- ✅ Cost calculated correctly ($3 per 1M input tokens, $15 per 1M output tokens)
- ✅ Metrics visible in Pipedream logs

---

### Step 6: Error Handling & Monitoring (15 minutes)

**6.1 Add Error Handler to Pipedream**

1. Open your Pipedream workflow
2. Add new step: Custom Code (Node.js)
3. Copy code from `workflows/pipedream/error-handler.js`
4. Deploy workflow

**Test Error Handling:**

Simulate error by temporarily invalidating Claude API key in Pipedream:

1. Edit workflow → Change `CLAUDE_API_KEY` to invalid value
2. Send test message: `@publicist test`
3. Check logs for error handling

**Expected Output:**
```
🚨 ERRORS DETECTED: [{
  "step": "claude_api_call",
  "error": "Invalid API key",
  "type": "claude_api_error"
}]

EMAIL_ALERT: [alert details]
```

**Expected User Message:**
```
⚠️ Our AI is temporarily unavailable. Please try again in a few minutes.
```

**Pass Criteria:**
- ✅ Errors caught and logged
- ✅ Admin alert generated (email logged)
- ✅ User receives graceful error message (not technical details)

**Restore:** Change API key back to valid value

---

**6.2 Add Metrics Logger**

1. Add final step to Pipedream workflow
2. Copy code from `workflows/pipedream/metrics-logger.js`
3. Deploy workflow

**Test Metrics Logging:**

Send test message and check Pipedream logs:

**Expected Output:**
```
📊 METRICS: {
  "timestamp": "2025-11-17T12:34:56.789Z",
  "agent": "publicist",
  "tokens_total": 1523,
  "cost_total_usd": 0.0273,
  "latency_ms": 8234,
  "status": "success"
}
```

**Pass Criteria:**
- ✅ Metrics logged for every request
- ✅ Token usage and cost calculated
- ✅ Latency tracked

---

### Step 7: Performance Baseline (10 minutes)

**7.1 Measure Response Latency**

Send 10 test messages and record latency:

| Message # | Agent | Latency (seconds) |
|-----------|-------|-------------------|
| 1 | @publicist | ___ |
| 2 | @growth | ___ |
| 3 | @strategist | ___ |
| 4 | @content | ___ |
| 5 | @credit | ___ |
| 6 | @publicist | ___ |
| 7 | @growth | ___ |
| 8 | @strategist | ___ |
| 9 | @content | ___ |
| 10 | @credit | ___ |

**Calculate:**
- Average latency: _____ seconds
- P95 latency (95th percentile): _____ seconds
- Max latency: _____ seconds

**Pass Criteria:**
- ✅ Average latency < 20 seconds
- ✅ P95 latency < 30 seconds
- ✅ No timeouts (>30s)

---

**7.2 Measure Token Usage & Cost**

From Pipedream metrics logs:

| Agent | Avg Tokens | Avg Cost (USD) |
|-------|-----------|----------------|
| Publicist | ___ | $___ |
| Growth | ___ | $___ |
| Strategist | ___ | $___ |
| Content | ___ | $___ |
| Credit | ___ | $___ |

**Calculate Monthly Costs:**
- For 30 messages/month: $_____
- For 100 messages/month: $_____
- For 300 messages/month: $_____

**Pass Criteria:**
- ✅ Average cost per message < $0.10
- ✅ 300 messages/month < $30 budget

---

## Go/No-Go Launch Decision Matrix

### Critical Requirements (BLOCKERS)

- [ ] **P1: Core User Flow Testing** - 8/10 tests passed (automated + manual)
- [ ] **P2: Agent Quality Assurance** - All 5 agents score ≥7/10
- [ ] **P3: Security & Authorization** - Unauthorized access blocked 100%
- [ ] **P4: API Health Checks** - All external APIs (GitHub, Claude, WhatsApp) operational

**✅ GO Decision:** All 4 critical requirements met

**❌ NO-GO Decision:** Any critical requirement fails

---

### Recommended Requirements (Non-Blockers)

- [ ] **P5: Error Handling** - Errors caught and logged gracefully
- [ ] **P6: Conversation Context** - Memory handling works (if enabled)
- [ ] **P7: Performance Baseline** - P95 latency < 30 seconds

**Note:** These can be fixed post-launch without blocking deployment

---

## Post-Launch Monitoring (Days 1-7)

### Daily Checks

- [ ] Check Pipedream execution logs 2x/day
- [ ] Review token usage and costs
- [ ] Test 1-2 agent interactions manually (smoke test)
- [ ] Monitor for error alerts

### Weekly Review

- [ ] Analyze conversation patterns (which agents most used?)
- [ ] Review user feedback on response quality
- [ ] Check for rate limiting issues
- [ ] Validate monthly cost tracking toward budget (<$30)

---

## Troubleshooting

### Test Failures

**Symptom:** Playwright tests fail with "baseURL not set"
**Fix:** Set `PIPEDREAM_WEBHOOK_URL` in `.env.test`

**Symptom:** GitHub agent tests fail with 404
**Fix:** Verify `GITHUB_BRANCH` is correct and agents are pushed to that branch

**Symptom:** Claude API tests fail with 401
**Fix:** Verify `CLAUDE_API_KEY` is valid and starts with `sk-ant-`

**Symptom:** WhatsApp messages not received
**Fix:** Check WhatsApp Business API webhook is configured and pointing to Pipedream

### Manual Test Issues

**Symptom:** Bot doesn't respond to messages
**Fix:** Check Pipedream workflow is running, check execution logs for errors

**Symptom:** Bot responds slowly (>30s)
**Fix:** Check Claude API latency in logs, consider upgrading to faster model

**Symptom:** Agent gives generic/off-brand responses
**Fix:** Update agent prompt in `agents/{agent}.md`, redeploy by pushing to GitHub

---

## Test Artifacts

After completing all tests, generate these artifacts:

1. **Test Results Summary** (manual tests + automated)
2. **Agent Quality Scores** (5 agents × quality metrics)
3. **Performance Baseline** (latency, token usage, costs)
4. **Go/No-Go Decision** (launch readiness assessment)

Save all artifacts in `test-results/` directory for reference.

---

## Next Steps After Testing

### If All Tests Pass ✅

1. **Deploy to Production**
   - Update `.env` with production values
   - Set `NODE_ENV=production`
   - Deploy Pipedream workflow to production environment

2. **Enable Monitoring**
   - Set up email alerts for errors
   - Configure cost tracking alerts
   - Enable daily summary reports

3. **Launch**
   - Announce to authorized users
   - Monitor closely for first 24 hours
   - Collect user feedback

### If Tests Fail ❌

1. **Document Failures**
   - Record which tests failed
   - Capture error logs/screenshots
   - Note expected vs actual behavior

2. **Prioritize Fixes**
   - BLOCKER failures: Fix immediately
   - HIGH priority: Fix before retry
   - MEDIUM/LOW: Can be deferred

3. **Re-test**
   - Re-run failed tests after fixes
   - Complete full test suite before launch
   - Update test tracking sheet

---

**Questions?** Refer to:
- `docs/MVT_STRATEGY.md` - Full testing strategy
- `docs/SETUP_GUIDE.md` - Deployment instructions
- `docs/ARCHITECTURE.md` - Technical details
