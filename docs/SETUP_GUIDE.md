# The Cockpit - Complete Setup Guide

**Estimated Time:** 2-6 hours (depending on experience level)
**Difficulty:** Intermediate
**Prerequisites:** Basic understanding of APIs and webhooks

---

## Overview

This guide will walk you through setting up The Cockpit WhatsApp bot from scratch. By the end, you'll be able to text your agents via WhatsApp and get AI-powered responses.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Get Claude API Key](#step-1-get-claude-api-key)
3. [Step 2: Set Up WhatsApp Business](#step-2-set-up-whatsapp-business)
4. [Step 3: Choose Automation Platform](#step-3-choose-automation-platform)
5. [Step 4: Deploy Workflow](#step-4-deploy-workflow)
6. [Step 5: Configure Agents](#step-5-configure-agents)
7. [Step 6: Test Your Setup](#step-6-test-your-setup)
8. [Step 7: Advanced Configuration](#step-7-advanced-configuration)

---

## Prerequisites

### Required Accounts

- [ ] WhatsApp account (your personal number)
- [ ] Facebook Business account
- [ ] Anthropic account (for Claude API)
- [ ] Automation platform account (Pipedream/n8n/Zapier)
- [ ] GitHub account (for agent configs)

### Required Tools

- [ ] Smartphone with WhatsApp installed
- [ ] Computer with internet access
- [ ] Text editor (VS Code recommended)
- [ ] Git installed (optional but recommended)

### Recommended Skills

- Basic JSON understanding
- Comfortable with API concepts
- Ability to copy/paste code snippets
- Basic command line knowledge (optional)

---

## Step 1: Get Claude API Key

**Time:** 10 minutes

### 1.1 Create Anthropic Account

1. Go to https://console.anthropic.com/
2. Click "Sign Up"
3. Enter your email and create password
4. Verify your email address

### 1.2 Get API Key

1. Log in to Anthropic Console
2. Click "API Keys" in left sidebar
3. Click "Create Key"
4. Name it "The Cockpit"
5. Copy the API key (starts with `sk-ant-api03-`)
6. **IMPORTANT:** Save this key somewhere safe (you can't view it again)

### 1.3 Add Credits (Optional)

- New accounts get $5 free credits
- For production use, add payment method:
  - Click "Billing" in sidebar
  - Add credit card
  - Set spending limit (e.g., $10/month)

### 1.4 Test Your Key

```bash
# Test API key works (optional)
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**Expected response:** JSON with Claude's reply

✅ **Checkpoint:** You have a working Claude API key

---

## Step 2: Set Up WhatsApp Business

**Time:** 30-45 minutes

### 2.1 Create Meta (Facebook) Developer Account

1. Go to https://developers.facebook.com/
2. Click "Get Started"
3. Log in with your Facebook account (or create one)
4. Complete developer registration

### 2.2 Create a New App

1. Click "My Apps" → "Create App"
2. Select "Business" as app type
3. Fill in details:
   - **App Name:** The Cockpit
   - **App Contact Email:** Your email
   - **Business Account:** Create new or select existing
4. Click "Create App"

### 2.3 Add WhatsApp Product

1. In your app dashboard, find "WhatsApp"
2. Click "Set Up"
3. Follow the setup wizard:
   - Select or create a Meta Business Account
   - Create a WhatsApp Business Profile
   - Add phone number (you'll need a phone number not currently on WhatsApp)

### 2.4 Get Test Phone Number

**For Development (Free):**
- Meta provides a test number
- Can send messages to up to 5 phone numbers
- Perfect for MVP testing

**Steps:**
1. In WhatsApp setup, go to "API Setup"
2. Note the test phone number provided
3. Click "Add phone number" to add recipient
4. Enter YOUR personal WhatsApp number
5. WhatsApp will send you a verification code
6. Enter the code to verify

### 2.5 Get Access Tokens

1. In WhatsApp → API Setup:
   - Copy **Phone Number ID** (looks like: 123456789012345)
   - Copy **Temporary Access Token** (starts with `EAAG...`)
   - Note: Temporary token expires in 24 hours

### 2.6 Generate Permanent Token (Recommended)

1. Go to "Settings" → "Business Settings"
2. Click "System Users"
3. Click "Add" to create system user:
   - Name: "The Cockpit Bot"
   - Role: Admin
4. Click on the system user
5. Click "Generate New Token"
6. Select your app
7. Choose permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
8. Copy the token (starts with `EAAG...`)
9. Save it securely

### 2.7 Set Up Webhook (Will Complete Later)

1. In WhatsApp → Configuration
2. Click "Edit" next to Webhook
3. Leave this tab open (we'll fill it in Step 4)

✅ **Checkpoint:** You have WhatsApp Phone Number ID and Access Token

---

## Step 3: Choose Automation Platform

**Time:** 15 minutes

We'll use **Pipedream** (recommended for MVP). Alternatives: n8n or Zapier.

### 3.1 Create Pipedream Account

1. Go to https://pipedream.com/
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Verify your email

### 3.2 Understand Pipedream Free Tier

**Free tier includes:**
- 100 workflow runs per month
- Unlimited workflows
- Built-in data stores
- No credit card required

**Upgrade ($20/month) if needed:**
- 10,000 workflow runs per month
- More compute time
- Advanced features

### 3.3 Create New Project

1. In Pipedream dashboard, click "New Project"
2. Name it "The Cockpit"
3. Click "Create"

✅ **Checkpoint:** You have a Pipedream account and project

---

## Step 4: Deploy Workflow

**Time:** 45-60 minutes

### 4.1 Create New Workflow

1. Click "New Workflow" in your project
2. Name it "Cockpit WhatsApp Handler"
3. Click "Create"

### 4.2 Add HTTP Webhook Trigger

1. Search for "HTTP / Webhook"
2. Select "HTTP API Request"
3. Click "Create Source"
4. Name it "whatsapp_webhook"
5. Copy the webhook URL (looks like: `https://xxx.m.pipedream.net`)

### 4.3 Configure WhatsApp Webhook

Now go back to your Meta Developer console:

1. In WhatsApp → Configuration → Webhook
2. Click "Edit"
3. Enter:
   - **Callback URL:** Your Pipedream webhook URL
   - **Verify Token:** Choose a random string (e.g., `cockpit_verify_2025`)
   - Write down your verify token!
4. Click "Verify and Save"

**Note:** The verification will fail initially - that's OK! We'll fix it in the next step.

### 4.4 Add Webhook Verification Step

In Pipedream, add a new step:

```javascript
// Step: Verify WhatsApp Webhook
export default defineComponent({
  async run({ steps, $ }) {
    const mode = steps.trigger.event.query['hub.mode'];
    const token = steps.trigger.event.query['hub.verify_token'];
    const challenge = steps.trigger.event.query['hub.challenge'];

    const VERIFY_TOKEN = 'YOUR_VERIFY_TOKEN_HERE'; // Replace with your token

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      $.respond({
        status: 200,
        body: parseInt(challenge)
      });
    } else {
      $.respond({
        status: 403,
        body: 'Verification failed'
      });
    }
  }
});
```

### 4.5 Subscribe to Webhook Events

Back in Meta Developer console:

1. Below the webhook configuration, find "Webhook fields"
2. Click "Manage"
3. Subscribe to:
   - ✅ `messages`
   - ✅ `message_status` (optional)
4. Click "Done"

### 4.6 Add Environment Variables

In Pipedream:

1. Click "Settings" → "Environment Variables"
2. Add these variables:
   ```
   CLAUDE_API_KEY=sk-ant-api03-your-key
   WHATSAPP_TOKEN=EAAG...your-token
   WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
   WHATSAPP_VERIFY_TOKEN=your-verify-token
   GITHUB_USERNAME=briandusape
   GITHUB_REPO=the-cockpit
   ```

### 4.7 Add Message Parsing Step

```javascript
// Step: Parse WhatsApp Message
export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;

    // Check if this is a message event
    if (!body.entry || !body.entry[0].changes || !body.entry[0].changes[0].value.messages) {
      console.log('Not a message event, skipping...');
      return null;
    }

    const message = body.entry[0].changes[0].value.messages[0];
    const from = message.from;
    const messageText = message.text?.body || '';
    const messageId = message.id;

    // Parse agent trigger
    const triggerMatch = messageText.match(/^@(\w+)/);
    const agent = triggerMatch ? triggerMatch[1] : 'publicist'; // default
    const query = triggerMatch ? messageText.replace(/^@\w+\s*/, '') : messageText;

    return {
      from,
      messageId,
      agent,
      query,
      originalText: messageText
    };
  }
});
```

### 4.8 Add Agent Loader Step

```javascript
// Step: Load Agent Configuration
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.parse_message) return null;

    const agent = steps.parse_message.agent;
    const username = process.env.GITHUB_USERNAME;
    const repo = process.env.GITHUB_REPO;

    // Map agent triggers to filenames
    const agentMap = {
      'publicist': 'publicist.md',
      'growth': 'growth-hacker.md',
      'strategist': 'strategist.md',
      'content': 'content-strategist.md',
      'credit': 'credit-advisor.md'
    };

    const filename = agentMap[agent] || 'publicist.md';
    const url = `https://raw.githubusercontent.com/${username}/${repo}/main/agents/${filename}`;

    console.log(`Loading agent config from: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load agent config: ${response.statusText}`);
    }

    const agentInstructions = await response.text();

    return {
      agent,
      instructions: agentInstructions
    };
  }
});
```

### 4.9 Add Claude API Call Step

```javascript
// Step: Call Claude API
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.parse_message || !steps.load_agent) return null;

    const query = steps.parse_message.query;
    const agentInstructions = steps.load_agent.instructions;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: agentInstructions,
        messages: [
          {
            role: 'user',
            content: query
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantReply = data.content[0].text;

    console.log(`Claude response (${data.usage.input_tokens} in, ${data.usage.output_tokens} out)`);

    return {
      reply: assistantReply,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens
    };
  }
});
```

### 4.10 Add WhatsApp Response Step

```javascript
// Step: Send Response to WhatsApp
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.parse_message || !steps.call_claude) return null;

    const to = steps.parse_message.from;
    const message = steps.call_claude.reply;

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Message sent successfully!', data);

    return data;
  }
});
```

### 4.11 Deploy Workflow

1. Click "Deploy" in top right
2. Test by sending a message to your WhatsApp test number
3. Check Pipedream logs to debug any issues

✅ **Checkpoint:** Your workflow is deployed and responding

---

## Step 5: Configure Agents

**Time:** 15 minutes

### 5.1 Clone Repository

```bash
git clone https://github.com/briandusape/the-cockpit.git
cd the-cockpit
```

### 5.2 Review Agent Files

Check that these files exist:
```
agents/
├── publicist.md
├── growth-hacker.md
├── strategist.md
├── content-strategist.md
└── credit-advisor.md
```

### 5.3 Customize Agent Context (Optional)

Edit each agent file to update:
- Your current business context
- Recent metrics
- Upcoming milestones
- Target audience details

Example: In `agents/publicist.md`, update:
```markdown
**Current Goals:**
- Q4 2025: 100+ Chrome extension installs, first 5 paying customers
```

### 5.4 Create Custom Agents (Optional)

1. Copy `agents/_template.md` to `agents/your-agent-name.md`
2. Fill in all sections
3. Add to `agentMap` in Pipedream workflow
4. Commit and push to GitHub

✅ **Checkpoint:** Agents are configured and accessible

---

## Step 6: Test Your Setup

**Time:** 15 minutes

### 6.1 Send Test Message

Open WhatsApp and send to your test number:
```
@publicist
```

**Expected response:** Publicist agent should introduce itself

### 6.2 Test Full Conversation

```
You: @publicist PropIQ hit 100 users!

Expected: Agent creates announcement content (Twitter thread, LinkedIn post, etc.)
```

### 6.3 Test Agent Switching

```
You: @strategist

Expected: Strategist agent activates

You: Should I focus on PropIQ or pivot to content creation?

Expected: Strategic analysis and recommendation
```

### 6.4 Check Pipedream Logs

1. Go to Pipedream workflow
2. Click "Events" to see execution history
3. Review each step's output
4. Debug any errors

### 6.5 Common Issues & Fixes

**Issue:** No response from bot
- Check Pipedream logs for errors
- Verify WhatsApp webhook is subscribed to `messages`
- Confirm WhatsApp token is valid

**Issue:** "Agent not found" error
- Verify agent filename in GitHub matches `agentMap`
- Check GitHub repo is public or token is configured
- Confirm agent .md file exists

**Issue:** Claude API error
- Verify API key is correct
- Check you have credits remaining
- Review request format in logs

✅ **Checkpoint:** Bot responds to messages successfully

---

## Step 7: Advanced Configuration

**Time:** Optional (30-60 minutes)

### 7.1 Add Conversation Memory

See [docs/CONVERSATION_MEMORY.md](CONVERSATION_MEMORY.md) for instructions.

### 7.2 Add Voice Message Support

See [docs/VOICE_MESSAGES.md](VOICE_MESSAGES.md) for instructions.

### 7.3 Set Up Production Phone Number

**When ready to go live:**

1. In Meta Developer console, go to WhatsApp → Phone Numbers
2. Click "Add phone number"
3. Follow verification process
4. Update `WHATSAPP_PHONE_NUMBER_ID` in Pipedream
5. Update webhook subscription

**Note:** Production phone number requires:
- Business verification
- May take 1-3 days approval
- One-time setup fee may apply

### 7.4 Upgrade Pipedream (If Needed)

If you hit 100 workflow runs/month:
1. Go to Pipedream → Billing
2. Upgrade to paid plan ($20/month for 10,000 runs)
3. Or optimize to reduce runs (batch requests, cache responses)

### 7.5 Set Up Monitoring

Add logging step to track:
- Messages processed
- Tokens used
- Estimated costs
- Response times
- Error rates

Example monitoring step:
```javascript
// Step: Log Metrics
export default defineComponent({
  async run({ steps, $ }) {
    const metrics = {
      timestamp: new Date().toISOString(),
      user: steps.parse_message.from,
      agent: steps.load_agent.agent,
      tokensUsed: steps.call_claude.tokensUsed,
      responseTime: Date.now() - steps.trigger.event.timestamp
    };

    console.log('METRICS:', metrics);

    // Optionally send to analytics service
    // await fetch('https://your-analytics-endpoint', {...});

    return metrics;
  }
});
```

---

## Cost Estimate

Based on your setup:

**Free tier (100 messages/month):**
- Pipedream: $0
- WhatsApp Business API: $0 (test number)
- Claude API: $0.18-2.10/month
- **Total: $0.18-2.10/month**

**Paid tier (300 messages/month):**
- Pipedream: $20/month (if you exceed 100 runs)
- WhatsApp: $0 (first 1,000 conversations free monthly)
- Claude API: $0.53-6.30/month
- **Total: $20.53-26.30/month** (only if you exceed free tier)

---

## Next Steps

✅ **You're done!** You now have a working AI agent platform via WhatsApp.

**Recommended next steps:**
1. Use it for a week, see what works
2. Add conversation memory (Phase 2)
3. Customize agents for your specific needs
4. Share with team members (add their numbers to authorized users)
5. Build custom agents for your unique workflows

**Resources:**
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Custom Agents Guide](CUSTOM_AGENTS.md)
- [Architecture Docs](ARCHITECTURE.md)
- [FAQ](FAQ.md)

---

## Support

**Issues?**
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open issue on GitHub
- Review Pipedream logs for errors

**Questions?**
- GitHub Discussions
- Pipedream Community
- WhatsApp Business API Docs

---

**Congratulations! You've built your own Motion-style AI agent platform for <$7/month!** 🎉
