# The Cockpit - 1-Hour Deployment Checklist

**Print this page or keep it on screen while deploying.**

---

## 📝 Before You Start

Gather these credentials as you go (use notes app):

```
☐ Claude API Key: sk-ant-api03-_________________
☐ WhatsApp Phone Number ID: _____________________
☐ WhatsApp Access Token: EAAG____________________
☐ Verify Token (make one up): ___________________
☐ Pipedream Webhook URL: https://________________
```

---

## ⏱️ Part 1: Get API Keys (10 min)

### Anthropic (Claude)
- ☐ Go to https://console.anthropic.com/
- ☐ Sign up / Log in
- ☐ Click "API Keys" → "Create Key"
- ☐ Name: "cockpit"
- ☐ **COPY KEY** → Save to notes above ⬆️
- ☐ Verify it starts with `sk-ant-api03-`

---

## ⏱️ Part 2: WhatsApp Setup (20 min)

### Meta Developer Account
- ☐ Go to https://developers.facebook.com/
- ☐ Click "Get Started"
- ☐ Log in with Facebook
- ☐ Accept developer terms

### Create App
- ☐ "My Apps" → "Create App"
- ☐ Type: "Business"
- ☐ Name: "The Cockpit"
- ☐ Email: your email
- ☐ Click "Create App"

### Add WhatsApp
- ☐ Find "WhatsApp" product
- ☐ Click "Set Up"
- ☐ Complete setup wizard

### Get Test Number & Credentials
- ☐ Go to WhatsApp → "API Setup"
- ☐ Note the test phone number shown
- ☐ Click "Add phone number" under "To"
- ☐ Enter YOUR WhatsApp number
- ☐ Get verification code on your phone
- ☐ Enter code to verify

### Copy These Now!
- ☐ Copy **Phone Number ID** → Save to notes ⬆️
- ☐ Copy **Access Token** → Save to notes ⬆️
- ☐ Make up a **Verify Token** → Save to notes ⬆️
  - Example: `cockpit-verify-12345`

---

## ⏱️ Part 3: Pipedream Setup (5 min)

### Create Account
- ☐ Go to https://pipedream.com/
- ☐ Sign up (use GitHub for speed)

### Create Workflow
- ☐ Click "New Workflow"
- ☐ Name: "Cockpit WhatsApp Handler"
- ☐ Click "Create"

### Add Webhook Trigger
- ☐ Search "HTTP"
- ☐ Select "HTTP / Webhook" → "HTTP API"
- ☐ Click "Create Source"
- ☐ **COPY WEBHOOK URL** → Save to notes ⬆️

---

## ⏱️ Part 4: Environment Variables (5 min)

### In Pipedream
- ☐ Click "Settings" tab
- ☐ Scroll to "Environment Variables"
- ☐ Add each variable (copy from your notes):

```
☐ CLAUDE_API_KEY = sk-ant-api03-...
☐ WHATSAPP_TOKEN = EAAG...
☐ WHATSAPP_PHONE_NUMBER_ID = 123456789...
☐ WHATSAPP_VERIFY_TOKEN = cockpit-verify-12345
☐ GITHUB_USERNAME = bdusape
☐ GITHUB_REPO = the-cockpit
☐ GITHUB_BRANCH = claude/cockpit-mvp-first-011CUxfn4dNRWytmwZsDTw1o
```

**Double-check:** No extra spaces, no quotes

---

## ⏱️ Part 5: Add Workflow Steps (10 min)

**For each step:** Click "+ Add Step" → "Run custom code" → Copy file → Paste → Name it

- ☐ **Step 1**: `01-verify-webhook.js` → Name: `verify_webhook`
- ☐ **Step 2**: `02-parse-message.js` → Name: `parse_message`
- ☐ **Step 3**: `03-handle-special-commands.js` → Name: `handle_special_commands`
- ☐ **Step 4**: `04-load-agent-config.js` → Name: `load_agent_config`
- ☐ **Step 5**: `05-call-claude-api.js` → Name: `call_claude_api`
- ☐ **Step 6**: `06-send-whatsapp-response.js` → Name: `send_whatsapp_response`
- ☐ **Step 7**: `07-log-metrics.js` → Name: `log_metrics`

**Files location:** `workflows/pipedream/steps/`

---

## ⏱️ Part 6: Deploy (2 min)

- ☐ Click "Deploy" (blue button, top right)
- ☐ Wait for "Deployed" status (green ✓)

---

## ⏱️ Part 7: Configure Webhook (3 min)

### In Meta Developer Console

- ☐ Go to WhatsApp → Configuration → Webhook
- ☐ Click "Edit"
- ☐ Enter:
  - **Callback URL**: Your Pipedream webhook URL (from notes ⬆️)
  - **Verify Token**: Your verify token (from notes ⬆️)
- ☐ Click "Verify and Save"
- ☐ Should see green checkmark ✅

### Subscribe to Messages

- ☐ Scroll down to "Webhook fields"
- ☐ Click "Manage"
- ☐ Check ✅ **messages**
- ☐ Click "Done"

---

## ⏱️ Part 8: TEST! (5 min)

### Test on Your Phone

Open WhatsApp, message the test number:

**Test 1: Help**
```
help
```
- ☐ Bot responds with agent list

**Test 2: Publicist**
```
@publicist
```
- ☐ "Publicist agent activated 📣"

**Test 3: Real Query**
```
@publicist Test message
```
- ☐ AI-generated response received

**Test 4: Other Agents**
```
@growth
@strategist
@content
@credit
```
- ☐ Each agent responds

---

## ✅ Success Checklist

If all these are true, you're done! 🎉

- ☐ Bot responds to "help" command
- ☐ All 5 agents respond when triggered
- ☐ Responses are AI-generated (not errors)
- ☐ Response time is 3-5 seconds
- ☐ You can switch between agents
- ☐ No errors in Pipedream logs

---

## 🚨 Quick Troubleshooting

### No response at all?

1. ☐ Check Pipedream → Events (any executions?)
2. ☐ Meta console → Webhook subscribed to "messages"?
3. ☐ Your phone number added as test recipient?
4. ☐ Workflow deployed (not draft)?

### "Agent not found" error?

- ☐ Check `GITHUB_BRANCH` variable is set correctly
- ☐ GitHub repo is public (or add token)

### Claude API error?

- ☐ Check `CLAUDE_API_KEY` in Anthropic console
- ☐ Verify you have credits remaining

### WhatsApp error?

- ☐ Check `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`
- ☐ No extra spaces in variables

---

## 📞 Need Help?

**During setup:**
- Read: `QUICKSTART_1_HOUR.md` (detailed steps)

**After setup:**
- Troubleshooting: `docs/TROUBLESHOOTING.md`
- FAQ: `docs/FAQ.md`

**Still stuck:**
- GitHub Issues: https://github.com/bdusape/the-cockpit/issues

---

## 🎯 Total Time

- Anthropic: 10 min
- WhatsApp: 20 min
- Pipedream: 5 min
- Variables: 5 min
- Steps: 10 min
- Deploy: 5 min
- Test: 5 min

**Total: 60 minutes** ⏰

---

## 🎊 You Did It!

**What you built:**
- WhatsApp AI bot with 5 specialized agents
- Accessible from any phone, anywhere
- Costs $0.18-2/month (vs Motion's $29-600/month)

**Next:**
- Create custom agents (15 min)
- Read roadmap for Phase 2 features
- Share your experience!

---

**Print this page and check off items as you go!** ✓

---

**Created:** 2025-11-09
