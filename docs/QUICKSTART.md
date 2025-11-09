# The Cockpit - Quick Start

**Get up and running in under 2 hours**

---

## What You're Building

A WhatsApp bot that gives you instant access to 5 AI agents:
- Publicist (announcements & PR)
- Growth Hacker (virality & algorithms)
- Strategist (big decisions)
- Content Strategist (video scripts)
- Credit Advisor (financial advice)

**Cost:** $0.18-6/month (vs Motion's $29-600/month)

---

## Prerequisites

- [ ] WhatsApp on your phone
- [ ] 2 hours of time
- [ ] Credit card for Anthropic (optional, $5 free credits)

---

## 5-Step Setup

### Step 1: Get Claude API Key (10 min)

1. Go to https://console.anthropic.com/
2. Sign up → Get API key
3. Copy key (starts with `sk-ant-api03-`)

**Done!** ✅

---

### Step 2: WhatsApp Business Setup (30 min)

1. Go to https://developers.facebook.com/
2. Create app → Add WhatsApp
3. Get test phone number
4. Add your personal number as recipient
5. Note down:
   - Phone Number ID
   - Access Token

**Done!** ✅

---

### Step 3: Set Up Pipedream (15 min)

1. Go to https://pipedream.com/
2. Sign up (free)
3. Create new project: "The Cockpit"
4. Create workflow: "Cockpit WhatsApp Handler"

**Done!** ✅

---

### Step 4: Deploy Workflow (45 min)

Follow these sub-steps:

1. **Add HTTP webhook trigger**
   - Copy webhook URL

2. **Configure Meta webhook**
   - Paste Pipedream URL
   - Set verify token
   - Subscribe to `messages`

3. **Add environment variables** in Pipedream:
   ```
   CLAUDE_API_KEY=your-key
   WHATSAPP_TOKEN=your-token
   WHATSAPP_PHONE_NUMBER_ID=your-id
   GITHUB_USERNAME=briandusape
   GITHUB_REPO=the-cockpit
   ```

4. **Copy workflow steps** from [SETUP_GUIDE.md](SETUP_GUIDE.md)
   - Verification step
   - Parse message step
   - Load agent step
   - Claude API step
   - Send response step

5. **Deploy**

**Done!** ✅

---

### Step 5: Test It (10 min)

1. Open WhatsApp
2. Message your test number: `@publicist`
3. See agent respond!
4. Try: `@publicist PropIQ hit 100 users!`
5. Get announcement content back

**Done!** ✅

---

## You're Live!

Text your agents:
- `@publicist` - PR & announcements
- `@growth` - Virality tactics
- `@strategist` - Big decisions
- `@content` - Video scripts
- `@credit` - Financial advice

---

## Next Steps

**Week 1:**
- Use your agents daily
- See what works

**Week 2:**
- Add conversation memory (see SETUP_GUIDE.md)
- Customize agent instructions

**Week 3:**
- Create custom agents for your needs
- Share with team members

---

## Need Help?

**Stuck?** Check:
1. [Full Setup Guide](SETUP_GUIDE.md) - Detailed instructions
2. [Troubleshooting](TROUBLESHOOTING.md) - Common issues
3. [Architecture](ARCHITECTURE.md) - How it works
4. GitHub Issues - Ask questions

---

## Cost Breakdown

**Your first month (free tier):**
- Anthropic: $5 free credits = ~2,500 messages free
- Pipedream: 100 runs/month free
- WhatsApp: Free test number
- **Total: $0**

**After free credits (100 messages/month):**
- Claude API: $0.18-2.10/month
- Pipedream: $0 (free tier)
- WhatsApp: $0 (under 1,000 conversations)
- **Total: $0.18-2.10/month**

**You save 90-99% vs Motion!**

---

## Example Conversations

```
You: @publicist

Bot: Publicist agent activated 📣 How can I help with announcements?

You: PropIQ Chrome extension just launched!

Bot: Congrats! Let me create launch content...
     [Twitter thread]
     [LinkedIn post]
     [Product Hunt description]
     Ready to post! 🚀
```

```
You: @strategist

Bot: Strategist activated 🧠 What decision are we making?

You: Should I focus on PropIQ or pivot to content creation?

Bot: Let me analyze both paths...
     [Detailed analysis]
     [Recommendation]
     [90-day action plan]
```

---

**Ready? Let's build! Start with Step 1.**

---

**Questions?** Open an issue on GitHub or check the full [SETUP_GUIDE.md](SETUP_GUIDE.md).
