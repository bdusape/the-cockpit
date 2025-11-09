# The Cockpit - Frequently Asked Questions

**Quick answers to common questions about The Cockpit**

---

## General Questions

### What is The Cockpit?

The Cockpit is a WhatsApp-based AI agent platform that gives you instant access to specialized AI assistants. Think of it as "Motion for founders" but accessible via WhatsApp instead of a web app.

**Key features:**
- 5 specialized AI agents (Publicist, Growth Hacker, Strategist, Content Strategist, Credit Advisor)
- Accessible via WhatsApp from any phone
- Powered by Claude AI
- Costs $0.18-6/month (vs Motion's $29-600/month)

---

### How is this different from ChatGPT?

| Feature | The Cockpit | ChatGPT |
|---------|-------------|---------|
| **Interface** | WhatsApp (anywhere) | App or web only |
| **Agents** | 5 specialized agents | One general assistant |
| **Customization** | Fully customizable agents | Limited custom GPTs |
| **Cost** | $0.18-6/month | $20/month (Plus) |
| **Context** | Agent remembers role | General purpose |
| **Privacy** | Your infrastructure | OpenAI's platform |

**When to use The Cockpit:**
- Need specialized expertise (PR, growth, strategy)
- Want WhatsApp convenience
- Prefer Claude over GPT
- Want full control/customization

**When to use ChatGPT:**
- General Q&A
- Already have ChatGPT Plus
- Don't want to set up infrastructure

---

### How is this different from Motion?

| Feature | The Cockpit | Motion |
|---------|-------------|--------|
| **Cost** | $0.18-6/month | $29-600/month |
| **Access** | WhatsApp (any phone) | Web/app required |
| **Setup** | 1-6 hours DIY | Immediate (paid) |
| **Customization** | Full control | Limited |
| **Integrations** | Phase 3 | Built-in (Slack, etc.) |
| **Team features** | Phase 4 | Built-in |

**The Cockpit is better if:**
- You want mobile-first access
- You're on a budget
- You want full control/customization
- You're technical enough for setup

**Motion is better if:**
- You need team features now
- You want built-in integrations
- You don't want to manage infrastructure
- You value time over money

---

### Why WhatsApp instead of a web app?

**Advantages:**
- ✅ Works on any phone (iOS, Android, desktop)
- ✅ Always in your pocket
- ✅ Familiar interface (everyone knows how to text)
- ✅ Native voice message support
- ✅ No app to build/maintain
- ✅ Push notifications built-in
- ✅ Context preserved in chat history

**Disadvantages:**
- ❌ Not as feature-rich as dedicated app
- ❌ WhatsApp API setup required
- ❌ Limited to WhatsApp users

**Bottom line:** For a solo founder on the go, WhatsApp is the most accessible interface.

---

## Setup & Technical

### How long does setup take?

**Quick setup:** 1-2 hours (basic functionality)
- WhatsApp Business account: 30 min
- Claude API key: 10 min
- Pipedream workflow: 45 min
- Testing: 15 min

**Full setup:** 4-6 hours (all features + customization)
- Everything above
- Custom agents: 1-2 hours
- Troubleshooting: 1-2 hours

**Shortcut:** Follow [QUICKSTART.md](QUICKSTART.md) for fastest path.

---

### Do I need to know how to code?

**Short answer:** No, but basic technical skills help.

**You need:**
- ✅ Ability to copy/paste code snippets
- ✅ Comfortable following step-by-step guides
- ✅ Basic understanding of APIs/webhooks
- ✅ Willingness to debug if things break

**You DON'T need:**
- ❌ Programming experience
- ❌ Server management skills
- ❌ Deep technical knowledge

**If you can set up a WordPress site, you can set up The Cockpit.**

---

### What if I get stuck during setup?

**Resources:**
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues & fixes
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed step-by-step
3. [GitHub Issues](https://github.com/briandusape/the-cockpit/issues) - Ask questions
4. [GitHub Discussions](https://github.com/briandusape/the-cockpit/discussions) - Community help

**Most common issues:**
- Webhook verification fails → Check verify tokens match
- No messages received → Subscribe webhook to `messages`
- Agent not found → Make GitHub repo public

**90% of issues are covered in the troubleshooting guide.**

---

### Can I use this without WhatsApp?

**Currently:** No, Phase 1 is WhatsApp-only.

**Future options (Phase 4):**
- Telegram
- SMS
- Slack
- Email
- Web dashboard
- API access

**Why WhatsApp first?**
- Most accessible globally
- Best mobile experience
- Voice message support
- Free API for testing

---

## Cost & Usage

### How much does this really cost?

**Most common scenario (100 messages/month):**

| Service | Cost |
|---------|------|
| Claude API (Sonnet) | $0.63-2.10 |
| Pipedream (free tier) | $0 |
| WhatsApp Business | $0 |
| **Total** | **$0.63-2.10/month** |

**Heavy usage (300 messages/month):**

| Service | Cost |
|---------|------|
| Claude API (Sonnet) | $6.30 |
| Pipedream (paid) | $20 |
| WhatsApp Business | $0 |
| **Total** | **$26.30/month** |

**Cost factors:**
- Claude model (Haiku cheaper, Opus pricier)
- Message complexity (longer = more tokens)
- Frequency of use

**Free tier limits:**
- Anthropic: $5 free credits (lasts ~2,500 messages with Sonnet)
- Pipedream: 100 workflow runs/month
- WhatsApp: 1,000 conversations/month free

---

### Can I use this on the free tier?

**Yes!** Free tier supports:
- ~90 messages/month (Pipedream limit: 100 runs)
- All 5 agents
- All features

**You'll pay for:**
- Claude API only ($0.18-2.10/month for light use)

**When to upgrade:**
- Pipedream: When you hit 100 runs/month ($20/month for 10,000)
- Anthropic: When you exhaust free credits (add payment method)

**Tip:** Start on free tier, upgrade only when needed.

---

### How do I track my costs?

**Claude API:**
1. Go to https://console.anthropic.com/
2. Click "Usage" in sidebar
3. View token usage and costs

**Pipedream:**
1. Go to workflow → Events
2. See execution count
3. Check if approaching 100/month limit

**In The Cockpit:**
- Check Pipedream logs (Step 7: Log Metrics)
- Estimated cost shown per message
- Track manually in spreadsheet

**Phase 2 feature:** Built-in cost dashboard.

---

## Features & Capabilities

### What agents are included?

**5 pre-configured agents:**

1. **Publicist** (@publicist)
   - PR & announcements
   - Product launches
   - Content creation

2. **Growth Hacker** (@growth)
   - Virality tactics
   - Algorithm optimization
   - Platform growth

3. **Strategist** (@strategist)
   - Business decisions
   - ROI analysis
   - Strategic planning

4. **Content Strategist** (@content)
   - Video scripts
   - Sponsorships
   - Content planning

5. **Credit Advisor** (@credit)
   - Credit optimization
   - Financial advice
   - Debt management

**Create custom agents:** See [CUSTOM_AGENTS.md](CUSTOM_AGENTS.md)

---

### Can I create my own agents?

**Yes!** Creating custom agents is a core feature.

**Time to create:** 15-30 minutes

**Process:**
1. Copy agent template
2. Define role, personality, expertise
3. Add to workflow configuration
4. Commit to GitHub
5. Test with `@youragent`

**Examples:**
- Real estate analyzer
- Fitness coach
- Email composer
- Code reviewer

**Full guide:** [CUSTOM_AGENTS.md](CUSTOM_AGENTS.md)

---

### Does it remember previous conversations?

**Phase 1 (current):** No, each message is independent.

**Phase 2 (coming soon):** Yes, memory across messages.

**Example without memory:**
```
You: @publicist PropIQ hit 100 users
Bot: [Creates announcement]

You: Make it more punchy
Bot: "What do you want me to make punchy?" ❌ Doesn't remember
```

**Example with memory (Phase 2):**
```
You: @publicist PropIQ hit 100 users
Bot: [Creates announcement]

You: Make it more punchy
Bot: [Revises announcement] ✅ Remembers context
```

**Workaround for now:** Include full context in each message.

---

### Can I send voice messages?

**Phase 1:** No, text only.

**Phase 2 (planned):** Yes, voice messages will be:
1. Transcribed (Whisper API)
2. Processed by Claude
3. Responded to via text

**Cost:** +$0.006 per minute of audio

**Timeline:** Week 4 of Phase 2 (see [ROADMAP.md](ROADMAP.md))

---

### Can I send images or documents?

**Phase 1:** No, text only.

**Phase 3 (planned):** Yes, send:
- Screenshots for feedback
- PDFs for analysis
- Images for Claude to analyze visually

**Use cases:**
- "Review this landing page design"
- "Analyze this dashboard screenshot"
- "What do you think of this ad creative?"

**Timeline:** Month 2-3 (see [ROADMAP.md](ROADMAP.md))

---

## Privacy & Security

### Is my data private?

**Yes.** Here's where your data goes:

**Your messages:**
- Sent to WhatsApp (end-to-end encrypted)
- Processed by Pipedream (encrypted in transit)
- Sent to Claude API (processed in real-time, not stored)

**Your agent configs:**
- Stored in your GitHub repo (you control)
- Fetched by workflow as needed

**Conversation history (Phase 2):**
- Stored in your chosen database (Supabase/Redis)
- You control retention period

**Third-party policies:**
- [Anthropic](https://www.anthropic.com/privacy): No training on your data
- [WhatsApp](https://www.whatsapp.com/privacy): End-to-end encryption
- [Pipedream](https://pipedream.com/privacy): SOC 2 compliant

---

### Can WhatsApp/Meta see my messages?

**No.** WhatsApp uses end-to-end encryption.

**What Meta can see:**
- Metadata (who sent message, when, to which number)
- Not message content

**What your workflow can see:**
- Full message content (that's how it works)

**Your data never goes to Meta's servers for processing.**

---

### What happens to my API keys?

**Stored in Pipedream environment variables:**
- Encrypted at rest
- Only accessible to your workflow
- Not visible in logs

**Never committed to GitHub:**
- `.gitignore` excludes `.env` files
- Environment variables stay in Pipedream

**Best practices:**
- Rotate keys periodically
- Use separate keys for testing vs production
- Revoke keys if compromised

---

## Troubleshooting

### The bot isn't responding at all

**Quick checklist:**
1. ✅ Webhook verified in Meta console?
2. ✅ Webhook subscribed to `messages`?
3. ✅ Your phone number added as test recipient?
4. ✅ Workflow deployed in Pipedream?
5. ✅ All environment variables set?

**Test:** Send "help" - if no response, start with [TROUBLESHOOTING.md](TROUBLESHOOTING.md#no-messages-received)

---

### Responses are slow (>10 seconds)

**Quick fixes:**
1. Switch to Haiku model (faster, cheaper):
   ```
   CLAUDE_MODEL=claude-haiku-4-5-20250929
   ```

2. Reduce max tokens:
   ```
   CLAUDE_MAX_TOKENS=2048
   ```

3. Make agent config files shorter (<10KB)

**Expected times:**
- Haiku: 2-3 seconds
- Sonnet: 3-5 seconds
- Opus: 6-10 seconds

---

### "Agent not found" error

**Fix:**
1. Make GitHub repo public, OR
2. Add GitHub token to environment variables

**Verify:**
```bash
# Try loading agent file directly:
https://raw.githubusercontent.com/[USERNAME]/[REPO]/main/agents/publicist.md

# Should show agent content, not 404
```

---

### My WhatsApp token expired

**Symptom:** Bot was working, now shows "Invalid token" error.

**Cause:** Temporary tokens expire after 24 hours.

**Solution:** Generate permanent token (one-time setup):
1. Go to Meta Business Settings
2. System Users → Add user
3. Generate token with WhatsApp permissions
4. Update `WHATSAPP_TOKEN` in Pipedream

**Full guide:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md#whatsapp-token-expired)

---

## Advanced Usage

### Can I use this for my team?

**Phase 1:** No, single-user only.

**Phase 4 (planned):** Yes, multi-user support with:
- Shared agents
- User-specific context
- Usage tracking per user
- Team workspace

**Workaround for now:**
- Share your WhatsApp test number with team
- Or set up separate instances per person

---

### Can agents work together?

**Phase 1:** No, one agent at a time.

**Phase 3 (planned):** Yes, agent collaboration:
```
@strategist @publicist work together on launch plan

→ Strategist analyzes strategy
→ Publicist creates messaging
→ Combined response
```

**Timeline:** Month 2-3 (see [ROADMAP.md](ROADMAP.md#33-agent-collaboration))

---

### Can I trigger agents programmatically?

**Phase 1:** No, WhatsApp only.

**Phase 4 (planned):** Yes, API access:
```javascript
POST /api/agents/publicist
{
  "message": "PropIQ hit 100 users",
  "user_id": "user123"
}
```

**Use cases:**
- GitHub commit → trigger publicist
- Stripe revenue → trigger strategist
- Daily analytics → trigger growth hacker

**Timeline:** Month 4+ (see [ROADMAP.md](ROADMAP.md#43-api-access))

---

### Can I integrate with other tools?

**Phase 1:** No built-in integrations.

**Phase 3-4 (planned):**
- Notion (save responses)
- Slack (use agents in Slack)
- Zapier (connect to 5,000+ apps)
- Custom webhooks

**Workaround for now:**
- Manually copy responses
- Or build custom integration via Pipedream steps

---

## Comparison Questions

### The Cockpit vs Custom GPTs?

| Feature | The Cockpit | Custom GPTs |
|---------|-------------|-------------|
| **Interface** | WhatsApp | ChatGPT web/app |
| **AI Model** | Claude (better for business writing) | GPT-4 |
| **Cost** | $0.18-6/month | $20/month (ChatGPT Plus required) |
| **Customization** | Full control (code-level) | Limited (instructions only) |
| **Mobile** | Excellent (WhatsApp) | Good (app) |
| **Privacy** | Your infrastructure | OpenAI's platform |

**Use The Cockpit if:** You prefer Claude, want WhatsApp access, or need full control.

**Use Custom GPTs if:** You already have ChatGPT Plus and don't want to set up infrastructure.

---

### The Cockpit vs Notion AI?

**Different use cases:**

**Notion AI:**
- Embedded in Notion workspace
- Good for: Writing in docs, Q&A about notes
- $10/user/month

**The Cockpit:**
- Accessible via WhatsApp anywhere
- Good for: On-the-go assistance, specialized agents
- $0.18-6/month

**They complement each other:**
- Use Notion AI when working in Notion
- Use The Cockpit when mobile/outside Notion

---

## Contributing & Community

### Can I contribute to The Cockpit?

**Yes! Contributions welcome.**

**Ways to contribute:**
1. **Create custom agents** - Share in the repo
2. **Improve documentation** - Fix typos, add examples
3. **Report bugs** - Open GitHub issues
4. **Suggest features** - Open discussions
5. **Code contributions** - Submit PRs

**Great first contributions:**
- Add a new agent
- Improve error messages
- Write a blog post/tutorial
- Create video walkthrough

---

### How do I share my custom agent?

**Option 1: Pull Request**
1. Fork the repo
2. Add your agent to `agents/`
3. Update agent map in workflow
4. Submit PR

**Option 2: Separate Repo**
1. Create your own repo
2. Share link in Discussions
3. Others can copy your agent

**Option 3: Gist/Blog Post**
- Write about your agent
- Share agent .md file
- Link back to The Cockpit

---

### Where can I get help?

**Resources (in order):**
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Most common issues
2. [FAQ.md](FAQ.md) - This file
3. [GitHub Discussions](https://github.com/briandusape/the-cockpit/discussions) - Community help
4. [GitHub Issues](https://github.com/briandusape/the-cockpit/issues) - Bug reports

**Before asking:**
- ✅ Check troubleshooting guide
- ✅ Search existing issues/discussions
- ✅ Review your Pipedream logs

**When asking:**
- Include error messages
- Share relevant logs
- Describe what you tried

---

## Roadmap & Future

### What's coming next?

**Phase 2 (Week 3-6):**
- Conversation memory
- Voice message support
- Quick reply buttons
- Rich formatting

**Phase 3 (Month 2-3):**
- Knowledge base integration
- Agent collaboration
- Image support
- Performance optimizations

**Full roadmap:** [ROADMAP.md](ROADMAP.md)

---

### Can I request features?

**Yes!** Feature requests are welcome.

**How to request:**
1. Check [ROADMAP.md](ROADMAP.md) - may already be planned
2. Search existing issues - may already be requested
3. Open new issue with template
4. Explain use case and value

**What helps:**
- Clear use case description
- Examples of how you'd use it
- Willingness to test/provide feedback

---

### Will this always be free/open source?

**Current plan:** Yes, The Cockpit will remain open source.

**Possible future:**
- Core platform: Free, open source
- Hosted version: Paid option (no setup required)
- Premium features: Optional paid add-ons

**Commitment:**
- Core functionality always free
- Self-hosting always possible
- No forced upgrades

---

## Still Have Questions?

### Not answered here?

1. **Search GitHub Issues:** https://github.com/briandusape/the-cockpit/issues
2. **Ask in Discussions:** https://github.com/briandusape/the-cockpit/discussions
3. **Open new issue:** With the question

### Want to improve this FAQ?

PRs welcome! Add your question + answer.

---

**Last Updated:** 2025-11-09
**Version:** 1.0.0
