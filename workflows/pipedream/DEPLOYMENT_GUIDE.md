# Pipedream Workflow Deployment Guide

**Complete step-by-step guide to deploy The Cockpit on Pipedream**

---

## Overview

This guide will walk you through deploying The Cockpit WhatsApp AI Agent Platform using Pipedream's visual workflow builder. The entire process takes approximately **30-60 minutes**.

**What You'll Get:**
- ✅ WhatsApp → Claude API → WhatsApp integration
- ✅ 5 AI agents (Publicist, Growth Hacker, Strategist, Content, Credit Advisor)
- ✅ Authorization and security controls
- ✅ Cost tracking and monitoring
- ✅ Error handling and graceful failures

---

## Prerequisites

Before starting, ensure you have:

### 1. WhatsApp Business API Access
- [ ] WhatsApp Business Account created
- [ ] Phone Number ID
- [ ] Access Token
- [ ] Verify Token (create a random secure string)

**Get Started:** https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

### 2. Claude API Key
- [ ] Anthropic account created
- [ ] API key obtained (starts with `sk-ant-`)
- [ ] Sufficient credits (~$10 recommended for testing)

**Get API Key:** https://console.anthropic.com/

### 3. Pipedream Account
- [ ] Free account created at https://pipedream.com/
- [ ] Logged in and ready to create workflow

---

## Part 1: Create Pipedream Workflow (10 minutes)

### Step 1: Create New Workflow

1. Go to https://pipedream.com/new
2. Click **"Start with a trigger"**
3. Search for **"HTTP / Webhook"**
4. Select **"HTTP API (Receive HTTP Requests)"**
5. Click **"Create Source"**

**Result:** You'll see a webhook URL like `https://pipedream.com/sources/dc_abc123/events`

⚠️ **IMPORTANT:** Copy this URL - you'll need it for WhatsApp webhook configuration!

---

### Step 2: Add Environment Variables

Before adding workflow steps, configure your environment variables:

1. In the workflow editor, click the **"⚙️ Settings"** icon (top right)
2. Scroll to **"Environment Variables"**
3. Click **"+ Add Variable"**

Add these variables:

| Variable Name | Example Value | Where to Get It |
|---------------|---------------|-----------------|
| `CLAUDE_API_KEY` | `sk-ant-api03-xxx...` | https://console.anthropic.com/ |
| `CLAUDE_MODEL` | `claude-sonnet-4-5-20250929` | Use this exact value |
| `CLAUDE_MAX_TOKENS` | `4096` | Use this exact value |
| `WHATSAPP_PHONE_NUMBER_ID` | `123456789012345` | WhatsApp Business dashboard |
| `WHATSAPP_ACCESS_TOKEN` | `EAAG...` | WhatsApp Business dashboard |
| `WHATSAPP_API_VERSION` | `v17.0` | Use this exact value |
| `WHATSAPP_VERIFY_TOKEN` | `my_secure_random_token_123` | Create your own random string |
| `AUTHORIZED_USERS` | `1234567890,0987654321` | Your phone number(s) without + |
| `GITHUB_USERNAME` | `bdusape` | Your GitHub username |
| `GITHUB_REPO` | `the-cockpit` | Your repo name |
| `GITHUB_BRANCH` | `main` | Branch with agent files |

**Security Tips:**
- Use **encrypted** variables for API keys and tokens
- Never share your `WHATSAPP_ACCESS_TOKEN` or `CLAUDE_API_KEY`
- `WHATSAPP_VERIFY_TOKEN` should be a random 32+ character string

---

## Part 2: Add Workflow Steps (30 minutes)

Now add each step in order. For each step:
1. Click **"+ Add Step"**
2. Select **"Run Node.js code"**
3. Copy the code from the sections below
4. Click **"Save"** after each step

---

### Step 2: Parse WhatsApp Webhook

**Purpose:** Extracts message data from WhatsApp webhook payload

```javascript
export default defineComponent({
  name: "Parse WhatsApp Webhook",
  description: "Extracts message data from WhatsApp webhook payload",
  async run({ steps, $ }) {
    // Validate webhook payload
    if (!steps.trigger.event.body) {
      $.flow.exit("No webhook body received");
    }

    const body = steps.trigger.event.body;

    // Handle webhook verification (GET request from WhatsApp)
    if (steps.trigger.event.method === "GET") {
      const mode = steps.trigger.event.query["hub.mode"];
      const token = steps.trigger.event.query["hub.verify_token"];
      const challenge = steps.trigger.event.query["hub.challenge"];

      if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return $.respond({
          status: 200,
          body: parseInt(challenge),
        });
      } else {
        return $.respond({
          status: 403,
          body: "Forbidden",
        });
      }
    }

    // Parse incoming message
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        console.log("No messages in payload - likely a status update");
        $.flow.exit("No messages to process");
      }

      const message = messages[0];
      const messageType = message.type;

      // Only process text messages for MVP
      if (messageType !== "text") {
        console.log(`Unsupported message type: ${messageType}`);
        $.flow.exit("Only text messages supported in MVP");
      }

      const parsed = {
        from: message.from,
        message_id: message.id,
        timestamp: message.timestamp,
        message_type: messageType,
        message_body: message.text?.body || "",
        phone_number_id: value.metadata?.phone_number_id,
        display_phone_number: value.metadata?.display_phone_number,
      };

      console.log("📨 Parsed Message:", JSON.stringify(parsed, null, 2));

      return parsed;
    } catch (error) {
      console.error("Error parsing webhook:", error);
      $.flow.exit(`Parse error: ${error.message}`);
    }
  },
});
```

**Test:** Click "Test" at the top - it should show "Waiting for event..." (we'll test end-to-end later)

---

### Step 3: Authorization Check

**Purpose:** Validates user is authorized (security + cost protection)

```javascript
export default defineComponent({
  name: "Authorization Check",
  description: "Validates user is authorized (security + cost protection)",
  async run({ steps, $ }) {
    const userPhone = steps.parse_whatsapp_webhook.from;

    // Get authorized users from environment variable
    const authorizedUsers = (process.env.AUTHORIZED_USERS || "")
      .split(",")
      .map((num) => num.trim())
      .filter((num) => num.length > 0);

    console.log("🔐 Authorization Check");
    console.log("User:", userPhone);
    console.log("Authorized Users Count:", authorizedUsers.length);

    // Check if user is authorized
    const isAuthorized =
      authorizedUsers.includes(userPhone) ||
      authorizedUsers.includes(`+${userPhone}`);

    if (!isAuthorized) {
      console.warn("⚠️ UNAUTHORIZED ACCESS ATTEMPT:", userPhone);

      // Log security event
      const securityEvent = {
        timestamp: new Date().toISOString(),
        type: "unauthorized_access",
        user_phone: userPhone,
        message: steps.parse_whatsapp_webhook.message_body,
      };

      console.error("🚨 SECURITY EVENT:", JSON.stringify(securityEvent, null, 2));

      // Send rejection message to user
      await $.send.http({
        url: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: userPhone,
          type: "text",
          text: {
            body: "⛔ Unauthorized. This service is private.\n\nIf you believe this is an error, please contact the administrator.",
          },
        },
      });

      // Exit workflow - don't call Claude API (cost protection)
      $.flow.exit("Unauthorized user - workflow terminated");
    }

    console.log("✅ User authorized");

    return {
      authorized: true,
      user_phone: userPhone,
    };
  },
});
```

---

### Step 4: Parse Agent Trigger

**Purpose:** Extracts agent name and query from message

```javascript
export default defineComponent({
  name: "Parse Agent Trigger",
  description: "Extracts agent name and query from message",
  async run({ steps, $ }) {
    const messageBody = steps.parse_whatsapp_webhook.message_body;

    // Agent trigger pattern: @agent_name query
    const agentPattern = /^@(\w+)\s*(.*)/i;
    const match = messageBody.match(agentPattern);

    let agent = "publicist"; // Default agent
    let query = messageBody;

    if (match) {
      agent = match[1].toLowerCase();
      query = match[2].trim();
    }

    // Agent mapping (convert aliases to file names)
    const agentMap = {
      publicist: "publicist",
      growth: "growth-hacker",
      "growth-hacker": "growth-hacker",
      strategist: "strategist",
      content: "content-strategist",
      "content-strategist": "content-strategist",
      credit: "credit-advisor",
      "credit-advisor": "credit-advisor",
    };

    const agentFileName = agentMap[agent];

    if (!agentFileName) {
      console.warn(`Unknown agent: ${agent}`);
      return {
        agent: null,
        agent_file: null,
        query: query,
        valid: false,
        error: `Agent "${agent}" not found. Available agents: @publicist, @growth, @strategist, @content, @credit`,
      };
    }

    console.log("🤖 Agent Parsed:", agent);
    console.log("📝 Query:", query);

    return {
      agent: agent,
      agent_file: agentFileName,
      query: query || "How can I help you today?",
      valid: true,
    };
  },
});
```

---

### Step 5: Fetch Agent Configuration

**Purpose:** Loads agent system prompt from GitHub

```javascript
export default defineComponent({
  name: "Fetch Agent Configuration",
  description: "Loads agent system prompt from GitHub",
  async run({ steps, $ }) {
    // Handle invalid agent
    if (!steps.parse_agent_trigger.valid) {
      console.error("Invalid agent, skipping config fetch");
      return {
        success: false,
        error: steps.parse_agent_trigger.error,
      };
    }

    const agentFile = steps.parse_agent_trigger.agent_file;
    const githubUsername = process.env.GITHUB_USERNAME || "bdusape";
    const githubRepo = process.env.GITHUB_REPO || "the-cockpit";
    const githubBranch = process.env.GITHUB_BRANCH || "main";

    const url = `https://raw.githubusercontent.com/${githubUsername}/${githubRepo}/${githubBranch}/agents/${agentFile}.md`;

    console.log("📥 Fetching agent config from:", url);

    try {
      const response = await $.send.http({
        url: url,
        method: "GET",
      });

      if (response.status !== 200) {
        throw new Error(`GitHub returned ${response.status}`);
      }

      const agentConfig = response.body;

      console.log(`✅ Loaded ${agentFile}.md (${agentConfig.length} bytes)`);

      return {
        success: true,
        agent_config: agentConfig,
        agent_file: agentFile,
      };
    } catch (error) {
      console.error("❌ Failed to fetch agent config:", error);

      return {
        success: false,
        error: `Failed to load agent configuration: ${error.message}`,
      };
    }
  },
});
```

---

### Step 6: Call Claude API

**Purpose:** Sends query to Claude with agent system prompt

```javascript
export default defineComponent({
  name: "Call Claude API",
  description: "Sends query to Claude with agent system prompt",
  async run({ steps, $ }) {
    // Handle errors from previous steps
    if (!steps.fetch_agent_configuration.success) {
      console.error("Cannot call Claude - agent config failed");
      return {
        success: false,
        error: steps.fetch_agent_configuration.error,
      };
    }

    if (!steps.parse_agent_trigger.valid) {
      console.error("Cannot call Claude - invalid agent");
      return {
        success: false,
        error: steps.parse_agent_trigger.error,
      };
    }

    const systemPrompt = steps.fetch_agent_configuration.agent_config;
    const userQuery = steps.parse_agent_trigger.query;

    console.log("🧠 Calling Claude API...");
    console.log("Model:", process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929");
    console.log("Query:", userQuery.substring(0, 100) + "...");

    try {
      const response = await $.send.http({
        url: "https://api.anthropic.com/v1/messages",
        method: "POST",
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        data: {
          model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
          max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS || "4096"),
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userQuery,
            },
          ],
        },
      });

      if (response.status !== 200) {
        throw new Error(`Claude API returned ${response.status}: ${JSON.stringify(response.body)}`);
      }

      const claudeResponse = response.body;

      console.log("✅ Claude response received");
      console.log("Tokens used:", claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens);

      return {
        success: true,
        response_text: claudeResponse.content[0].text,
        usage: claudeResponse.usage,
        model: claudeResponse.model,
      };
    } catch (error) {
      console.error("❌ Claude API error:", error);

      return {
        success: false,
        error: `AI service error: ${error.message}`,
      };
    }
  },
});
```

---

### Step 7: Send WhatsApp Response

**Purpose:** Sends Claude's response back to user via WhatsApp

```javascript
export default defineComponent({
  name: "Send WhatsApp Response",
  description: "Sends Claude's response back to user via WhatsApp",
  async run({ steps, $ }) {
    const userPhone = steps.parse_whatsapp_webhook.from;

    // Determine message to send
    let messageText;

    if (!steps.call_claude_api.success) {
      // Error occurred
      messageText = `⚠️ ${steps.call_claude_api.error}\n\nPlease try again or contact support if the issue persists.`;
    } else {
      // Success - send Claude's response
      messageText = steps.call_claude_api.response_text;
    }

    // WhatsApp has a 4096 character limit per message
    const MAX_LENGTH = 4000; // Leave some buffer
    if (messageText.length > MAX_LENGTH) {
      messageText = messageText.substring(0, MAX_LENGTH) + "\n\n...(message truncated)";
    }

    console.log("📤 Sending WhatsApp message...");
    console.log("To:", userPhone);
    console.log("Length:", messageText.length);

    try {
      const response = await $.send.http({
        url: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: userPhone,
          type: "text",
          text: {
            body: messageText,
          },
        },
      });

      if (response.status !== 200) {
        throw new Error(`WhatsApp API returned ${response.status}`);
      }

      console.log("✅ Message sent successfully");

      return {
        success: true,
        message_id: response.body.messages[0].id,
      };
    } catch (error) {
      console.error("❌ WhatsApp send failed:", error);

      // Retry logic could go here
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

---

### Step 8: Log Metrics

**Purpose:** Logs conversation metrics for monitoring and cost tracking

```javascript
export default defineComponent({
  name: "Log Metrics",
  description: "Logs conversation metrics for monitoring and cost tracking",
  async run({ steps, $ }) {
    const metrics = {
      // Timestamp
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],

      // User info
      user_phone: steps.parse_whatsapp_webhook.from,

      // Agent info
      agent: steps.parse_agent_trigger.agent,
      agent_valid: steps.parse_agent_trigger.valid,

      // Message info
      query_length: steps.parse_agent_trigger.query?.length || 0,

      // Claude API metrics (if successful)
      claude_success: steps.call_claude_api.success,
      tokens_input: steps.call_claude_api.usage?.input_tokens || 0,
      tokens_output: steps.call_claude_api.usage?.output_tokens || 0,
      tokens_total:
        (steps.call_claude_api.usage?.input_tokens || 0) +
        (steps.call_claude_api.usage?.output_tokens || 0),

      // Cost calculation (claude-sonnet-4-5 pricing: $3 per 1M input, $15 per 1M output)
      cost_input_usd: ((steps.call_claude_api.usage?.input_tokens || 0) * 3) / 1000000,
      cost_output_usd: ((steps.call_claude_api.usage?.output_tokens || 0) * 15) / 1000000,
      cost_total_usd:
        ((steps.call_claude_api.usage?.input_tokens || 0) * 3) / 1000000 +
        ((steps.call_claude_api.usage?.output_tokens || 0) * 15) / 1000000,

      // Response info
      response_length: steps.call_claude_api.response_text?.length || 0,
      whatsapp_success: steps.send_whatsapp_response.success,

      // Status
      status: steps.call_claude_api.success && steps.send_whatsapp_response.success ? "success" : "error",
    };

    // Log to console (viewable in Pipedream execution logs)
    console.log("📊 METRICS:", JSON.stringify(metrics, null, 2));

    // Summary log
    console.log(`
╔════════════════════════════════════════╗
║         CONVERSATION SUMMARY           ║
╚════════════════════════════════════════╝

Agent: ${metrics.agent}
Tokens: ${metrics.tokens_total}
Cost: $${metrics.cost_total_usd.toFixed(4)}
Status: ${metrics.status.toUpperCase()}
    `);

    return metrics;
  },
});
```

---

## Part 3: Configure WhatsApp Webhook (10 minutes)

Now connect WhatsApp to your Pipedream workflow:

### Step 1: Get Your Webhook URL

1. In your Pipedream workflow, go back to the **trigger step** (HTTP / Webhook)
2. Copy the webhook URL (looks like `https://pipedream.com/sources/dc_abc123/events`)

### Step 2: Configure WhatsApp Webhook

1. Go to https://developers.facebook.com/apps/
2. Select your app → **WhatsApp** → **Configuration**
3. Under **Webhook**, click **"Edit"**
4. Enter:
   - **Callback URL:** Your Pipedream webhook URL
   - **Verify Token:** The value you set in `WHATSAPP_VERIFY_TOKEN` environment variable
5. Click **"Verify and Save"**

**Expected Result:** WhatsApp will send a verification request. Your workflow should respond with status 200, and WhatsApp will show "Verified ✅"

### Step 3: Subscribe to Webhook Fields

1. In the same section, click **"Manage"** under **Webhook Fields**
2. Subscribe to: `messages`
3. Click **"Save"**

---

## Part 4: Test Your Workflow (10 minutes)

### Test 1: Send Test WhatsApp Message

1. Open WhatsApp on your phone
2. Send a message to your WhatsApp Business number:
   ```
   @publicist PropIQ just hit 100 Chrome extension installs!
   ```
3. Wait 10-30 seconds

**Expected Result:**
- Bot responds with Twitter thread, LinkedIn post, and email announcement
- Pipedream shows a successful execution in the logs

### Test 2: Check Pipedream Logs

1. In Pipedream, click on your workflow
2. Click **"Executions"** tab
3. You should see a recent execution with status **"Success"**
4. Click on it to see detailed logs for each step

**Look for:**
- ✅ Step 2: Message parsed correctly
- ✅ Step 3: User authorized
- ✅ Step 4: Agent = "publicist"
- ✅ Step 5: Agent config loaded from GitHub
- ✅ Step 6: Claude API returned response
- ✅ Step 7: WhatsApp message sent
- ✅ Step 8: Metrics logged (check tokens and cost)

### Test 3: Test All Agents

Send these messages one by one:

```
@growth My LinkedIn posts are getting <100 views. What's wrong?

@strategist Should I pivot from PropIQ to content creation?

@content Create TikTok script for PropIQ demo

@credit How to improve 650 credit score in 6 months?
```

**Expected:** Each agent responds with on-brand, relevant advice

### Test 4: Test Unauthorized Access

1. Send a message from a phone number NOT in `AUTHORIZED_USERS`
2. **Expected:** Bot responds with "⛔ Unauthorized" message
3. Check Pipedream logs - should show **no Claude API call** (cost protection working!)

---

## Part 5: Monitoring & Maintenance

### Daily Monitoring (First Week)

Check these daily:

1. **Pipedream Executions**
   - Go to workflow → Executions tab
   - Look for failed executions (red ❌)
   - Click to see error details

2. **Cost Tracking**
   - Check "Log Metrics" step in successful executions
   - Look for `cost_total_usd` field
   - Calculate daily totals

3. **Agent Quality**
   - Test 1-2 agents manually
   - Verify responses are on-brand and helpful

### Weekly Review (Ongoing)

1. **Total Costs**
   - Add up all `cost_total_usd` from metrics logs
   - Verify staying under budget (<$30/month for 300 messages)

2. **Usage Patterns**
   - Which agents are used most?
   - What times of day see most activity?
   - Any common error patterns?

3. **Agent Updates**
   - Update agent markdown files in GitHub as needed
   - Changes take effect immediately (no redeployment needed!)

---

## Troubleshooting

### Issue: Workflow doesn't trigger when I send WhatsApp message

**Diagnosis:**
- Check WhatsApp webhook is configured correctly
- Verify webhook URL matches Pipedream source URL
- Check verify token matches environment variable

**Fix:**
1. Go to WhatsApp Configuration
2. Re-enter webhook URL and verify token
3. Click "Verify and Save" again

---

### Issue: "Unauthorized" even though my number is in AUTHORIZED_USERS

**Diagnosis:**
- Phone number format might be wrong
- Check if it has `+` prefix or not

**Fix:**
1. In Pipedream, go to a failed execution
2. Look at Step 2 output - see the `from` field
3. Copy that exact format into `AUTHORIZED_USERS`
4. Example: If `from` is `1234567890`, use `1234567890` (no +)

---

### Issue: Claude API error - "Invalid API key"

**Diagnosis:**
- API key is wrong or expired

**Fix:**
1. Go to https://console.anthropic.com/
2. Generate a new API key
3. Update `CLAUDE_API_KEY` in Pipedream environment variables
4. Deploy workflow again

---

### Issue: GitHub fetch fails - 404 error

**Diagnosis:**
- Agent files not on the specified branch
- Repository is private without token

**Fix:**
1. Verify agents are pushed to `main` branch (or update `GITHUB_BRANCH`)
2. If repo is private, add `GITHUB_TOKEN` environment variable with personal access token

---

### Issue: WhatsApp says "Message failed to send"

**Diagnosis:**
- Access token expired
- Phone number not verified

**Fix:**
1. Check WhatsApp Business API dashboard for errors
2. Verify access token is still valid
3. Ensure phone number is verified and active

---

## Cost Optimization Tips

### Reduce Token Usage

1. **Use Haiku for simple queries**
   - Change `CLAUDE_MODEL` to `claude-haiku-4-5-20250929` (85% cheaper)
   - Trade-off: Slightly lower quality responses

2. **Reduce max_tokens**
   - Change `CLAUDE_MAX_TOKENS` from `4096` to `2048`
   - Trade-off: Shorter responses

3. **Implement caching**
   - For frequently asked questions, cache responses
   - Pipedream Data Stores can store common Q&A

### Free Tier Limits

- **Pipedream:** 100 workflow runs/month (free)
- **WhatsApp:** 1,000 conversations/month (free)
- **Claude:** Pay-as-you-go ($10 minimum)

**To stay free:** Limit to ~30-50 messages/month

---

## Next Steps

### Production Launch Checklist

- [ ] All tests passing (5 agents tested)
- [ ] Unauthorized access blocked
- [ ] Cost tracking verified (<$0.10/message)
- [ ] Error handling tested
- [ ] Metrics logging working

### Post-Launch (Week 1)

- [ ] Monitor daily executions
- [ ] Track actual costs vs projections
- [ ] Collect user feedback on agent quality
- [ ] Identify most-used agents

### Scale (Month 2+)

- [ ] Add conversation memory (Redis or Supabase)
- [ ] Implement voice message support
- [ ] Add image analysis capability
- [ ] Create new specialized agents based on usage

---

## Support Resources

- **Pipedream Docs:** https://pipedream.com/docs/
- **WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp/
- **Claude API Docs:** https://docs.anthropic.com/
- **The Cockpit Docs:** See `docs/` folder in repository

---

**You're all set!** 🎉

Your WhatsApp AI agent platform is now deployed and ready to use.

**Test it now:** Send `@publicist test` to your WhatsApp Business number!
