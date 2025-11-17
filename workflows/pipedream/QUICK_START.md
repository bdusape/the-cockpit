# Pipedream Quick Start - 15 Minute Deploy

**Ultra-fast deployment guide for The Cockpit**

---

## ⚡ Prerequisites (Have These Ready)

- [ ] WhatsApp Business API credentials
- [ ] Claude API key
- [ ] Pipedream account (free at pipedream.com)
- [ ] 15 minutes

---

## 🚀 Deployment Steps

### 1. Create Workflow (2 min)

1. Go to https://pipedream.com/new
2. Select **"HTTP / Webhook"** trigger
3. Copy the webhook URL → Save for later

### 2. Add Environment Variables (3 min)

Click ⚙️ Settings → Environment Variables → Add these:

```bash
CLAUDE_API_KEY=sk-ant-api03-your-key-here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_MAX_TOKENS=4096
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_API_VERSION=v17.0
WHATSAPP_VERIFY_TOKEN=create-random-secure-string
AUTHORIZED_USERS=your-phone-number-without-plus
GITHUB_USERNAME=bdusape
GITHUB_REPO=the-cockpit
GITHUB_BRANCH=main
```

### 3. Add Workflow Steps (8 min)

Click **"+ Add Step"** → **"Run Node.js code"** for each:

1. **Parse WhatsApp Webhook**
2. **Authorization Check**
3. **Parse Agent Trigger**
4. **Fetch Agent Configuration**
5. **Call Claude API**
6. **Send WhatsApp Response**
7. **Log Metrics**

**Copy code from:** `workflows/pipedream/DEPLOYMENT_GUIDE.md`

### 4. Configure WhatsApp (2 min)

1. Go to https://developers.facebook.com/apps/
2. WhatsApp → Configuration → Webhook
3. Paste Pipedream URL + verify token
4. Subscribe to `messages` field

---

## ✅ Test

Send to your WhatsApp Business number:

```
@publicist PropIQ launched!
```

**Expected:** Bot responds in 10-30 seconds with announcement content

---

## 📊 Monitor

Check Pipedream → Executions tab:
- ✅ Success = Green
- ❌ Failure = Red (click for details)

Check Step 8 metrics for costs:
```json
{
  "tokens_total": 1523,
  "cost_total_usd": 0.0273
}
```

---

## 🆘 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| No response | Check webhook URL in WhatsApp config |
| "Unauthorized" | Add your phone number to AUTHORIZED_USERS |
| Claude error | Verify CLAUDE_API_KEY is valid |
| 404 on GitHub | Push agents to main branch |

---

**Full Guide:** See `DEPLOYMENT_GUIDE.md`
**Testing:** See `../../docs/TEST_EXECUTION_GUIDE.md`

---

**Done!** 🎉 Your WhatsApp AI agents are live.
