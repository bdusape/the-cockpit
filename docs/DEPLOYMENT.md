# The Cockpit - Deployment Guide

**Goal:** Deploy your working MVP in 2-4 hours

**Last Updated:** November 17, 2025

---

## 🎯 Overview

This guide will walk you through deploying The Cockpit WhatsApp bot from scratch. By the end, you'll have a fully functional AI agent platform accessible via WhatsApp.

**Total Time:** 2-4 hours (depending on experience)

---

## 📋 Prerequisites Checklist

Before you start, gather these:

- [ ] WhatsApp account (your personal phone number)
- [ ] Facebook/Meta account
- [ ] Anthropic API key (from https://console.anthropic.com/)
- [ ] Computer with internet access
- [ ] 2-4 hours of focused time

---

## 🚀 Deployment Steps

### **Step 1: Get Your Anthropic Claude API Key** (10 minutes)

#### 1.1 Create Anthropic Account

1. Go to https://console.anthropic.com/
2. Click "Sign Up"
3. Enter email and create password
4. Verify your email

#### 1.2 Generate API Key

1. Log in to Anthropic Console
2. Click "API Keys" in left sidebar
3. Click "Create Key"
4. Name it `The Cockpit`
5. **CRITICAL:** Copy the key (starts with `sk-ant-api03-`) and save it somewhere safe
   - You cannot view this key again after closing the dialog
   - Store it in a password manager or secure note

#### 1.3 Add Credits

- New accounts get $5 free credits (enough for ~2,500 messages)
- For production, add payment method:
  - Click "Billing" → Add credit card
  - Set spending limit (e.g., $10/month)

**✅ Checkpoint:** You have a Claude API key saved securely

---

### **Step 2: Set Up WhatsApp Business API** (30-45 minutes)

#### 2.1 Create Meta Developer Account

1. Go to https://developers.facebook.com/
2. Click "Get Started"
3. Log in with Facebook (or create account)
4. Complete developer registration

#### 2.2 Create Facebook App

1. Click "My Apps" → "Create App"
2. Select **"Business"** as app type
3. Fill in:
   - **App Name:** `The Cockpit`
   - **App Contact Email:** Your email
   - **Business Account:** Create new or select existing
4. Click "Create App"

#### 2.3 Add WhatsApp Product

1. In app dashboard, find **"WhatsApp"**
2. Click "Set Up"
3. Follow wizard:
   - Select/create Meta Business Account
   - Create WhatsApp Business Profile
   - **IMPORTANT:** You need a phone number not currently on WhatsApp

#### 2.4 Get Test Phone Number (For Development)

**For testing (FREE):**
- Meta provides a test number
- Can message up to 5 verified recipients
- Perfect for MVP validation

**Steps:**
1. In WhatsApp → API Setup, note the **test phone number**
2. Click "Add recipient phone number"
3. Enter **YOUR personal WhatsApp number**
4. You'll receive a verification code on WhatsApp
5. Enter the code to verify

#### 2.5 Get Your Credentials

In WhatsApp → API Setup, copy these:

1. **Phone Number ID** (long number like `123456789012345`)
2. **Temporary Access Token** (starts with `EAAG...`)

**⚠️ Warning:** Temporary token expires in 24 hours. We'll create a permanent one next.

#### 2.6 Create Permanent Access Token (RECOMMENDED)

1. Go to Business Settings → System Users
2. Click "Add" to create system user:
   - Name: `The Cockpit Bot`
   - Role: `Admin`
3. Click on the system user
4. Click "Generate New Token"
5. Select your app (`The Cockpit`)
6. Choose permissions:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
7. Copy the token (starts with `EAAG...`)
8. **Save this token securely** - this won't expire

**✅ Checkpoint:** You have Phone Number ID and permanent Access Token saved

---

### **Step 3: Set Up Pipedream** (15 minutes)

#### 3.1 Create Pipedream Account

1. Go to https://pipedream.com/
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Verify your email

**Free Tier:**
- 100 workflow executions/month
- Unlimited workflows
- Built-in data storage
- No credit card required

#### 3.2 Create New Workflow

1. In Pipedream dashboard, click "New Workflow"
2. Name it `Cockpit WhatsApp Handler`
3. Click "Create"

**✅ Checkpoint:** You have a blank Pipedream workflow open

---

### **Step 4: Build the Workflow** (60-90 minutes)

Now we'll add all 8 steps to your workflow.

#### 4.1 Add HTTP Webhook Trigger

1. Click "Select a trigger"
2. Search for "HTTP"
3. Select **"HTTP / Webhook Requests"**
4. Click "Create Source"
5. Name it `whatsapp_webhook`
6. **COPY THE WEBHOOK URL** (looks like `https://xxx.m.pipedream.net`)
   - Save this - you'll need it soon

#### 4.2 Configure Environment Variables

Before adding steps, set up your environment variables:

1. Click "Settings" (left sidebar)
2. Click "Environment Variables"
3. Add these variables:

```
CLAUDE_API_KEY = sk-ant-api03-your-key-here
WHATSAPP_TOKEN = EAAG...your-token-here
WHATSAPP_PHONE_NUMBER_ID = 123456789012345
WHATSAPP_VERIFY_TOKEN = cockpit_verify_2025_random_string
GITHUB_USERNAME = briandusape
GITHUB_REPO = the-cockpit
GITHUB_BRANCH = main
```

**For `WHATSAPP_VERIFY_TOKEN`:** Create a random string (e.g., `cockpit_verify_2025_random_xyz123`)

#### 4.3 Add Workflow Steps

Now add each step by clicking the "+" button after the trigger:

**STEP 1: Verify Webhook**
1. Click "+" → Search "Code" → Select "Node.js"
2. Name it `verify_webhook`
3. Copy the code from `/workflows/pipedream/steps/1-verify-webhook.js`
4. Paste it into the code editor
5. Click "Test" to ensure it compiles

**STEP 2: Parse Message**
1. Click "+" → "Node.js"
2. Name it `parse_message`
3. Copy code from `/workflows/pipedream/steps/2-parse-message.js`
4. Paste and test

**STEP 3: Get Conversation Memory**
1. Click "+" → "Node.js"
2. Name it `get_memory`
3. Copy code from `/workflows/pipedream/steps/3-get-conversation-memory.js`
4. Paste and test

**STEP 4: Load Agent**
1. Click "+" → "Node.js"
2. Name it `load_agent`
3. Copy code from `/workflows/pipedream/steps/4-load-agent.js`
4. Paste and test

**STEP 5: Call Claude API**
1. Click "+" → "Node.js"
2. Name it `call_claude`
3. Copy code from `/workflows/pipedream/steps/5-call-claude.js`
4. Paste and test

**STEP 6: Update Memory**
1. Click "+" → "Node.js"
2. Name it `update_memory`
3. Copy code from `/workflows/pipedream/steps/6-update-memory.js`
4. Paste and test

**STEP 7: Send WhatsApp Response**
1. Click "+" → "Node.js"
2. Name it `send_whatsapp`
3. Copy code from `/workflows/pipedream/steps/7-send-whatsapp.js`
4. Paste and test

**STEP 8: Log Metrics**
1. Click "+" → "Node.js"
2. Name it `log_metrics`
3. Copy code from `/workflows/pipedream/steps/8-log-metrics.js`
4. Paste and test

#### 4.4 Deploy the Workflow

1. Click **"Deploy"** (top right corner)
2. Wait for deployment to complete (should be instant)
3. You'll see "Workflow deployed successfully"

**✅ Checkpoint:** Your workflow is deployed and has a webhook URL

---

### **Step 5: Connect WhatsApp to Pipedream** (15 minutes)

#### 5.1 Configure Webhook in Meta Console

1. Go back to Meta Developer Console
2. Navigate to WhatsApp → Configuration
3. Click "Edit" next to Webhook
4. Enter:
   - **Callback URL:** Your Pipedream webhook URL
   - **Verify Token:** The same token you set in environment variables
5. Click "Verify and Save"

**Expected:** You should see "Webhook verified successfully ✅"

**If verification fails:**
- Double-check the verify token matches exactly
- Ensure your workflow is deployed
- Check Pipedream logs for errors

#### 5.2 Subscribe to Webhook Events

1. Below webhook configuration, click "Manage" under "Webhook fields"
2. Subscribe to these events:
   - ✅ `messages`
   - ✅ `message_status` (optional)
3. Click "Done"

**✅ Checkpoint:** Webhook is connected and subscribed to messages

---

### **Step 6: Test Your Bot** (15-30 minutes)

#### 6.1 Send First Test Message

1. Open WhatsApp on your phone
2. Find the conversation with the **test number** (should already exist if you verified your number)
3. Send: `help`

**Expected Response:**
```
🤖 The Cockpit - Your AI Agent Team

Available Agents:

📣 @publicist - PR, announcements, content creation
📈 @growth - Growth hacking, algorithms, virality
🧠 @strategist - Big decisions, pivots, strategy
🎬 @content - Video scripts, sponsorships
💳 @credit - Credit advice, financial planning

Commands:
• Type @agent to switch agents
• Type "help" to see this message
• Type "clear" to reset conversation

Example:
@publicist PropIQ hit 100 users!
```

**If you don't get a response:**
1. Check Pipedream workflow → Click "Events"
2. Look for errors in the execution logs
3. Common issues:
   - Environment variables not set correctly
   - Webhook not subscribed to messages
   - WhatsApp token expired

#### 6.2 Test Agent Activation

Send: `@publicist`

**Expected:** Publicist agent greets you and asks how it can help

#### 6.3 Test Full Conversation

Send: `@publicist PropIQ just hit 100 Chrome extension installs!`

**Expected:** Publicist creates announcement content (Twitter thread, LinkedIn post, etc.)

#### 6.4 Test Agent Switching

Send: `@strategist`

**Expected:** Strategist agent activates

Send: `Should I focus on PropIQ or pivot to content creation?`

**Expected:** Strategic analysis and recommendation

#### 6.5 Test Conversation Memory

Send another message to the strategist WITHOUT using `@strategist`:

Send: `What metrics should I track?`

**Expected:** Strategist remembers the previous conversation context and responds accordingly

**✅ Checkpoint:** All agents working, conversation memory functional

---

### **Step 7: Monitor & Debug** (Ongoing)

#### 7.1 View Execution Logs

1. In Pipedream, go to your workflow
2. Click "Events" (left sidebar)
3. Click on any execution to see:
   - Each step's output
   - Errors (if any)
   - Execution time
   - Token usage

#### 7.2 Check Daily Usage

The workflow logs metrics automatically. To view:

1. In Pipedream workflow, go to latest execution
2. Scroll to "log_metrics" step
3. See daily/monthly stats:
   - Messages sent
   - Tokens used
   - Estimated cost
   - Most used agent

#### 7.3 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **No response from bot** | Check Pipedream Events for errors. Verify webhook is subscribed to `messages`. Confirm tokens are valid. |
| **"Agent not found" error** | Verify GitHub repo is public. Check agent filename matches in step 4. Ensure branch is correct (`main`). |
| **Claude API error** | Verify API key is correct. Check you have credits. Review request format in logs. |
| **Webhook verification fails** | Verify token must match exactly. Workflow must be deployed first. Check step 1 code is correct. |
| **Memory not persisting** | Check Pipedream Data Store is enabled. Verify step 3 and 6 are working. May need to refresh workflow. |

---

## 🎉 You're Done!

**Congratulations!** You now have a fully functional AI agent platform accessible via WhatsApp.

### **What You've Built:**
- ✅ WhatsApp bot that responds to messages
- ✅ 5 specialized AI agents (Publicist, Growth, Strategist, Content, Credit)
- ✅ Conversation memory (agents remember context)
- ✅ Agent switching (seamless transitions between agents)
- ✅ Usage tracking (tokens, costs, metrics)
- ✅ Error handling (graceful failures)

### **Next Steps:**

**Week 1: Dogfood It**
- Use it daily for real work for at least 5 days
- Document what works, what doesn't
- Note friction points and missing features
- Iterate on agent prompts

**Week 2-3: Add Differentiation Features**
- Agent collaboration (`@collaborate strategist publicist`)
- Context injection (business-state.json)
- Voice message support
- Quick actions

**Month 2: Beta Launch**
- Invite 10-20 founder friends
- Collect feedback
- Add team access
- Implement knowledge base (RAG)

**Month 3: Monetization**
- Define pricing tiers
- Integrate Stripe
- Build marketing site
- Launch publicly (Product Hunt, HN)

---

## 📊 Expected Costs

**Your current setup:**

**Free tier (first month):**
- Pipedream: $0 (100 executions/month)
- WhatsApp: $0 (test number, 1000 free conversations)
- Claude: $0.18-$2.10/month (with $5 free credits)
- **Total: $0-2.10/month**

**Paid tier (if you exceed free tier):**
- Pipedream: $20/month (10,000 executions)
- WhatsApp: $0 (first 1000 conversations free monthly)
- Claude: $0.53-$6.30/month
- **Total: $20.53-$26.30/month**

**vs Motion:** $29-$600/month → You're saving **88-95%**

---

## 🆘 Getting Help

**If you get stuck:**

1. **Check Pipedream Logs**
   - Workflow → Events → Click execution → Review each step

2. **Review Error Messages**
   - Most errors are in Claude API or WhatsApp API steps
   - Check environment variables are set correctly

3. **Consult Documentation**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup

4. **Test Each Component**
   - Test Claude API key manually (curl command in SETUP_GUIDE.md)
   - Test WhatsApp API separately
   - Verify GitHub repo is accessible

5. **Community Support**
   - GitHub Issues: Report bugs
   - GitHub Discussions: Ask questions
   - Pipedream Community: Platform-specific help

---

## 🔐 Security Checklist

Before going to production:

- [ ] Permanent WhatsApp token created (not temporary)
- [ ] All API keys stored in Pipedream environment variables (never in code)
- [ ] GitHub repo is private OR agent configs don't contain secrets
- [ ] Authorized users list configured (limit who can use the bot)
- [ ] Spending limits set on Anthropic account ($10-50/month)
- [ ] Test number replaced with production WhatsApp Business number
- [ ] Webhook verify token is random and secure (not `test123`)

---

## 📈 Success Metrics

Track these to measure MVP success:

**Week 1:**
- [ ] 20+ real conversations
- [ ] 0 critical bugs
- [ ] 3+ "this is useful" moments
- [ ] All 5 agents tested

**Week 2-3:**
- [ ] Daily active usage (you use it every day)
- [ ] 50+ conversations
- [ ] 1+ feature improvements shipped
- [ ] Agent prompts optimized based on responses

**Month 2:**
- [ ] 10+ beta users onboarded
- [ ] 50+ messages per user in first week
- [ ] 5+ users say "I'd pay for this"
- [ ] Clear PMF signals (requests for more features)

**Month 3:**
- [ ] 50-100 signups
- [ ] 10-15 paying customers
- [ ] $500+ MRR
- [ ] 30%+ weekly active rate

---

**You're ready to build! 🚀**

Questions? Issues? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or open a GitHub issue.
