# The Cockpit - Testing Checklist

Use this checklist to verify your MVP is working correctly.

**Last Updated:** November 17, 2025

---

## 🎯 Pre-Deployment Tests

Complete these before connecting WhatsApp:

### Environment Setup
- [ ] All environment variables set in Pipedream
  - [ ] `CLAUDE_API_KEY` is valid
  - [ ] `WHATSAPP_TOKEN` is set
  - [ ] `WHATSAPP_PHONE_NUMBER_ID` is correct
  - [ ] `WHATSAPP_VERIFY_TOKEN` is set
  - [ ] `GITHUB_USERNAME` and `GITHUB_REPO` are correct

### Workflow Deployment
- [ ] All 8 steps added to workflow
- [ ] Each step compiles without errors
- [ ] Workflow is deployed (green checkmark)
- [ ] Webhook URL is copied and saved

### GitHub Repository
- [ ] All 5 agent .md files exist in `agents/` folder
- [ ] Repository is public OR GitHub token is configured
- [ ] Branch name matches `GITHUB_BRANCH` variable (usually `main`)

---

## 🔌 Webhook Verification Tests

### WhatsApp Webhook Setup
- [ ] Webhook URL entered in Meta Developer Console
- [ ] Verify token matches between Pipedream and Meta
- [ ] Webhook verification succeeds (green checkmark in Meta console)
- [ ] Subscribed to `messages` webhook event
- [ ] Your phone number is verified as recipient

---

## 🤖 Core Functionality Tests

### Test 1: Help Command
**Send:** `help`

**Expected Response:**
```
🤖 The Cockpit - Your AI Agent Team

Available Agents:

📣 @publicist - PR, announcements, content creation
📈 @growth - Growth hacking, algorithms, virality
...
```

- [ ] Response received within 5 seconds
- [ ] All 5 agents listed
- [ ] Commands explained
- [ ] Example provided

---

### Test 2: Agent Activation (No Query)

**Send:** `@publicist`

**Expected:** Greeting message like "Publicist agent activated! How can I help with your announcements today?"

- [ ] Agent greets you warmly
- [ ] Response is brief (2-3 sentences)
- [ ] Response is on-brand for the agent

**Repeat for all agents:**
- [ ] `@publicist` - Greeting received
- [ ] `@growth` - Greeting received
- [ ] `@strategist` - Greeting received
- [ ] `@content` - Greeting received
- [ ] `@credit` - Greeting received

---

### Test 3: Agent with Query

**Send:** `@publicist PropIQ hit 100 users!`

**Expected:** Creates announcement content (Twitter thread, LinkedIn post, etc.)

- [ ] Response is relevant to the query
- [ ] Response is in the publicist's style
- [ ] Multiple content formats provided
- [ ] Response quality is high (would actually use it)

---

### Test 4: Conversation Memory

**Send:** `@strategist Should I focus on PropIQ or pivot to content creation?`

**Wait for response, then send (WITHOUT @strategist):**
`What metrics should I track for either path?`

**Expected:** Strategist responds with context from previous message

- [ ] Agent remembers previous context
- [ ] Response references the "PropIQ vs content" decision
- [ ] No need to re-explain the situation

---

### Test 5: Agent Switching

**Send:** `@publicist`
**Then send:** `Create a tweet about AI automation`

**Wait for response, then:**
**Send:** `@growth`
**Then send:** `How do I make that tweet go viral?`

**Expected:** Growth agent responds with virality tactics

- [ ] Agent switch is seamless
- [ ] Growth agent doesn't have publicist context (separate conversations)
- [ ] Each agent stays in character

---

### Test 6: Special Commands

**Send:** `clear`

**Expected:** "✅ Conversation cleared! Which agent would you like to talk to?"

- [ ] Confirmation message received
- [ ] Memory cleared (test by sending message to previous agent - should not remember context)

**Send:** `help`

- [ ] Help message appears again
- [ ] All agents listed

---

## 🧠 Memory Persistence Tests

### Test 7: Multi-Turn Conversation

**Send:** `@publicist`
**Send:** `PropIQ hit 500 users`
**Send:** `Also we just raised $50k`
**Send:** `Can you create a combined announcement?`

**Expected:** Publicist references both milestones in the announcement

- [ ] Agent remembers 500 users
- [ ] Agent remembers $50k raise
- [ ] Creates combined announcement
- [ ] Conversation flows naturally

---

### Test 8: Memory Limits

**Send 6-7 messages to @strategist** (about different topics)

**Then send:** `What was the first thing I asked you?`

**Expected:** Agent may not remember (memory limited to last 10 messages)

- [ ] Memory is working for recent messages (last 5 exchanges)
- [ ] Old messages are forgotten (as designed)

---

## 🚨 Error Handling Tests

### Test 9: Invalid Agent

**Send:** `@invalidagent`

**Expected:** Error message listing available agents

- [ ] Error is graceful (not a crash)
- [ ] Lists available agents
- [ ] Suggests correct format

---

### Test 10: Empty Message

**Send:** `@publicist`
**Then immediately send:** `@growth`

**Expected:** Each agent sends a greeting, no errors

- [ ] No crashes
- [ ] Both greetings received
- [ ] System handles rapid agent switching

---

## 📊 Monitoring & Metrics Tests

### Test 11: Check Execution Logs

1. Go to Pipedream workflow
2. Click "Events"
3. Find your latest test messages
4. Click on an execution

**Verify:**
- [ ] All 8 steps completed successfully
- [ ] No error messages in logs
- [ ] Token usage is logged
- [ ] Estimated cost is calculated

---

### Test 12: Metrics Logging

**Send several messages to different agents**

**Then check:** Last execution → `log_metrics` step

**Verify:**
- [ ] Daily stats are tracked (messages, tokens, cost)
- [ ] Per-agent usage is tracked
- [ ] Monthly stats are accumulated
- [ ] Costs are reasonable (<$0.10 for 10 messages)

---

## 🎨 User Experience Tests

### Test 13: Response Quality

**Send:** `@publicist Write a Product Hunt launch post for PropIQ`

**Evaluate:**
- [ ] Response is well-structured
- [ ] Includes all key elements (tagline, description, CTA)
- [ ] Tone is appropriate
- [ ] You would actually use this content
- [ ] Response length is appropriate (not too short, not too long)

---

### Test 14: Response Time

**Send:** `@strategist What should I focus on this week?`

**Measure time to first response:**
- [ ] Response received in <5 seconds (most cases)
- [ ] Response received in <10 seconds (acceptable)
- [ ] If >10 seconds, check Pipedream logs for bottlenecks

---

### Test 15: Error Messages are Helpful

**Deliberately cause an error** (e.g., set CLAUDE_API_KEY to invalid value in Pipedream)

**Send:** `@publicist test`

**Expected:** Graceful error message (not technical jargon)

- [ ] Error message is user-friendly
- [ ] Error is logged in Pipedream
- [ ] System doesn't crash
- [ ] Can recover after fixing the error

---

## 📱 Real-World Usage Tests

### Test 16: Daily Use Simulation

**Use the bot for real work for 2 days:**

Day 1:
- [ ] Ask @strategist for weekly priorities
- [ ] Ask @publicist to draft an announcement
- [ ] Ask @growth for content ideas
- [ ] Use @content to create a script
- [ ] Check @credit for financial advice

Day 2:
- [ ] Continue conversations from Day 1
- [ ] Test memory persistence across 24 hours
- [ ] Verify billing/costs are reasonable
- [ ] Note any friction points or bugs

**Document:**
- [ ] What worked well?
- [ ] What was frustrating?
- [ ] What features are missing?
- [ ] Would you use this daily?

---

## 🔒 Security & Privacy Tests

### Test 17: Unauthorized Access

**Ask a friend to message the test number (without being verified)**

**Expected:** No response OR error message (depending on authorization settings)

- [ ] Unauthorized users cannot use the bot
- [ ] (If authorization is enabled)

---

### Test 18: API Key Security

**Check that API keys are not exposed:**
- [ ] View Pipedream execution logs - API keys are not visible
- [ ] Check GitHub repo - no `.env` files committed
- [ ] Environment variables are in Pipedream only (not in code)

---

## 💰 Cost Validation Tests

### Test 19: Cost Tracking

**After 20-30 test messages:**

1. Check Pipedream → Workflow → Events → Latest execution → `log_metrics` step
2. Find `monthlyStats.cost`

**Verify:**
- [ ] Cost is tracked accurately
- [ ] 20 messages cost ~$0.05-0.20 (depending on model)
- [ ] Costs are within expected range

**Calculate projected monthly cost:**
- If 20 messages = $0.10, then 300 messages = ~$1.50/month ✅

---

## ✅ MVP Acceptance Criteria

**Your MVP is ready for dogfooding when:**

### Core Functionality
- [✅] All 5 agents work correctly
- [✅] Conversation memory persists
- [✅] Agent switching is seamless
- [✅] Help and clear commands work

### Performance
- [✅] Responses in <5 seconds (95% of time)
- [✅] No crashes or errors in 20+ messages
- [✅] Memory persists across sessions

### Quality
- [✅] Agent responses are high-quality
- [✅] You would actually use this for real work
- [✅] At least 3 "wow, this is useful" moments

### Metrics
- [✅] Usage tracking works
- [✅] Costs are reasonable (<$5/month projected)
- [✅] No unexpected errors in logs

### Documentation
- [✅] You understand how to debug issues
- [✅] You can modify agent prompts
- [✅] You know how to check metrics

---

## 🚀 Ready to Ship?

If all core tests pass, you're ready to:

1. **Use it daily for 5+ days** (dogfooding phase)
2. **Iterate on agent prompts** based on quality
3. **Add Phase 2 features** (agent collaboration, voice, etc.)
4. **Invite beta users** (10-20 founder friends)

---

## 🐛 Bug Tracking

**Found a bug? Document it here:**

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Example: Memory not persisting | High | Fixed | Was not calling update_memory step |
|  |  |  |  |
|  |  |  |  |

---

## 📊 Test Results Summary

**Date:** _______________

**Tester:** _______________

**Results:**
- Tests Passed: ___ / 19
- Critical Issues: ___
- Minor Issues: ___

**Overall Status:**
- [ ] ✅ Ready for dogfooding
- [ ] ⚠️ Needs fixes before use
- [ ] ❌ Major issues, not functional

**Notes:**
```
[Your notes here]
```

---

**Happy Testing! 🧪**
