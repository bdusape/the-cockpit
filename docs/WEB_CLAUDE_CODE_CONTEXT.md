# The Cockpit - Context for Web Claude Code

**Last Updated:** 2025-11-09
**Repository:** https://github.com/bdusape/the-cockpit

---

## Project Overview

The Cockpit is a WhatsApp-based AI agent platform that provides mobile access to specialized AI agents. It's a Motion-style agent platform at 1/100th the cost ($0.18-6/month vs $29-600/month).

---

## What's Been Built

### ✅ Complete MVP Foundation

**Core Components:**
- 5 pre-configured AI agents with full system prompts
- Complete documentation (README, Architecture, Setup Guide, Quick Start)
- GitHub repository initialized and published
- Pipedream workflow templates
- Environment configuration templates

**Agents Available:**
1. **Publicist** (`@publicist`) - Announcements, PR, content creation
2. **Growth Hacker** (`@growth`) - Algorithm optimization, virality tactics
3. **Strategist** (`@strategist`) - Strategic decisions, pivots, focus
4. **Content Strategist** (`@content`) - Video scripts, sponsorships
5. **Credit Advisor** (`@credit`) - Financial advice, credit optimization

**Documentation:**
- `README.md` - Comprehensive project overview with examples
- `docs/ARCHITECTURE.md` - Technical architecture and data flow
- `docs/SETUP_GUIDE.md` - Complete step-by-step setup (2-6 hours)
- `docs/QUICKSTART.md` - Fast setup guide (<2 hours)
- `workflows/pipedream/README.md` - Workflow-specific docs

**Configuration:**
- `config/.env.example` - All environment variables documented
- `agents/_template.md` - Template for creating custom agents
- `.gitignore` - Properly configured for secrets
- `LICENSE` - MIT License

---

## Current Status

**Phase:** MVP Ready - Not Yet Deployed
**Repository:** https://github.com/bdusape/the-cockpit
**Branch:** main

**What Works:**
- ✅ Repository structure complete
- ✅ All documentation written
- ✅ Agent configurations ready
- ✅ Workflow code examples provided
- ✅ GitHub published and accessible

**What's Needed:**
- ⏳ Deploy Pipedream workflow
- ⏳ Configure WhatsApp Business API
- ⏳ Set up webhook connection
- ⏳ Test end-to-end flow
- ⏳ Add conversation memory (Phase 2)

---

## How to Work on This Project

### For Web Claude Code Users

When working with this repo in Web Claude Code, you should:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bdusape/the-cockpit.git
   cd the-cockpit
   ```

2. **Understand the structure:**
   - `agents/` - Agent system prompts (modify these to customize agents)
   - `workflows/` - Automation platform code
   - `docs/` - All documentation
   - `config/` - Environment variables

3. **Common tasks:**
   - **Customize an agent:** Edit files in `agents/`
   - **Add a new agent:** Copy `agents/_template.md`, fill it out
   - **Update documentation:** Edit files in `docs/`
   - **Modify workflow:** Update code in `workflows/pipedream/`

4. **Always read these first:**
   - `README.md` - Project overview
   - `docs/ARCHITECTURE.md` - How it works
   - `docs/SETUP_GUIDE.md` - Deployment instructions

---

## Next Steps (Deployment)

### Phase 1: Basic Deployment (This Week)

**Goal:** Get WhatsApp bot responding to messages

**Tasks:**
1. **Set up Claude API** (10 min)
   - Get API key from console.anthropic.com
   - Copy to environment variables

2. **Set up WhatsApp Business** (30 min)
   - Create Meta developer app
   - Get test phone number
   - Get access token and phone number ID

3. **Deploy Pipedream workflow** (45 min)
   - Create Pipedream account
   - Set up webhook trigger
   - Add workflow steps from `docs/SETUP_GUIDE.md`
   - Configure environment variables

4. **Test end-to-end** (15 min)
   - Send `@publicist` via WhatsApp
   - Verify agent responds
   - Test all 5 agents

**Deliverable:** Working WhatsApp bot with 5 agents

---

### Phase 2: Enhanced Features (Week 2-3)

**Goal:** Add conversation memory and advanced features

**Tasks:**
1. Add conversation memory (stores context between messages)
2. Implement voice message support
3. Add quick reply buttons
4. Integrate with knowledge base
5. Set up monitoring/analytics

**Deliverable:** Production-ready agent platform

---

### Phase 3: Advanced (Month 2+)

**Goal:** Scale and enhance

**Tasks:**
1. Web dashboard for conversation history
2. Team member access (multi-user)
3. Agent collaboration (chain multiple agents)
4. Scheduled tasks
5. Custom integrations

**Deliverable:** Full-featured agent platform

---

## Architecture Summary

```
User (WhatsApp)
    ↓
WhatsApp Business API
    ↓
Pipedream Workflow
    ├─ Parse message (@publicist, query)
    ├─ Load agent config from GitHub
    ├─ Build prompt with agent instructions
    ├─ Call Claude API
    └─ Send response back to WhatsApp
    ↓
User receives AI-generated response
```

**Key Files in Workflow:**
- Agent instructions: Fetched from `agents/*.md` on GitHub
- Environment variables: Stored in Pipedream
- Conversation memory: Pipedream data store (Phase 2)

---

## Working with Agents

### Agent File Structure

Each agent has:
1. **Role definition** - What the agent does
2. **Personality traits** - How it communicates
3. **Responsibilities** - Specific tasks it handles
4. **Knowledge base** - Domain expertise
5. **Output format** - How it delivers results
6. **Constraints** - What it never/always does
7. **Example interactions** - Reference conversations

### Customizing Agents

**To modify an agent:**
1. Edit the corresponding file in `agents/`
2. Update context section with current business info
3. Add/remove responsibilities as needed
4. Commit and push to GitHub
5. Agent loads new config on next message (no redeployment needed!)

**To create a new agent:**
1. Copy `agents/_template.md` to `agents/your-agent-name.md`
2. Fill out all sections
3. Add trigger mapping in Pipedream workflow
4. Test with `@youragent`

---

## Cost Optimization

**Current Configuration (Sonnet 4.5):**
- Light use (30 msgs/month): $0.63/month
- Medium use (100 msgs/month): $2.10/month
- Heavy use (300 msgs/month): $6.30/month

**To Reduce Costs:**
1. Use Haiku model for simple queries ($0.18/month for 100 msgs)
2. Implement prompt caching (90% savings on repeated system prompts)
3. Set lower max_tokens for concise responses
4. Add response length hints in agent instructions

**To Scale:**
- Free tier handles ~3 conversations/day
- Upgrade to Pipedream paid ($20/month) for 300+ messages/month
- Redis or Supabase for conversation memory at scale

---

## Technical Details

### Environment Variables Needed

```bash
CLAUDE_API_KEY=sk-ant-api03-...
WHATSAPP_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=your-random-secure-token
GITHUB_USERNAME=bdusape
GITHUB_REPO=the-cockpit
```

### Agent Trigger Mapping

```javascript
const agentMap = {
  'publicist': 'agents/publicist.md',
  'growth': 'agents/growth-hacker.md',
  'strategist': 'agents/strategist.md',
  'content': 'agents/content-strategist.md',
  'credit': 'agents/credit-advisor.md'
};
```

### Claude API Configuration

```javascript
{
  model: "claude-sonnet-4-5-20250929",  // Recommended
  max_tokens: 4096,
  temperature: 0.7,
  system: "[Agent instructions from GitHub]",
  messages: [
    { role: "user", content: "[User query]" }
  ]
}
```

---

## Common Tasks for Web Claude Code

### Task 1: Update Agent Context

**Example: Update Publicist with new product launch**

1. Open `agents/publicist.md`
2. Find "Current Context" section
3. Update:
   ```markdown
   **Upcoming Announcements:**
   - The Cockpit launch (this week!)
   - PropIQ milestone updates
   ```
4. Commit and push

### Task 2: Add New Agent

**Example: Create "Developer Agent"**

1. Copy template: `cp agents/_template.md agents/developer.md`
2. Edit `agents/developer.md`:
   - Role: Technical implementation partner
   - Responsibilities: Code features, debug, optimize
   - Personality: Technical, precise, solution-oriented
3. Update Pipedream workflow `agentMap`:
   ```javascript
   'dev': 'agents/developer.md'
   ```
4. Test: `@dev help me optimize this SQL query`

### Task 3: Customize Output Format

**Example: Make Publicist more concise**

1. Open `agents/publicist.md`
2. In "Output Format" section, add:
   ```markdown
   **Length constraints:**
   - Twitter threads: Max 5 tweets
   - LinkedIn posts: Max 200 words
   - Keep responses under 500 words total
   ```
3. In "Constraints" section:
   ```markdown
   **Always:**
   - Be concise (under 500 words)
   - Use bullet points over paragraphs
   ```

### Task 4: Add Domain Knowledge

**Example: Add PropIQ context to all agents**

1. Create `agents/_shared_context.md`:
   ```markdown
   # Shared Context for All Agents

   **Current Products:**
   - PropIQ: AI real estate analysis
   - The Cockpit: WhatsApp AI agents

   **Recent Wins:**
   - PropIQ Chrome extension launched
   - The Cockpit MVP completed
   ```

2. Reference in agent files:
   ```markdown
   ## Context
   See `_shared_context.md` for current business state.

   [Agent-specific context here]
   ```

---

## Troubleshooting for Web Claude Code Users

### Issue: Agent not loading

**Symptoms:** "Agent not found" error in WhatsApp

**Fix:**
1. Check GitHub repo is public
2. Verify filename in `agents/` matches `agentMap`
3. Ensure no typos in agent trigger
4. Check Pipedream logs for fetch errors

### Issue: Response too long/short

**Symptoms:** Agent gives essays or one-liners

**Fix:**
1. Open agent .md file
2. Update `max_tokens` in Pipedream workflow
3. Add length constraints in agent "Output Format" section
4. Test and iterate

### Issue: Agent doesn't have context

**Symptoms:** Generic responses, doesn't know about your business

**Fix:**
1. Open agent .md file
2. Find "Current Context" section
3. Update with your current:
   - Products and features
   - Metrics and milestones
   - Target audience
   - Recent wins/challenges
4. Commit and push

---

## Resources

**Documentation:**
- [README.md](../README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Deployment steps
- [QUICKSTART.md](QUICKSTART.md) - Fast setup

**External Links:**
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Pipedream Docs](https://pipedream.com/docs/)

**Repository:**
- GitHub: https://github.com/bdusape/the-cockpit
- Issues: https://github.com/bdusape/the-cockpit/issues

---

## What Web Claude Code Should Know

When working on this project, Claude Code should:

1. **Always read agent files** before modifying
2. **Maintain agent personality** when updating
3. **Keep documentation in sync** with code changes
4. **Test agent changes** with example queries
5. **Preserve environment variable security** (never commit secrets)
6. **Follow the architecture** outlined in docs
7. **Update this context file** when major changes occur

---

## Success Metrics

**MVP Success:**
- [ ] All 5 agents respond correctly
- [ ] Response time < 5 seconds
- [ ] Cost < $3/month for 100 messages
- [ ] No errors in Pipedream logs

**Production Success:**
- [ ] Conversation memory working
- [ ] Voice messages supported
- [ ] Using daily for business decisions
- [ ] Created 2+ custom agents
- [ ] Shared with team members

---

## Project Vision

**Short-term (1 month):**
Build a working WhatsApp AI agent platform for personal use, replacing the need for multiple ChatGPT conversations.

**Medium-term (3 months):**
Expand to team usage, add advanced features like agent collaboration and scheduled tasks.

**Long-term (6+ months):**
Open-source agent marketplace, pre-built workflows for common founder tasks, potentially monetize as SaaS.

---

**This document is your starting point for working on The Cockpit in Web Claude Code. Always refer back to it when you need context.**

**Questions?** Check the docs/ folder or open an issue on GitHub.

---

**Happy building!** 🚀
