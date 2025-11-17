# The Cockpit

**Your Personal AI Command Center - Motion for Founders, Accessible Anywhere**

A WhatsApp-based AI agent platform that gives you instant access to your personal team of AI specialists while you're on the go. Text your publicist, strategist, growth hacker, or any of your custom agents directly from WhatsApp.

---

## What is This?

The Cockpit is your personal "Motion" - an AI agent platform designed for founders who need access to their AI team anywhere, anytime. Instead of building a complex web platform, The Cockpit uses WhatsApp as the interface, making it instantly accessible on any phone.

**Think of it as:** Your team of AI employees in your pocket, accessible via text message.

---

## Why WhatsApp?

- **Universal Access:** Works on iOS, Android, desktop
- **Familiar Interface:** Everyone knows how to text
- **Voice Support:** Send voice messages naturally
- **No App Required:** No downloads, no app store approval
- **Cost-Effective:** $0.18-6/month vs Motion's $29-600/month
- **Context Preservation:** Conversation history built-in

---

## The Agent Team

### Available Agents

1. **Publicist** 📣
   - Trigger: `@publicist`
   - Role: Announcements, press releases, content creation
   - Use when: Launching features, hitting milestones, brand messaging

2. **Growth Hacker** 📈
   - Trigger: `@growth`
   - Role: Algorithm optimization, virality, data-driven tactics
   - Use when: Need to understand platform algorithms, optimize content

3. **Strategist** 🧠
   - Trigger: `@strategist`
   - Role: Big decisions, pivots, ROI analysis
   - Use when: Making major business decisions, quarterly planning

4. **Content Strategist** 🎬
   - Trigger: `@content`
   - Role: Video scripts, sponsorships, monetization
   - Use when: Creating TikTok/YouTube content, pitching sponsors

5. **Credit Advisor** 💳
   - Trigger: `@credit`
   - Role: Credit scores, debt management, financial advice
   - Use when: Managing personal finances, credit optimization

### Adding Custom Agents

See [docs/CUSTOM_AGENTS.md](docs/CUSTOM_AGENTS.md) for instructions on creating your own agents.

---

## How It Works

```
You (WhatsApp) → WhatsApp Business API → Automation Platform → Claude API → Response
```

1. **You text:** "@publicist PropIQ hit 100 users!"
2. **Cockpit loads:** Publicist agent instructions
3. **Claude processes:** Request with agent context
4. **You receive:** Professional announcement content ready to post

### Conversation Flow

```
You: @publicist

Bot: Publicist agent activated. How can I help with your announcements today?

You: PropIQ just hit 100 Chrome extension installs!

Bot: Congrats on the milestone! 🎉 Let me create announcement content...
     [Returns Twitter thread, LinkedIn post, email template]

You: Make the Twitter thread more punchy

Bot: [Revises with punchier hooks]
```

---

## 🚀 Quick Start

### Ready to Deploy?

**🎯 [Start Here: QUICK_START.md](QUICK_START.md)** - Get running in 2-4 hours

**📖 [Full Deployment Guide: docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Step-by-step with details

**✅ [Testing Checklist: docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md)** - Verify it works

### Prerequisites

- WhatsApp account
- Facebook/Meta account
- Anthropic Claude API key
- 2-4 hours of focused time

### What You'll Build

A working MVP with:
- ✅ 5 specialized AI agents via WhatsApp
- ✅ Conversation memory (agents remember context)
- ✅ Agent switching (seamless transitions)
- ✅ Usage tracking (tokens, costs, metrics)
- ✅ Error handling & help commands

### Cost

- **Free tier:** $0-2/month (Pipedream free + Claude credits)
- **Paid tier:** $20-26/month (if you exceed 100 messages/month)
- **vs Motion:** $29-600/month (you save 88-95%)

---

## Project Structure

```
the-cockpit/
├── README.md                 # This file
├── agents/                   # Agent configuration files
│   ├── publicist.md         # Publicist agent instructions
│   ├── growth-hacker.md     # Growth hacker agent instructions
│   ├── strategist.md        # Strategist agent instructions
│   ├── content-strategist.md
│   ├── credit-advisor.md
│   └── _template.md         # Template for new agents
├── workflows/               # Automation platform workflows
│   ├── pipedream/          # Pipedream workflow configs
│   ├── n8n/                # n8n workflow configs
│   └── zapier/             # Zapier workflow configs
├── config/                  # Configuration files
│   ├── .env.example        # Environment variables template
│   └── agent-triggers.json # Agent trigger mappings
└── docs/                    # Documentation
    ├── SETUP_GUIDE.md      # Complete setup instructions
    ├── ARCHITECTURE.md     # Technical architecture
    ├── CUSTOM_AGENTS.md    # How to add custom agents
    ├── COST_ANALYSIS.md    # Pricing breakdown
    ├── TROUBLESHOOTING.md  # Common issues and fixes
    └── ROADMAP.md          # Future enhancements
```

---

## Features

### Phase 1 (MVP - Week 1) ✅ IMPLEMENTATION COMPLETE
- ✅ Agent switching via triggers (@publicist, @growth, etc.)
- ✅ Claude API integration (Sonnet 4.5)
- ✅ Conversation memory (context preservation across messages)
- ✅ 5 pre-configured agents with specialized prompts
- ✅ WhatsApp message/response handling
- ✅ Error handling & help commands
- ✅ Usage tracking & metrics logging
- ✅ Multi-turn conversations with context

**Status:** Ready to deploy! See [QUICK_START.md](QUICK_START.md)

### Phase 2 (Differentiation - Week 2-3) ✅ IMPLEMENTATION COMPLETE
- ✅ **Agent collaboration** - Chain multiple agents together (`@collaborate strategist publicist`)
- ✅ **Voice message support** - Send voice messages, get text responses
- ✅ **Context injection** - Agents know your current business state automatically
- ✅ **Quick actions** - 10+ pre-built workflows (` /weekly-review`, `/content-blast`, etc.)
- ✅ **Team access** - Multi-user support with roles and permissions

**Status:** Ready to deploy! See [docs/P1_FEATURES.md](docs/P1_FEATURES.md)

**Competitive Moat:** These features create differentiation no competitor can match.

### Phase 3 (Advanced - Month 2+)
- 📋 Knowledge base integration (RAG - upload docs, agents reference them)
- 📋 Scheduled agent tasks (recurring prompts)
- 📋 Analytics dashboard (web view of usage & costs)
- 📋 Custom workflow automation (Zapier-style agent chains)

---

## Cost Breakdown

### Claude API Costs

**Light Use** (30 conversations/month):
- Haiku: $0.05/month
- Sonnet: $0.63/month

**Medium Use** (100 conversations/month):
- Haiku: $0.175/month
- Sonnet: $2.10/month

**Heavy Use** (300 conversations/month):
- Haiku: $0.525/month
- Sonnet: $6.30/month

### Platform Costs

**Pipedream:** Free tier (100 workflow runs/month) → $0/month
**n8n:** Self-hosted free, cloud $20/month
**Zapier:** Free tier (100 tasks/month) → $0/month

### Total Monthly Cost

**Budget Option:** $0.05-0.18/month (Haiku + free platform)
**Recommended:** $2.10-6.30/month (Sonnet + free platform)

**vs Motion:** $29-600/month (you save 90-99%)

See [docs/COST_ANALYSIS.md](docs/COST_ANALYSIS.md) for detailed breakdown.

---

## Technical Stack

- **Interface:** WhatsApp Business API
- **AI Engine:** Anthropic Claude (Sonnet 4.5 recommended)
- **Automation:** Pipedream (recommended) / n8n / Zapier
- **Agent Storage:** Markdown files (version controlled)
- **Deployment:** Cloud workflow automation (serverless)

---

## Use Cases

### For Founders
- Quick PR announcements while traveling
- Strategic decisions during coffee breaks
- Content creation between meetings
- Growth optimization on the go

### For Content Creators
- Video script generation anywhere
- Sponsorship pitch preparation
- Multi-platform content planning
- Performance analysis on mobile

### For Solopreneurs
- Marketing content on demand
- Business strategy sessions
- Social media management
- Personal brand building

---

## Example Conversations

### Scenario 1: Product Launch
```
You: @publicist
Bot: Publicist activated 📣

You: PropIQ Chrome extension just got approved!
Bot: Congratulations! Let me create launch content...

[5-tweet Twitter thread]
[LinkedIn post]
[Product Hunt description]
[Email to waitlist]

Ready to launch? 🚀
```

### Scenario 2: Growth Strategy
```
You: @growth
Bot: Growth Hacker activated 📈

You: My LinkedIn posts are getting <100 views. What am I doing wrong?
Bot: Let me analyze your LinkedIn strategy...

[Detailed analysis]
[Algorithm insights]
[Optimization recommendations]
[A/B test ideas]

Want me to rewrite one of your posts?
```

### Scenario 3: Business Decision
```
You: @strategist
Bot: Strategist activated 🧠

You: Should I pivot from PropIQ to content creation? Here's my data...
Bot: Let me evaluate both paths...

[Data analysis]
[ROI comparison]
[Risk assessment]
[90-day action plan]

My recommendation: [Detailed strategic advice]
```

---

## Advantages Over Motion

| Feature | The Cockpit | Motion |
|---------|-------------|--------|
| **Cost** | $0.18-6/month | $29-600/month |
| **Access** | Any phone, anywhere | Web/app required |
| **Setup** | 1-6 hours | Immediate (paid) |
| **Customization** | Full control | Limited |
| **Privacy** | Your data stays private | Shared platform |
| **Voice Support** | Native WhatsApp | Depends on platform |
| **Extensibility** | Add unlimited agents | Limited to platform |

---

## Limitations & Tradeoffs

**What The Cockpit Doesn't Do (Yet):**
- Native integrations with Slack, Salesforce, etc. (Motion does this)
- Automated task execution (e.g., "send this email for me")
- Team collaboration features
- Fancy dashboard UI
- Built-in CRM/project management

**Why That's OK:**
- You're building for personal use first
- WhatsApp is your interface (simple > complex)
- Can add integrations in Phase 3
- Focus on agent quality over platform features

---

## Security & Privacy

- **API Keys:** Stored securely in workflow environment variables
- **Messages:** Processed in real-time, not stored long-term
- **Data:** Your agent instructions stay in your GitHub repo
- **WhatsApp:** End-to-end encrypted messaging
- **Claude API:** No training on your data (per Anthropic policy)

See [docs/SECURITY.md](docs/SECURITY.md) for best practices.

---

## Contributing

This is a personal project, but contributions welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-agent`)
3. Commit your changes (`git commit -m 'Add amazing agent'`)
4. Push to the branch (`git push origin feature/amazing-agent`)
5. Open a Pull Request

---

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for detailed feature planning.

**Near-term:**
- [ ] Phase 1 MVP (Week 1)
- [ ] Conversation memory (Week 2)
- [ ] Voice message support (Week 3)
- [ ] Knowledge base integration (Week 4)

**Long-term:**
- [ ] iOS Shortcuts integration
- [ ] Web dashboard (optional)
- [ ] Multi-user support
- [ ] Agent marketplace

---

## FAQ

### Why not just use ChatGPT on mobile?
ChatGPT doesn't maintain multiple agent personas with different expertise areas. The Cockpit gives you specialized agents with deep domain knowledge and consistent roles.

### Can I use this for my team?
Phase 1 is single-user. Phase 3 will add team support.

### What if WhatsApp changes their API?
We'll adapt. The architecture is modular - could switch to Telegram, SMS, or custom app.

### Can I self-host everything?
Yes! Use n8n (self-hosted) instead of Pipedream. Your agents are markdown files you control.

### How is this different from building custom GPTs?
Custom GPTs require ChatGPT Plus and live in ChatGPT's interface. The Cockpit is accessible via WhatsApp (more convenient on mobile) and uses Claude (often better for business/writing tasks).

---

## Support

- **Issues:** [GitHub Issues](https://github.com/briandusape/the-cockpit/issues)
- **Discussions:** [GitHub Discussions](https://github.com/briandusape/the-cockpit/discussions)
- **Email:** [Your contact email]

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- Inspired by Motion's agent platform
- Powered by Anthropic's Claude AI
- Built with WhatsApp Business API
- Workflow automation via Pipedream/n8n/Zapier

---

## Author

**Brian Dusape**
- Founder, LUNTRA
- Building tools for founders and creators
- [Your links: Twitter, LinkedIn, etc.]

---

**Built with ❤️ by founders, for founders**

*The Cockpit - Your AI team, always in your pocket.*
