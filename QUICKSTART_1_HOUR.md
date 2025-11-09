# The Cockpit - 1 Hour Quick Deploy

**Goal:** Get your WhatsApp AI bot working on your phone in 60 minutes.

**What you'll have:** Working bot with all 5 agents, testable from your phone.

---

## ⏱️ Time Budget

- ✅ **10 min** - Get Claude API key
- ✅ **20 min** - WhatsApp Business setup
- ✅ **5 min** - Create Pipedream workflow
- ✅ **15 min** - Add workflow steps
- ✅ **5 min** - Deploy and test
- ⏰ **5 min** - Buffer for issues

**Total: 60 minutes**

---

## 📋 Prerequisites

Open these in browser tabs NOW (you'll need them):

1. **Anthropic Console**: https://console.anthropic.com/
2. **Meta Developers**: https://developers.facebook.com/
3. **Pipedream**: https://pipedream.com/
4. **This repo on GitHub**: https://github.com/bdusape/the-cockpit

---

## Step 1: Get Claude API Key (10 min) ⏰

### 1.1 Create Anthropic Account
1. Go to https://console.anthropic.com/
2. Click "Sign Up" (use Google for speed)
3. Verify email (check inbox)

### 1.2 Get API Key
1. Click "API Keys" in sidebar
2. Click "Create Key"
3. Name: "cockpit"
4. **COPY THE KEY** → Paste in a note (you can't view it again!)
5. Key starts with: `sk-ant-api03-...`

✅ **Success check:** You have an API key saved

---

## Step 2: WhatsApp Business API (20 min) ⏰

### 2.1 Create Meta Developer Account (5 min)
1. Go to https://developers.facebook.com/
2. Click "Get Started"
3. Log in with Facebook (or create account)
4. Complete developer registration (accept terms)

### 2.2 Create App (3 min)
1. Click "My Apps" → "Create App"
2. Select "Business" as type
3. Fill in:
   - **App Name**: "The Cockpit"
   - **Email**: Your email
4. Click "Create App"

### 2.3 Add WhatsApp (2 min)
1. In app dashboard, find "WhatsApp"
2. Click "Set Up"
3. Follow wizard to add WhatsApp product

### 2.4 Get Test Phone Number (5 min)
1. In WhatsApp → "API Setup"
2. You'll see a test phone number provided by Meta
3. Under "To", click "Add phone number"
4. Enter YOUR personal WhatsApp number (your actual phone)
5. Check WhatsApp on your phone for verification code
6. Enter code

### 2.5 Copy Credentials (3 min)
**IMPORTANT:** Copy these now, you'll need them soon!

1. **Phone Number ID**: (looks like `123456789012345`)
   - Found under "Phone number ID"
   - Copy to your note

2. **Access Token**: (starts with `EAAG...`)
   - Found under "Access Token"
   - Click "Copy"
   - Paste to your note

### 2.6 Choose Verify Token (2 min)
**Make up a random string** for verification:
- Example: `my-secret-token-12345`
- Or generate: https://www.random.org/strings/
- **Write it down** - you'll use it twice

✅ **Success check:** You have 3 things saved:
- Phone Number ID
- Access Token
- Verify Token (one you made up)

---

## Step 3: Create Pipedream Workflow (5 min) ⏰

### 3.1 Create Account (2 min)
1. Go to https://pipedream.com/
2. Click "Sign Up"
3. Sign up with GitHub (fastest)

### 3.2 Create Workflow (3 min)
1. Click "New Workflow"
2. Name: "Cockpit WhatsApp Handler"
3. Click "Create"

✅ **Success check:** You're in the workflow editor

---

## Step 4: Add HTTP Webhook Trigger (2 min) ⏰

1. Search for "HTTP"
2. Select "HTTP / Webhook" → "HTTP API"
3. Click "Create Source"
4. **COPY THE WEBHOOK URL** (looks like `https://eoxxx.m.pipedream.net`)
5. Paste in your note

✅ **Success check:** You have a webhook URL

---

## Step 5: Configure WhatsApp Webhook (3 min) ⏰

**Go back to Meta Developer Console:**

1. WhatsApp → Configuration → Webhook
2. Click "Edit"
3. Enter:
   - **Callback URL**: Your Pipedream webhook URL
   - **Verify Token**: The token YOU made up in Step 2.6
4. Click "Verify and Save"

**It will FAIL - that's expected!** We haven't deployed the verification code yet.

---

## Step 6: Set Environment Variables (5 min) ⏰

**In Pipedream:**

1. Click "Settings" tab (top of page)
2. Scroll to "Environment Variables"
3. Click "Add Variable" for each:

```bash
CLAUDE_API_KEY=sk-ant-api03-YOUR-KEY-HERE
WHATSAPP_TOKEN=EAAG...YOUR-TOKEN-HERE
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=my-secret-token-12345
GITHUB_USERNAME=bdusape
GITHUB_REPO=the-cockpit
GITHUB_BRANCH=claude/cockpit-mvp-first-011CUxfn4dNRWytmwZsDTw1o
```

**IMPORTANT:** Replace the values with YOUR actual credentials from your notes!

✅ **Success check:** All 7 variables saved

---

## Step 7: Add Workflow Steps (10 min) ⏰

**For each step:**
1. Click "+ Add Step" (blue button)
2. Select "Run custom code"
3. Copy code from file
4. Paste into Pipedream
5. Name the step

### Step 1: Verify Webhook
- **File**: `workflows/pipedream/steps/01-verify-webhook.js`
- **Name**: `verify_webhook`
- Copy entire file contents, paste

### Step 2: Parse Message
- **File**: `workflows/pipedream/steps/02-parse-message.js`
- **Name**: `parse_message`
- Copy entire file contents, paste

### Step 3: Handle Special Commands
- **File**: `workflows/pipedream/steps/03-handle-special-commands.js`
- **Name**: `handle_special_commands`
- Copy entire file contents, paste

### Step 4: Load Agent Config
- **File**: `workflows/pipedream/steps/04-load-agent-config.js`
- **Name**: `load_agent_config`
- Copy entire file contents, paste

### Step 5: Call Claude API
- **File**: `workflows/pipedream/steps/05-call-claude-api.js`
- **Name**: `call_claude_api`
- Copy entire file contents, paste

### Step 6: Send WhatsApp Response
- **File**: `workflows/pipedream/steps/06-send-whatsapp-response.js`
- **Name**: `send_whatsapp_response`
- Copy entire file contents, paste

### Step 7: Log Metrics
- **File**: `workflows/pipedream/steps/07-log-metrics.js`
- **Name**: `log_metrics`
- Copy entire file contents, paste

✅ **Success check:** You have 7 steps in your workflow

---

## Step 8: Deploy Workflow (2 min) ⏰

1. Click "Deploy" (top right, big blue button)
2. Wait for "Deployed" status (green checkmark)

---

## Step 9: Verify WhatsApp Webhook (2 min) ⏰

**Go back to Meta Developer Console:**

1. WhatsApp → Configuration → Webhook
2. Click "Edit"
3. Same values as before:
   - **Callback URL**: Your Pipedream URL
   - **Verify Token**: Your token
4. Click "Verify and Save"

**This time it should succeed!** ✅ Green checkmark

---

## Step 10: Subscribe to Messages (1 min) ⏰

**Still in Meta Console:**

1. Scroll down to "Webhook fields"
2. Click "Manage"
3. Check ✅ **messages**
4. Click "Done"

✅ **Success check:** Green checkmark next to "messages"

---

## Step 11: TEST IT! (5 min) ⏰

### Test 1: Help Command
Open WhatsApp on your phone, send to the test number:

```
help
```

**Expected:** Bot responds with list of agents

**If no response:**
1. Check Pipedream → Events tab
2. Look for execution
3. Check logs for errors

### Test 2: Agent Activation
```
@publicist
```

**Expected:** "Publicist agent activated 📣"

### Test 3: Real Query
```
@publicist Test announcement for The Cockpit launch
```

**Expected:** AI-generated announcement content

### Test 4: Agent Switching
```
@growth
```

**Expected:** "Growth Hacker activated 📈"

### Test 5: All Agents
```
@strategist
@content
@credit
```

**Expected:** Each agent responds with activation message

---

## 🎉 Success!

If all tests pass, **you're done!** You now have a working AI agent platform on your phone.

---

## ⚠️ Quick Troubleshooting

### No response at all?

**Check 1: Webhook subscribed?**
- Meta console → WhatsApp → Configuration
- "messages" should have green checkmark

**Check 2: Phone number added?**
- Meta console → WhatsApp → API Setup
- Your number should be under "To"

**Check 3: Workflow deployed?**
- Pipedream should show "Deployed" (not "Draft")

**Check 4: Logs**
- Pipedream → Events tab
- Do you see executions?
- Click on one, check for errors

### "Agent not found" error?

**Fix:** Update environment variable:
```
GITHUB_BRANCH=claude/cockpit-mvp-first-011CUxfn4dNRWytmwZsDTw1o
```

### Claude API error?

**Check:** API key is correct in environment variables
- Should start with `sk-ant-api03-`
- No extra spaces

### WhatsApp send error?

**Check:**
- `WHATSAPP_TOKEN` is correct
- `WHATSAPP_PHONE_NUMBER_ID` is correct
- No extra spaces in variables

---

## 📊 Timeline Checkpoint

At this point you should be at:

- ✅ **50 min**: Bot is working
- ✅ **10 min**: Testing all features

**Total: 60 minutes** ⏰

---

## 🎯 What to Test Next

### Creative Use Cases

**Publicist:**
```
@publicist We just hit 100 GitHub stars on The Cockpit!
```

**Growth:**
```
@growth How do I make my LinkedIn posts go viral?
```

**Strategist:**
```
@strategist Should I open source The Cockpit or keep it private?
```

**Content:**
```
@content Write a 30-second TikTok script about AI agents
```

**Credit:**
```
@credit How do I optimize my credit score quickly?
```

---

## 📈 Monitor Usage

**Check costs:**
1. Pipedream → Events tab (count executions)
2. Anthropic console → Usage tab (check tokens)

**Free tier limits:**
- Pipedream: 100 runs/month
- Anthropic: $5 free credits (~2,500 messages)

---

## 🚀 Next Steps

### Phase 1 Complete!

You now have:
- ✅ Working WhatsApp bot
- ✅ 5 specialized AI agents
- ✅ Accessible from any phone

### Want More?

**Customize agents:**
- Read: `docs/CUSTOM_AGENTS.md`
- Create your own agent in 15 min

**Phase 2 features:**
- Conversation memory (coming soon)
- Voice message support
- See: `docs/ROADMAP.md`

---

## 💬 Feedback

**It worked!**
- Give the repo a ⭐ on GitHub
- Share your experience

**It didn't work:**
- Check `docs/TROUBLESHOOTING.md`
- Open a GitHub issue with error details

---

## 🎊 Congratulations!

You built your own Motion-like AI platform in under an hour!

**Cost:** $0.18-2/month (vs Motion's $29-600/month)

**Access:** Anywhere, anytime, on any phone

**Power:** 5 specialized AI experts in your pocket

---

**Now go test it with real use cases!** 🚀

---

**Created:** 2025-11-09
**Optimized for:** 60-minute deployment
