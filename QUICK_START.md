# The Cockpit - Quick Start Guide

**Get your AI agent platform running in 2-4 hours.**

---

## 🎯 What You're Building

A WhatsApp bot with 5 specialized AI agents:
- 📣 **@publicist** - PR and content creation
- 📈 **@growth** - Growth hacking and virality
- 🧠 **@strategist** - Business strategy and decisions
- 🎬 **@content** - Video scripts and content
- 💳 **@credit** - Financial and credit advice

**Cost:** $0.18-$6/month (vs Motion's $29-$600/month)

---

## 📋 Prerequisites

Before you start:
- [ ] WhatsApp account
- [ ] Facebook/Meta account
- [ ] 2-4 hours of focused time

---

## 🚀 Deployment in 5 Steps

### **Step 1: Get Claude API Key** (10 min)

1. Go to https://console.anthropic.com/
2. Sign up → Create API key
3. Copy key (starts with `sk-ant-api03-`)
4. Save it securely

**Note:** New accounts get $5 free credits

---

### **Step 2: Set Up WhatsApp Business** (30-45 min)

1. Go to https://developers.facebook.com/
2. Create app → Add WhatsApp product
3. Get test phone number
4. Verify your personal WhatsApp number as recipient
5. Copy:
   - **Phone Number ID**
   - **Access Token** (permanent token recommended)

**Detailed instructions:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#step-2-set-up-whatsapp-business-api)

---

### **Step 3: Create Pipedream Workflow** (15 min)

1. Go to https://pipedream.com/ → Sign up
2. Create new workflow: `Cockpit WhatsApp Handler`
3. Add HTTP webhook trigger
4. Copy webhook URL

**Free tier:** 100 workflow executions/month

---

### **Step 4: Build the Workflow** (60-90 min)

#### 4.1 Set Environment Variables

In Pipedream → Settings → Environment Variables:

```
CLAUDE_API_KEY = sk-ant-api03-your-key
WHATSAPP_TOKEN = EAAG...your-token
WHATSAPP_PHONE_NUMBER_ID = 123456789012345
WHATSAPP_VERIFY_TOKEN = random-string-here
GITHUB_USERNAME = briandusape
GITHUB_REPO = the-cockpit
GITHUB_BRANCH = main
```

#### 4.2 Add Workflow Steps

Add 8 steps to your workflow (click + after trigger):

1. **verify_webhook** → Copy from `workflows/pipedream/steps/1-verify-webhook.js`
2. **parse_message** → Copy from `workflows/pipedream/steps/2-parse-message.js`
3. **get_memory** → Copy from `workflows/pipedream/steps/3-get-conversation-memory.js`
4. **load_agent** → Copy from `workflows/pipedream/steps/4-load-agent.js`
5. **call_claude** → Copy from `workflows/pipedream/steps/5-call-claude.js`
6. **update_memory** → Copy from `workflows/pipedream/steps/6-update-memory.js`
7. **send_whatsapp** → Copy from `workflows/pipedream/steps/7-send-whatsapp.js`
8. **log_metrics** → Copy from `workflows/pipedream/steps/8-log-metrics.js`

For each step:
- Click "+" → Select "Node.js"
- Name it (e.g., `verify_webhook`)
- Paste the code
- Click "Test"

#### 4.3 Deploy

Click **Deploy** (top right)

---

### **Step 5: Connect & Test** (15 min)

#### 5.1 Connect Webhook

1. In Meta Developer Console → WhatsApp → Configuration
2. Edit Webhook:
   - Callback URL: Your Pipedream webhook URL
   - Verify Token: Same as in environment variables
3. Click "Verify and Save"
4. Subscribe to `messages` event

#### 5.2 Test

**Open WhatsApp, message the test number:**

Send: `help`

**Expected:** List of available agents

Send: `@publicist`

**Expected:** Publicist greeting

Send: `PropIQ hit 100 users!`

**Expected:** Announcement content created

**✅ Success!** Your AI agent platform is live.

---

## 📖 Full Documentation

- **Deployment Guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Step-by-step with screenshots
- **Testing Checklist:** [docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md) - Verify everything works
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - How it works
- **Setup Guide:** [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) - Original detailed guide

---

## 🐛 Troubleshooting

**No response from bot?**
- Check Pipedream → Events for errors
- Verify webhook is subscribed to `messages`
- Confirm all environment variables are set

**Webhook verification fails?**
- Verify token must match exactly
- Workflow must be deployed first
- Check step 1 code is correct

**Agent not found?**
- Ensure GitHub repo is public
- Check branch name is correct (`main`)
- Verify agent files exist in `agents/` folder

**More help:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 🎯 Next Steps

**Week 1: Dogfood It**
- Use daily for real work (5+ days)
- Test all 5 agents
- Document what works/doesn't

**Week 2-3: Add Features**
- Agent collaboration
- Voice message support
- Quick actions

**Month 2: Beta Launch**
- Invite 10-20 users
- Collect feedback
- Add team access

**Month 3: Monetize**
- Define pricing ($9-99/month)
- Integrate Stripe
- Launch publicly

---

## 💡 Example Conversations

**Business Strategy:**
```
You: @strategist Should I focus on PropIQ or pivot to content?
Bot: [Detailed strategic analysis with ROI comparison]
```

**PR Announcement:**
```
You: @publicist PropIQ hit 500 users!
Bot: [Twitter thread + LinkedIn post + email template]
```

**Growth Tactics:**
```
You: @growth My LinkedIn posts get <100 views
Bot: [Algorithm insights + optimization recommendations]
```

---

## 💰 Expected Costs

**Your setup (first month):**
- Pipedream: $0 (free tier)
- WhatsApp: $0 (test number)
- Claude: $0.18-$2.10 (with $5 free credits)

**Total: $0-2.10/month** 🎉

**vs Motion: $29-600/month** (you save 95%+)

---

## 🆘 Need Help?

- **Docs:** Start with [DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Issues:** [GitHub Issues](https://github.com/briandusape/the-cockpit/issues)
- **Questions:** [GitHub Discussions](https://github.com/briandusape/the-cockpit/discussions)

---

**Ready to build? Start with Step 1! 🚀**
