# The Cockpit - P1 Features Documentation

**Phase 2: Differentiation & Competitive Moat**

**Last Updated:** November 17, 2025

---

## 🎯 Overview

P1 features transform The Cockpit from a basic AI chatbot into a uniquely powerful platform that no competitor can match. These features create **competitive moat** and **drive monetization**.

---

## 🤝 Feature 1: Agent Collaboration

### What It Is

Chain multiple agents together for complex tasks that require different expertise.

### Why It Matters

**Unique Differentiator:** No competitor offers multi-agent collaboration. ChatGPT Custom GPTs can't talk to each other. Motion doesn't have specialized agents.

**Real-World Value:** Most business problems need multiple perspectives:
- Strategy → Execution (Strategist → Publicist)
- Analysis → Action (Growth → Content)
- Planning → Delivery (Strategist → Content)

### How to Use It

**Syntax:**
```
@collaborate agent1 agent2 "task description"
```

**Short form:**
```
@collab agent1 agent2 "task"
```

### Examples

**Example 1: Product Launch**
```
@collaborate strategist publicist "Should I launch PropIQ on Product Hunt this week?"
```

**What happens:**
1. Strategist analyzes timing, market conditions, readiness
2. Publicist receives strategist's analysis
3. Publicist creates launch content based on strategy
4. You get: Strategic recommendation + Ready-to-post launch content

**Example 2: Content Strategy**
```
@collab growth content "My TikTok videos aren't getting views. Help me fix this."
```

**What happens:**
1. Growth agent analyzes TikTok algorithm, identifies issues
2. Content agent receives growth insights
3. Content agent creates optimized video scripts
4. You get: Algorithm insights + 5 video scripts ready to shoot

**Example 3: Competitive Positioning**
```
@collaborate strategist publicist "Competitor X just launched a feature similar to ours. How should we respond?"
```

**What happens:**
1. Strategist analyzes competitive threat, recommends positioning
2. Publicist creates messaging based on strategy
3. You get: Strategic response + Messaging for all channels

### Technical Implementation

**Files:**
- `workflows/pipedream/steps/2b-parse-collaboration.js` - Detects collaboration syntax
- `workflows/pipedream/steps/5b-execute-collaboration.js` - Executes agent chain

**How It Works:**
1. Parse collaboration command
2. Load first agent's configuration
3. First agent processes task
4. Load second agent's configuration
5. Second agent receives first agent's output as context
6. Return combined response with both perspectives

**Token Usage:**
- Approximately 2x normal usage (two Claude API calls)
- Worth it for complex tasks

### Deployment

**Add to your workflow:**
1. Insert `2b-parse-collaboration.js` after step 2 (parse-message)
2. Insert `5b-execute-collaboration.js` as alternative to step 5 (call-claude)
3. Add conditional logic: if collaboration detected, use 5b instead of 5

**No additional environment variables needed.**

---

## 📊 Feature 2: Context Injection

### What It Is

Agents automatically know your current business state (metrics, goals, recent wins) without you having to explain every time.

### Why It Matters

**Problem Solved:** Generic AI doesn't know your business. You waste time re-explaining context.

**Value:** Agents stay current and give relevant advice based on your actual situation.

### How It Works

**business-state.json** contains:
- Current product metrics (users, MRR, etc.)
- Business goals and priorities
- Recent wins and milestones
- Upcoming launches
- Competitive positioning

This context is **automatically injected** into every agent's system prompt.

### Example Without Context

```
You: @strategist What should I focus on this week?

Bot: [Generic advice about goal-setting, prioritization frameworks]
```

### Example With Context

```
You: @strategist What should I focus on this week?

Bot: Based on your current state:
- PropIQ is at 0 users, goal is 100 by Q4
- Chrome Extension approval is pending
- Recent win: The Cockpit MVP complete

Priority 1: Get Chrome Extension approved (blocking growth)
Priority 2: Build PropIQ landing page (convert traffic when approved)
Priority 3: Create 10 PropIQ demo videos (for launch day)

Rationale: [Specific to YOUR situation]
```

### Configuration

**Edit `config/business-state.json`:**

```json
{
  "products": {
    "propiq": {
      "metrics": {
        "users": 127,  // Update these weekly
        "mrr": 240,
        "payingCustomers": 3
      },
      "goals": {
        "q4_2025": "100+ Chrome extension installs, first 5 paying customers"
      },
      "recentWins": [
        "Featured on Product Hunt #3 product of day",
        "First paying customer (Nov 15)"
      ]
    }
  },
  "currentPriorities": [
    "Reach 100 paying customers",
    "Ship PropIQ v2 mobile app"
  ]
}
```

**Update frequency:** Weekly or after major milestones

### Technical Implementation

**Files:**
- `config/business-state.json` - Your business state (edit this)
- `workflows/pipedream/steps/4b-inject-context.js` - Injects context into agents

**How It Works:**
1. Agent configuration loaded from GitHub
2. Business state loaded from GitHub
3. Context string built from business state
4. Context appended to agent's system prompt
5. Claude sees: Agent instructions + Current business context

**Performance:** Adds ~500-1000 tokens per request (negligible cost increase)

### Deployment

**Add to your workflow:**
1. Insert `4b-inject-context.js` after step 4 (load-agent)
2. Configure `business-state.json` with your actual data
3. Commit and push to GitHub

**Update business-state.json** when:
- Metrics change significantly (>10%)
- You hit major milestones
- Priorities shift
- New products launch

---

## ⚡ Feature 3: Quick Actions

### What It Is

Pre-built workflows triggered with a single command. Like Siri Shortcuts for your AI agents.

### Why It Matters

**Reduces Friction:** Common tasks become instant
**Increases Usage:** Easier to use = more engagement = better retention
**Onboarding:** New users see value immediately

### Available Quick Actions

#### Strategy & Planning

**`/weekly-review`** 📊
- Strategist guides you through a weekly review
- Asks about wins, challenges, metrics
- Provides strategic analysis
- Plans next week's priorities

**`/monthly-goals`** 🎯
- Set SMART goals for the month
- Based on last month's performance
- Creates milestones and action plans

**`/pricing-analysis`** 💰
- Analyzes your pricing strategy
- Recommends pricing tiers
- Provides revenue projections

**`/launch-plan`** 🚀
- Strategist + Publicist collaboration
- Complete product launch strategy
- Pre-launch, launch day, post-launch tactics

#### Content Creation

**`/content-blast`** 🎬
- Creates 10 tweet ideas for the week
- Based on current priorities and wins
- Ready to post

**`/content-repurpose`** ♻️
- Takes one piece of content
- Repurposes into 10 formats
- Twitter, LinkedIn, TikTok, blog, email, etc.

**`/announcement`** 📣
- Creates multi-platform announcement
- Twitter thread + LinkedIn + email
- For milestones, launches, news

#### Growth & Marketing

**`/growth-audit`** 📈
- Audits your growth tactics
- Platform-specific insights
- 5 actionable improvements

**`/viral-breakdown`** 🔥
- Analyzes viral content
- Explains why it went viral
- Template to replicate success

**`/competitor-analysis`** 🔍
- Deep dive on a competitor
- SWOT analysis
- Differentiation opportunities

### How to Use

**List all actions:**
```
/actions
```

**Trigger an action:**
```
/weekly-review
```

**Action with input:**
```
/announcement PropIQ hit 500 users!
```

### Creating Custom Actions

**Edit `config/quick-actions.json`:**

```json
{
  "my-custom-action": {
    "name": "My Custom Action",
    "description": "What this action does",
    "agent": "publicist",
    "prompt": "Detailed prompt for the agent...",
    "emoji": "🎯",
    "requiresInput": false
  }
}
```

### Technical Implementation

**Files:**
- `config/quick-actions.json` - Action definitions
- `workflows/pipedream/steps/2c-parse-quick-actions.js` - Parses `/commands`

**How It Works:**
1. User sends `/action-name`
2. Workflow loads quick-actions.json
3. Finds matching action
4. Expands template with prompt
5. Routes to specified agent
6. Agent processes expanded prompt

**Performance:** Same as normal agent call (no overhead)

### Deployment

**Add to your workflow:**
1. Insert `2c-parse-quick-actions.js` after step 2 (parse-message)
2. Configure `quick-actions.json` (default actions included)
3. Commit and push to GitHub

---

## 🎤 Feature 4: Voice Message Support

### What It Is

Send voice messages to agents, get text responses back. Perfect for mobile-first founders.

### Why It Matters

**Mobile-First:** Founders think while walking, driving, showering
**Async Communication:** Voice is faster than typing on mobile
**Unique Differentiator:** Motion doesn't have this. ChatGPT has voice but not with specialized agents.

### How to Use

1. Open WhatsApp
2. Record a voice message
3. Send to The Cockpit
4. Receive text response from agent

**Example:**
```
🎤 [Voice: "Hey strategist, I'm thinking about pivoting from PropIQ
     to focus on content creation. I already have 5,000 TikTok followers
     and getting 100k views per week. Should I do it?"]

Bot: [Transcription of your voice]

Strategist: Let me analyze both paths...
[Detailed strategic analysis]
```

### Transcription Services

**Option A: AssemblyAI** (Recommended)
- Cost: $0.00025/second (~$0.015 for 60-second message)
- Accuracy: Excellent
- Speed: 2-5 seconds
- Sign up: https://www.assemblyai.com/

**Option B: OpenAI Whisper**
- Cost: $0.006/minute (~$0.006 for 60-second message)
- Accuracy: Excellent
- Speed: 1-3 seconds
- Sign up: https://platform.openai.com/

### Configuration

**Set environment variable:**
```
TRANSCRIPTION_SERVICE=assemblyai (or openai)
ASSEMBLYAI_API_KEY=your-key-here (if using AssemblyAI)
OPENAI_API_KEY=your-key-here (if using OpenAI)
```

### Technical Implementation

**Files:**
- `workflows/pipedream/steps/2d-handle-voice-messages.js` - Downloads & transcribes audio
- `workflows/pipedream/steps/2e-merge-voice-to-text.js` - Converts to text message format

**How It Works:**
1. WhatsApp sends audio message
2. Workflow downloads audio from WhatsApp Media API
3. Audio sent to transcription service (AssemblyAI or OpenAI)
4. Transcription returned as text
5. Converted to text message format
6. Processed normally by agents

**Supported formats:** All WhatsApp audio formats (OGG, AAC, etc.)

### Deployment

**Add to your workflow:**
1. Insert `2d-handle-voice-messages.js` BEFORE step 2 (parse-message)
2. Insert `2e-merge-voice-to-text.js` after 2d
3. Set transcription service environment variables
4. Test with a voice message

**Cost estimate:** $0.01-0.02 per voice message (60 seconds average)

---

## 👥 Feature 5: Team Access (Multi-User Support)

### What It Is

Add team members to your Cockpit. Each person gets their own access with role-based permissions and usage limits.

### Why It Matters

**Monetization Path:** Teams pay 3-10x more than individuals
**Collaboration:** Founding teams work together
**Scalability:** Grow from solo founder → team → company

### Plans & Pricing

**Free Plan**
- 1 user
- 50 messages/month
- Basic agents

**Starter ($9/month)**
- 1 user
- 300 messages/month
- All features

**Pro ($29/month)**
- 3 users
- 1,000 messages/month
- All features + team access

**Team ($99/month)**
- 10 users
- 5,000 messages/month
- All features + analytics + priority support

### Roles & Permissions

**Owner**
- Full access
- Manage users
- View analytics
- Manage billing

**Admin**
- Use all agents
- Invite users
- View analytics

**Member**
- Use all agents
- Standard access

**Limited**
- Access to specific agents only
- Custom message limit

### How to Add Users

**Edit `config/team-access.json`:**

```json
{
  "users": {
    "owner": {
      "phoneNumber": "1234567890",
      "name": "Brian Dusape",
      "role": "owner",
      "email": "brian@example.com",
      "isActive": true
    },
    "cofounder": {
      "phoneNumber": "0987654321",
      "name": "Jane Smith",
      "role": "admin",
      "email": "jane@example.com",
      "isActive": true,
      "messageLimit": null
    },
    "va": {
      "phoneNumber": "5555555555",
      "name": "Virtual Assistant",
      "role": "limited",
      "permissions": ["publicist", "content"],
      "messageLimit": 50,
      "isActive": true
    }
  }
}
```

### Admin Commands

**View team members:**
```
/admin users
```

**View usage stats:**
```
/admin stats
```

**View current plan:**
```
/admin plan
```

### Technical Implementation

**Files:**
- `config/team-access.json` - User list and permissions
- `workflows/pipedream/steps/1b-authorize-user.js` - Checks authorization
- `workflows/pipedream/steps/2f-admin-commands.js` - Admin commands

**How It Works:**
1. User sends message
2. Workflow checks if phone number is authorized
3. Checks if user is active
4. Checks usage limits (user + team)
5. If all checks pass, message processed normally
6. If any check fails, access denied message sent

**Usage tracking:**
- Per-user message count stored in Pipedream Data Store
- Team-wide usage aggregated
- Resets monthly

### Deployment

**Add to your workflow:**
1. Insert `1b-authorize-user.js` after step 1 (verify-webhook)
2. Insert `2f-admin-commands.js` after 1b
3. Configure `team-access.json` with your team
4. Commit and push to GitHub

**Security:**
- Phone numbers are the authentication method
- WhatsApp already verified the phone number
- No passwords needed (WhatsApp handles auth)

---

## 🚀 Deployment Guide for P1 Features

### Prerequisites

- P0 features deployed and working
- GitHub repo updated with P1 files

### Step-by-Step Deployment

#### 1. Update Your Business State

```bash
# Edit config/business-state.json
# Add your current metrics, goals, priorities
git add config/business-state.json
git commit -m "Update business state"
git push
```

#### 2. Configure Team Access (Optional)

```bash
# Edit config/team-access.json
# Add team members if needed
git add config/team-access.json
git commit -m "Configure team access"
git push
```

#### 3. Add P1 Steps to Pipedream Workflow

**Order matters! Add in this sequence:**

1. **After Step 1 (verify-webhook):**
   - Add `1b-authorize-user.js`

2. **After Step 1b (if added):**
   - Add `2f-admin-commands.js`

3. **BEFORE Step 2 (parse-message):**
   - Add `2d-handle-voice-messages.js`
   - Add `2e-merge-voice-to-text.js`

4. **After Step 2 (parse-message):**
   - Add `2b-parse-collaboration.js`
   - Add `2c-parse-quick-actions.js`

5. **After Step 4 (load-agent):**
   - Add `4b-inject-context.js`

6. **Alternative to Step 5 (call-claude):**
   - Add `5b-execute-collaboration.js`
   - Add conditional: If collaboration, use 5b; else use 5

#### 4. Set Environment Variables

**For Voice Messages:**
```
TRANSCRIPTION_SERVICE=assemblyai
ASSEMBLYAI_API_KEY=your-key-here
```

**Or if using OpenAI:**
```
TRANSCRIPTION_SERVICE=openai
OPENAI_API_KEY=your-key-here
```

#### 5. Deploy & Test

1. Click **Deploy** in Pipedream
2. Test each feature:
   - Send `@collab strategist publicist "test"`
   - Send `/actions` to see quick actions
   - Send `/weekly-review`
   - Send a voice message
   - Send `/admin stats` (if owner/admin)

---

## 📊 Feature Comparison Matrix

| Feature | Free | Starter | Pro | Team |
|---------|------|---------|-----|------|
| **Basic Agents** | ✅ | ✅ | ✅ | ✅ |
| **Conversation Memory** | ✅ | ✅ | ✅ | ✅ |
| **Voice Messages** | ❌ | ✅ | ✅ | ✅ |
| **Quick Actions** | ❌ | ✅ | ✅ | ✅ |
| **Agent Collaboration** | ❌ | ❌ | ✅ | ✅ |
| **Context Injection** | ❌ | ❌ | ✅ | ✅ |
| **Team Access** | ❌ | ❌ | ✅ | ✅ |
| **Analytics Dashboard** | ❌ | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ❌ | ❌ | ✅ |

---

## 💡 Usage Examples

### Workflow 1: Weekly Planning

```
Monday 9am:
You: /weekly-review

Strategist: Let's review your week...
[Guides you through reflection]

[Based on your answers:]
Top 3 priorities this week:
1. Ship PropIQ feature X
2. Create 5 demo videos
3. Reach out to 20 potential customers

You: /content-blast

Content: Here are 10 tweet ideas based on your priorities...
[10 ready-to-post tweets]
```

### Workflow 2: Product Launch

```
You: @collaborate strategist publicist "I'm launching PropIQ v2 next week. Help me plan."

Strategist: [Analyzes timing, readiness, channels]
Recommendation: Launch Tuesday on Product Hunt, Twitter, LinkedIn

Publicist: [Receives strategy]
Here's your launch content:
- Product Hunt post
- Twitter thread (7 tweets)
- LinkedIn announcement
- Email to waitlist
- Press release

Ready to launch? 🚀
```

### Workflow 3: Content Repurposing

```
You: /content-repurpose I just published this blog post: [paste URL or text]

Content: Repurposing into 10 formats...

1. Twitter thread (ready to post)
2. LinkedIn article
3. TikTok script (60 seconds)
4. Email newsletter section
5. Instagram carousel (5 slides)
6. Podcast talking points
7. 3 quote graphics
8. Reddit post
9. YouTube Short script
10. Blog post outline for Part 2

Which format should I start with?
```

---

## 🎯 Next Steps

**Week 2-3:**
- Deploy P1 features
- Test each feature thoroughly
- Update business-state.json weekly
- Create 3-5 custom quick actions

**Month 2:**
- Add team members if applicable
- Track which features get used most
- Iterate on quick actions based on usage
- Collect feedback from beta users

**Month 3:**
- Launch paid tiers
- Use team access for monetization
- Build analytics dashboard (P2 feature)
- Scale to 50-100 users

---

**Congratulations!** You now have differentiation features that create a competitive moat. No competitor can match agent collaboration + context injection + quick actions combined.

**Go ship it! 🚀**
