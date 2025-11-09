# The Cockpit - Technical Architecture

**Version:** 1.0.0
**Last Updated:** 2025-11-09

---

## System Overview

The Cockpit is a serverless WhatsApp-based AI agent platform that routes user messages to specialized AI agents using Claude's API. The system is designed to be simple, cost-effective, and highly extensible.

---

## Architecture Diagram

```
┌─────────────────┐
│   User (You)    │
│    WhatsApp     │
└────────┬────────┘
         │ 1. Send message with agent trigger
         │    Example: "@publicist announce launch"
         ▼
┌─────────────────────────────────────┐
│   WhatsApp Business API             │
│   - Receives incoming messages      │
│   - Sends outgoing responses        │
└────────┬────────────────────────────┘
         │ 2. Webhook triggers workflow
         ▼
┌─────────────────────────────────────┐
│   Automation Platform               │
│   (Pipedream / n8n / Zapier)        │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 1. Parse Message            │   │
│   │    - Extract agent trigger  │   │
│   │    - Extract user query     │   │
│   │    - Get conversation ID    │   │
│   └──────────┬──────────────────┘   │
│              │                       │
│   ┌──────────▼──────────────────┐   │
│   │ 2. Load Agent Config        │   │
│   │    - Read agent .md file    │   │
│   │    - Load system prompt     │   │
│   │    - Get agent context      │   │
│   └──────────┬──────────────────┘   │
│              │                       │
│   ┌──────────▼──────────────────┐   │
│   │ 3. Conversation Memory      │   │
│   │    - Fetch last 5 messages  │   │
│   │    - Build context window   │   │
│   │    - Maintain agent state   │   │
│   └──────────┬──────────────────┘   │
│              │                       │
│   ┌──────────▼──────────────────┐   │
│   │ 4. Build Claude Prompt      │   │
│   │    - System: Agent instruct │   │
│   │    - Context: Conversation  │   │
│   │    - User: Current query    │   │
│   └──────────┬──────────────────┘   │
└──────────────┼──────────────────────┘
               │ 3. API call with full context
               ▼
┌─────────────────────────────────────┐
│   Anthropic Claude API              │
│   - Process request                 │
│   - Generate response               │
│   - Return completion               │
└────────┬────────────────────────────┘
         │ 4. Response text
         ▼
┌─────────────────────────────────────┐
│   Automation Platform               │
│   - Format response                 │
│   - Save to conversation memory     │
│   - Send to WhatsApp API            │
└────────┬────────────────────────────┘
         │ 5. Formatted response
         ▼
┌─────────────────────────────────────┐
│   WhatsApp Business API             │
│   - Deliver message to user         │
└────────┬────────────────────────────┘
         │ 6. Message appears in chat
         ▼
┌─────────────────┐
│   User (You)    │
│    WhatsApp     │
└─────────────────┘
```

---

## Component Details

### 1. WhatsApp Business API

**Purpose:** Message interface between user and system

**Responsibilities:**
- Receive user messages
- Send bot responses
- Handle media (voice messages, images)
- Manage message status (delivered, read)

**Configuration:**
```json
{
  "phone_number": "+1234567890",
  "api_version": "v17.0",
  "webhook_url": "https://your-automation-platform/webhook",
  "verify_token": "your-secure-verify-token"
}
```

**Message Format (Incoming):**
```json
{
  "from": "1234567890",
  "id": "wamid.xxx",
  "timestamp": "1699564800",
  "text": {
    "body": "@publicist PropIQ hit 100 users!"
  },
  "type": "text"
}
```

---

### 2. Automation Platform (Workflow Engine)

**Purpose:** Core business logic and orchestration

**Platform Options:**

#### Option A: Pipedream (Recommended)
- **Pros:** Free tier, easy setup, great docs, Node.js-based
- **Cons:** Limited to 100 workflow runs/month on free tier
- **Best for:** Getting started quickly

#### Option B: n8n
- **Pros:** Self-hostable, unlimited runs, visual workflow builder
- **Cons:** Requires server setup or $20/month cloud hosting
- **Best for:** Full control, higher volume

#### Option C: Zapier
- **Pros:** Most integrations, familiar UI
- **Cons:** Most expensive, limited free tier
- **Best for:** Quick MVP if already using Zapier

**Workflow Steps:**

```javascript
// Step 1: Parse Incoming Message
const parseMessage = (message) => {
  const text = message.text.body;
  const triggerMatch = text.match(/^@(\w+)/);

  return {
    agent: triggerMatch ? triggerMatch[1] : 'default',
    query: triggerMatch ? text.replace(/^@\w+\s*/, '') : text,
    userId: message.from,
    messageId: message.id
  };
};

// Step 2: Load Agent Configuration
const loadAgent = async (agentName) => {
  // Fetch from GitHub or local storage
  const agentFile = await fetch(
    `https://raw.githubusercontent.com/briandusape/the-cockpit/main/agents/${agentName}.md`
  );
  return await agentFile.text();
};

// Step 3: Get Conversation Memory
const getConversationMemory = (userId, agentName) => {
  // Fetch from workflow state/database
  const key = `${userId}:${agentName}`;
  return workflowState[key] || [];
};

// Step 4: Build Claude Prompt
const buildPrompt = (agentInstructions, conversationHistory, userQuery) => {
  return {
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: agentInstructions,
    messages: [
      ...conversationHistory,
      {
        role: "user",
        content: userQuery
      }
    ]
  };
};

// Step 5: Call Claude API
const callClaude = async (prompt) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify(prompt)
  });

  return await response.json();
};

// Step 6: Update Conversation Memory
const updateMemory = (userId, agentName, userQuery, assistantResponse) => {
  const key = `${userId}:${agentName}`;
  const history = workflowState[key] || [];

  history.push(
    { role: "user", content: userQuery },
    { role: "assistant", content: assistantResponse }
  );

  // Keep last 10 messages (5 exchanges)
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  workflowState[key] = history;
};

// Step 7: Send Response to WhatsApp
const sendToWhatsApp = async (to, message) => {
  await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: message }
    })
  });
};
```

---

### 3. Agent Storage (GitHub Repository)

**Purpose:** Version-controlled agent configurations

**Structure:**
```
agents/
├── publicist.md           # Full agent system prompt
├── growth-hacker.md       # Growth hacker instructions
├── strategist.md          # Strategist configuration
├── content-strategist.md  # Content creation agent
├── credit-advisor.md      # Financial advisor
└── _template.md           # Template for new agents
```

**Agent File Format:**
```markdown
# [Agent Name] Agent - System Instructions

## Role
[Agent's primary role and expertise]

## Personality
- [Trait 1]
- [Trait 2]
- [Trait 3]

## Core Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]
3. [Responsibility 3]

## Knowledge Base
[Domain knowledge, tools, context]

## Output Format
[How agent should respond]

## Constraints
**Never:**
- [Constraint 1]

**Always:**
- [Requirement 1]
```

---

### 4. Anthropic Claude API

**Purpose:** AI language model for agent responses

**Configuration:**
```javascript
{
  model: "claude-sonnet-4-5-20250929",  // Recommended
  max_tokens: 4096,                      // Adjust based on needs
  temperature: 0.7,                      // Default (0-1 range)
  system: "[Agent instructions]",        // From agent .md file
  messages: [                            // Conversation history
    { role: "user", content: "..." },
    { role: "assistant", content: "..." }
  ]
}
```

**Model Selection:**

| Model | Use Case | Cost | Speed |
|-------|----------|------|-------|
| Haiku 4.5 | Quick responses, simple queries | Lowest | Fastest |
| Sonnet 4.5 | Balanced (recommended) | Medium | Medium |
| Opus 4.1 | Complex reasoning, long-form | Highest | Slowest |

**Token Limits:**
- Max context: 200K tokens (standard)
- Recommended response: 1-4K tokens
- Average conversation: ~500-2K tokens

---

### 5. Conversation Memory

**Purpose:** Maintain context across messages

**Storage Options:**

#### Option A: Workflow State (Simple)
```javascript
// Pipedream example
const memory = await require("@pipedreamhq/platform").db.get(`${userId}:${agent}`);
await require("@pipedreamhq/platform").db.set(`${userId}:${agent}`, newMemory);
```

#### Option B: Redis (Scalable)
```javascript
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

// Get memory
const memory = await client.get(`${userId}:${agent}`);

// Set memory with TTL (expire after 24 hours)
await client.setEx(`${userId}:${agent}`, 86400, JSON.stringify(newMemory));
```

#### Option C: Supabase (Full database)
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Get memory
const { data } = await supabase
  .from('conversations')
  .select('messages')
  .eq('user_id', userId)
  .eq('agent', agent)
  .single();

// Update memory
await supabase
  .from('conversations')
  .upsert({
    user_id: userId,
    agent: agent,
    messages: newMemory,
    updated_at: new Date()
  });
```

**Memory Structure:**
```javascript
{
  userId: "1234567890",
  agent: "publicist",
  messages: [
    { role: "user", content: "...", timestamp: "2025-11-09T10:00:00Z" },
    { role: "assistant", content: "...", timestamp: "2025-11-09T10:00:05Z" },
    // ... up to 10 messages (5 exchanges)
  ],
  lastActive: "2025-11-09T10:00:05Z",
  activeAgent: "publicist"
}
```

---

## Data Flow

### Typical Conversation Flow

```
1. User sends: "@publicist PropIQ hit 100 users!"

2. Workflow receives webhook from WhatsApp

3. Parse message:
   - Agent: "publicist"
   - Query: "PropIQ hit 100 users!"
   - User: "1234567890"

4. Load agent config:
   - Fetch agents/publicist.md from GitHub
   - Parse system instructions

5. Get conversation memory:
   - Check if user has active conversation with publicist
   - Load last 5 message exchanges (if any)

6. Build Claude prompt:
   {
     system: "[Publicist agent instructions]",
     messages: [
       // ... previous conversation (if any)
       { role: "user", content: "PropIQ hit 100 users!" }
     ]
   }

7. Call Claude API:
   - Send prompt
   - Receive response

8. Update memory:
   - Add user message to history
   - Add assistant response to history
   - Save to storage

9. Send to WhatsApp:
   - Format response
   - Send via WhatsApp Business API

10. User receives response in WhatsApp
```

---

## Agent Switching Logic

### Trigger Detection

```javascript
const detectAgent = (message) => {
  // Explicit trigger (recommended)
  if (message.startsWith('@')) {
    const agent = message.match(/^@(\w+)/)[1];
    return {
      agent: agent,
      query: message.replace(/^@\w+\s*/, ''),
      explicit: true
    };
  }

  // Implicit (continue with last agent)
  const lastAgent = getLastActiveAgent(userId);
  return {
    agent: lastAgent || 'default',
    query: message,
    explicit: false
  };
};
```

### Agent Mapping

```javascript
const agentMap = {
  'publicist': 'agents/publicist.md',
  'growth': 'agents/growth-hacker.md',
  'strategist': 'agents/strategist.md',
  'content': 'agents/content-strategist.md',
  'credit': 'agents/credit-advisor.md',
  'default': 'agents/publicist.md'  // Fallback
};
```

### Special Commands

```javascript
const handleSpecialCommands = (message) => {
  switch(message.toLowerCase()) {
    case 'clear':
    case 'reset':
      clearConversationMemory(userId);
      return "Conversation cleared. Which agent would you like to talk to?";

    case 'help':
    case 'agents':
      return listAvailableAgents();

    case 'status':
      return getCurrentAgentStatus(userId);

    default:
      return null;  // Not a special command
  }
};
```

---

## Scalability Considerations

### Current Capacity (MVP)

- **Users:** 1 (you)
- **Agents:** 5 (unlimited potential)
- **Messages/month:** 100-300
- **Conversation memory:** 10 messages (5 exchanges) per agent
- **Cost:** $0.18-6.30/month

### Scaling to 10 Users

- **Messages/month:** 1,000-3,000
- **Storage:** Redis or Supabase recommended
- **Cost:** $1.80-63/month (still cheaper than Motion)

### Scaling to 100+ Users

- **Architecture changes needed:**
  - Move from workflow state to database (Supabase/PostgreSQL)
  - Add rate limiting per user
  - Consider Haiku for simple queries, Sonnet for complex
  - Add caching layer for agent configs
  - Implement message queue (Pub/Sub)

- **Cost:** $18-630/month (at 100 users)

---

## Security Architecture

### API Key Management

```javascript
// Environment variables (never commit these!)
process.env.CLAUDE_API_KEY = "sk-ant-api03-..."
process.env.WHATSAPP_TOKEN = "EAAG..."
process.env.WHATSAPP_VERIFY_TOKEN = "random-secure-string"
```

### Webhook Verification

```javascript
// Verify WhatsApp webhook requests
const verifyWebhook = (req) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return challenge;
  } else {
    return false;
  }
};
```

### User Authentication

```javascript
// Only respond to authorized phone numbers
const authorizedUsers = [
  '1234567890',  // Your number
  // Add team members here later
];

const isAuthorized = (phoneNumber) => {
  return authorizedUsers.includes(phoneNumber);
};
```

---

## Error Handling

### Common Errors & Solutions

```javascript
const handleError = async (error, context) => {
  console.error('Error:', error);

  let userMessage;

  switch(error.type) {
    case 'claude_api_error':
      userMessage = "Sorry, I'm having trouble thinking right now. Try again in a moment.";
      break;

    case 'agent_not_found':
      userMessage = `Agent "${context.agent}" not found. Available agents: @publicist, @growth, @strategist, @content, @credit`;
      break;

    case 'rate_limit':
      userMessage = "You're sending messages too quickly. Please wait a moment.";
      break;

    case 'whatsapp_error':
      userMessage = "Message delivery failed. Please try again.";
      break;

    default:
      userMessage = "Something went wrong. Please try again or type 'help'.";
  }

  await sendToWhatsApp(context.userId, userMessage);
};
```

---

## Performance Optimization

### Response Time Targets

- **Message received → Response sent:** < 5 seconds
- **Agent config load:** < 500ms
- **Claude API call:** 2-4 seconds (typical)
- **Memory read/write:** < 100ms

### Optimization Strategies

1. **Cache agent configs** (GitHub fetch is slow)
   ```javascript
   const agentCache = new Map();

   const getAgent = async (agentName) => {
     if (agentCache.has(agentName)) {
       return agentCache.get(agentName);
     }

     const config = await fetchFromGitHub(agentName);
     agentCache.set(agentName, config);
     return config;
   };
   ```

2. **Use streaming for long responses**
   ```javascript
   // Send typing indicator first
   await sendTypingIndicator(userId);

   // Then stream response as it generates
   const stream = await claudeAPI.stream(prompt);
   for await (const chunk of stream) {
     // Could batch chunks and send incrementally
   }
   ```

3. **Parallel operations where possible**
   ```javascript
   // Load agent config and memory in parallel
   const [agentConfig, memory] = await Promise.all([
     loadAgent(agentName),
     getConversationMemory(userId, agentName)
   ]);
   ```

---

## Monitoring & Observability

### Metrics to Track

```javascript
const metrics = {
  messagesReceived: 0,
  messagesSent: 0,
  agentSwitches: {},
  averageResponseTime: 0,
  claudeAPICalls: 0,
  claudeAPIErrors: 0,
  totalTokensUsed: 0,
  estimatedCost: 0
};
```

### Logging Strategy

```javascript
const log = {
  info: (message, context) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context);
  },
  error: (message, error, context) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error.message,
      stack: error.stack,
      context
    });
  },
  metric: (metricName, value, tags) => {
    console.log(`[METRIC] ${metricName}=${value}`, tags);
  }
};
```

---

## Deployment Architecture

### Option A: Pipedream (Recommended for MVP)

```
GitHub (Agent Configs)
    ↓ (HTTP fetch on demand)
Pipedream Workflow (Serverless)
    ↓ (Stores state)
Pipedream Data Store (Conversation Memory)
```

**Pros:** Zero infrastructure, free tier, easy setup
**Cons:** 100 workflow runs/month limit on free tier

---

### Option B: n8n Self-Hosted

```
GitHub (Agent Configs)
    ↓ (HTTP fetch on demand)
n8n Instance (DigitalOcean Droplet)
    ↓ (Stores data)
Redis or PostgreSQL (Conversation Memory)
```

**Pros:** Unlimited runs, full control, no vendor lock-in
**Cons:** Requires server management, ~$6-12/month hosting

---

### Option C: Serverless (AWS Lambda + API Gateway)

```
GitHub (Agent Configs)
    ↓ (HTTP fetch + cache in S3)
API Gateway → Lambda Function
    ↓ (Stores data)
DynamoDB (Conversation Memory)
```

**Pros:** Highly scalable, pay per use
**Cons:** Most complex setup, AWS learning curve

---

## Future Enhancements

### Phase 2 Features

- **Voice message transcription:** Convert voice to text, process with agent
- **Image support:** Send screenshots, agent analyzes visually
- **Scheduled messages:** "Remind me to review metrics every Monday"
- **Agent collaboration:** "@strategist and @publicist work together on launch plan"

### Phase 3 Features

- **Web dashboard:** View conversation history, analytics
- **API endpoints:** Trigger agents programmatically
- **Webhook integrations:** Agent sends data to other tools
- **Team features:** Multi-user support, shared agents

---

## Related Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Step-by-step setup instructions
- [CUSTOM_AGENTS.md](CUSTOM_AGENTS.md) - How to create custom agents
- [COST_ANALYSIS.md](COST_ANALYSIS.md) - Detailed pricing breakdown
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

---

**Last Updated:** 2025-11-09
**Architecture Version:** 1.0.0
