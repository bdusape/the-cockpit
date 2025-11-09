# Pipedream Workflow Steps

This directory contains all the individual steps for The Cockpit WhatsApp bot workflow.

## How to Use

### Option 1: Copy Steps Manually (Recommended for MVP)

1. Create a new workflow in Pipedream
2. Add an "HTTP / Webhook" trigger
3. Copy each step file into Pipedream in order (01 → 07)
4. Set environment variables (see main README)
5. Deploy!

### Option 2: Import Complete Workflow

Use the `../cockpit-workflow-complete.yaml` file to import the entire workflow at once (coming soon).

---

## Workflow Steps Overview

### 1. Verify Webhook (`01-verify-webhook.js`)

**Purpose:** Handle Meta's webhook verification

- Responds to Meta's GET request with verification challenge
- Validates verify token
- Exits early if verification request

**Exits workflow if:** This is a verification request

---

### 2. Parse Message (`02-parse-message.js`)

**Purpose:** Extract message details from WhatsApp payload

- Parses incoming WhatsApp webhook
- Extracts phone number, message text, agent trigger
- Detects special commands (help, clear, status)
- Handles different message types (text, voice, image)

**Returns:**
```javascript
{
  from: "1234567890",
  messageId: "wamid.xxx",
  agent: "publicist",
  query: "PropIQ hit 100 users!",
  originalText: "@publicist PropIQ hit 100 users!",
  isSpecialCommand: false,
  timestamp: "2025-11-09T..."
}
```

**Exits workflow if:** Not a message event (status update, etc.)

---

### 3. Handle Special Commands (`03-handle-special-commands.js`)

**Purpose:** Process system commands

**Supported commands:**
- `help` / `agents` - List available agents
- `clear` / `reset` - Clear conversation memory
- `status` - Show current status

**Returns:**
```javascript
{
  isSpecialCommand: true,
  shouldContinue: false,
  response: "Help message...",
  from: "1234567890"
}
```

**Exits workflow if:** Special command was handled (skips Claude API call)

---

### 4. Load Agent Config (`04-load-agent-config.js`)

**Purpose:** Fetch agent instructions from GitHub

- Maps agent trigger to filename (e.g., `publicist` → `publicist.md`)
- Fetches from GitHub raw content URL
- Handles unknown agents (defaults to publicist)
- Validates content was loaded

**Returns:**
```javascript
{
  agent: "publicist",
  agentFilename: "publicist.md",
  instructions: "# Publicist Agent...",
  instructionsLength: 15234,
  loadedAt: "2025-11-09T..."
}
```

**Error handling:** Returns error object if agent config can't be loaded

---

### 5. Call Claude API (`05-call-claude-api.js`)

**Purpose:** Generate AI response using Claude

- Sends user query + agent instructions to Claude
- Uses Sonnet 4.5 by default (configurable)
- Tracks token usage and cost
- Handles API errors gracefully

**Returns:**
```javascript
{
  reply: "AI response text...",
  model: "claude-sonnet-4-5-20250929",
  usage: {
    inputTokens: 1234,
    outputTokens: 567,
    totalTokens: 1801
  },
  estimatedCost: 0.0123,
  timestamp: "2025-11-09T..."
}
```

**Error handling:** Returns error object if API call fails

---

### 6. Send WhatsApp Response (`06-send-whatsapp-response.js`)

**Purpose:** Deliver response to user via WhatsApp

- Sends AI response or error message
- Handles message length limits (4096 chars)
- Manages different response sources (Claude, special commands, errors)
- Validates WhatsApp configuration

**Returns:**
```javascript
{
  success: true,
  messageId: "wamid.yyy",
  recipient: "1234567890",
  messageLength: 342,
  sentAt: "2025-11-09T..."
}
```

**Error handling:** Logs error but doesn't fail workflow

---

### 7. Log Metrics (`07-log-metrics.js`)

**Purpose:** Track usage and performance metrics

- Calculates response time
- Logs token usage and costs
- Tracks success/error rates
- Phase 2: Send to analytics service

**Returns:**
```javascript
{
  timestamp: "2025-11-09T...",
  user: "1234567890",
  agent: "publicist",
  responseTime: { milliseconds: 3421, seconds: "3.42" },
  claude: {
    model: "claude-sonnet-4-5-20250929",
    tokensUsed: 1801,
    estimatedCost: 0.0123
  },
  success: true
}
```

---

## Environment Variables Required

Set these in Pipedream → Settings → Environment Variables:

```bash
# Claude API
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-5-20250929  # Optional
CLAUDE_MAX_TOKENS=4096  # Optional

# WhatsApp
WHATSAPP_TOKEN=EAAG...  # Or WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=your-custom-token
WHATSAPP_API_VERSION=v17.0  # Optional

# GitHub
GITHUB_USERNAME=briandusape
GITHUB_REPO=the-cockpit
GITHUB_BRANCH=main  # Optional
```

---

## Flow Control

### Normal Flow
```
01-verify-webhook (check if verification)
  ↓
02-parse-message (extract details)
  ↓
03-handle-special-commands (check if special)
  ↓
04-load-agent-config (fetch instructions)
  ↓
05-call-claude-api (get AI response)
  ↓
06-send-whatsapp-response (deliver to user)
  ↓
07-log-metrics (track usage)
```

### Early Exit Scenarios

**Verification Request:**
```
01-verify-webhook → EXIT ✅
```

**Status Update (Not a Message):**
```
01-verify-webhook
  ↓
02-parse-message → EXIT ⏭️
```

**Special Command:**
```
01-verify-webhook
  ↓
02-parse-message
  ↓
03-handle-special-commands
  ↓
06-send-whatsapp-response (skip 04, 05)
  ↓
07-log-metrics
```

---

## Error Handling

Each step handles errors gracefully:

1. **Agent Load Error:** Informs user, suggests typing "help"
2. **Claude API Error:** User-friendly message, suggests retry
3. **WhatsApp Send Error:** Logs error, continues workflow
4. **Missing Config:** Clear error message about what's missing

---

## Testing Individual Steps

You can test each step in Pipedream:

1. Go to workflow → Events tab
2. Select a past execution
3. Click "Replay from step X"
4. Modify input if needed
5. See output in real-time

---

## Customization

### Adding New Agent Triggers

Edit `04-load-agent-config.js`:

```javascript
const agentMap = {
  'publicist': 'publicist.md',
  'growth': 'growth-hacker.md',
  // Add your custom agent:
  'yourname': 'your-agent.md'
};
```

### Changing Claude Model

Set environment variable:
```
CLAUDE_MODEL=claude-haiku-4-5-20250929  # For faster, cheaper responses
```

### Adjusting Token Limits

Set environment variable:
```
CLAUDE_MAX_TOKENS=2048  # For shorter responses
```

---

## Phase 2 Enhancements

Future improvements to these steps:

- **Conversation Memory:** Store chat history in database
- **Voice Messages:** Transcribe audio before processing
- **Image Support:** Analyze images with Claude
- **Agent Caching:** Cache agent configs to reduce GitHub fetches
- **Rate Limiting:** Prevent abuse per user
- **Analytics:** Send metrics to PostHog/Mixpanel

---

## Troubleshooting

### Step 01: Verification Fails
- Check `WHATSAPP_VERIFY_TOKEN` matches Meta console
- Ensure workflow is deployed before verifying

### Step 02: No Messages Received
- Verify webhook subscribed to `messages` in Meta console
- Check your phone number is added as test recipient

### Step 04: Agent Not Found
- Confirm GitHub repo is public or token is set
- Check agent filename exists in `agents/` directory
- Verify branch name is correct (default: `main`)

### Step 05: Claude API Errors
- Verify `CLAUDE_API_KEY` is valid
- Check you have credits remaining
- Review token limits (max 200K context)

### Step 06: WhatsApp Send Fails
- Verify `WHATSAPP_TOKEN` is valid
- Check `WHATSAPP_PHONE_NUMBER_ID` is correct
- Ensure message is under 4096 characters

---

## Performance

**Typical execution times:**
- Step 01: < 50ms
- Step 02: < 100ms
- Step 03: < 50ms
- Step 04: 200-500ms (GitHub fetch)
- Step 05: 2-4 seconds (Claude API)
- Step 06: 200-400ms (WhatsApp API)
- Step 07: < 50ms

**Total response time:** 3-5 seconds (typical)

---

## Cost per Execution

**Free tier (Pipedream):**
- 100 executions/month
- $0 per execution

**Claude API:**
- Haiku: $0.0002-0.0010 per message
- Sonnet: $0.0010-0.0050 per message
- Opus: $0.0050-0.0200 per message

**WhatsApp:**
- Test number: Free
- Production: First 1,000 conversations/month free

---

## Support

**Issues?**
1. Check Pipedream execution logs
2. Review [TROUBLESHOOTING.md](../../../docs/TROUBLESHOOTING.md)
3. Open GitHub issue

---

**Created:** 2025-11-09
**Last Updated:** 2025-11-09
