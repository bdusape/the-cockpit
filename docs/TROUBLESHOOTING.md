# The Cockpit - Troubleshooting Guide

**Common issues and solutions for The Cockpit WhatsApp bot**

---

## Quick Diagnosis

### Is your bot working at all?

**Test:** Send `help` to your WhatsApp bot

- ✅ **Bot responds** → Bot is working, issue is specific
- ❌ **No response** → Setup issue, start with [No Messages Received](#no-messages-received)

---

## Setup Issues

### Webhook Verification Fails

**Symptom:** Meta Developer Console shows "Verification failed" when trying to verify webhook

**Causes & Solutions:**

1. **Verify token mismatch**
   - Check `WHATSAPP_VERIFY_TOKEN` in Pipedream matches token in Meta console
   - Tokens are case-sensitive
   - No extra spaces

2. **Workflow not deployed**
   - Deploy workflow in Pipedream BEFORE verifying in Meta
   - Look for "Deployed" status in Pipedream

3. **Incorrect webhook URL**
   - Copy full URL from Pipedream trigger
   - URL should look like: `https://eoxxx.m.pipedream.net`
   - No trailing slashes

**How to fix:**
```bash
1. Go to Pipedream → Environment Variables
2. Confirm WHATSAPP_VERIFY_TOKEN value
3. Go to Meta console → WhatsApp → Configuration
4. Edit webhook, enter same verify token
5. Click "Verify and Save"
```

**Still failing?**
- Check Pipedream execution logs for error details
- Try a different verify token (simpler, no special characters)

---

### No Messages Received

**Symptom:** You send a message to your WhatsApp bot, but nothing happens

**Causes & Solutions:**

1. **Webhook not subscribed to `messages`**
   - Go to Meta console → WhatsApp → Configuration
   - Below webhook URL, find "Webhook fields"
   - Click "Manage"
   - Ensure `messages` is checked ✅
   - Click "Done"

2. **Phone number not authorized**
   - Go to Meta console → WhatsApp → API Setup
   - Under "To", check if your number is listed
   - If not, click "Add phone number"
   - Enter your WhatsApp number
   - Verify with code sent to WhatsApp

3. **Test number not configured**
   - Verify you're using the Meta-provided test number
   - Check number format (no spaces, dashes, or +)

4. **Workflow is paused/stopped**
   - Check Pipedream workflow status
   - Should say "Deployed" not "Paused"
   - Click "Deploy" if needed

**How to test:**
```bash
1. Send "help" to your WhatsApp bot number
2. Check Pipedream → Events tab
3. Look for new execution within 10 seconds
4. If execution appears but fails, check step logs
5. If no execution appears, webhook isn't configured correctly
```

---

### WhatsApp Token Expired

**Symptom:** Bot was working, now shows "WhatsApp API error" or "Invalid token"

**Cause:** Temporary access tokens expire after 24 hours

**Solution: Generate permanent token**

1. Go to Meta Business Settings: https://business.facebook.com/settings/
2. Click "System Users" in left sidebar
3. Click "Add" → Create system user:
   - Name: "The Cockpit Bot"
   - Role: Admin
4. Click on the new system user
5. Click "Generate New Token"
6. Select your app
7. Choose permissions:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
8. Click "Generate Token"
9. Copy the token (starts with `EAAG...`)
10. Update `WHATSAPP_TOKEN` in Pipedream environment variables

**Permanent tokens don't expire!**

---

## Runtime Issues

### "Agent not found" Error

**Symptom:** Bot responds with "Agent config load error" or "Agent not found"

**Causes & Solutions:**

1. **GitHub repo is private and no token provided**
   - Make repo public, OR
   - Add GitHub personal access token to environment variables:
     ```
     GITHUB_TOKEN=ghp_your_token_here
     ```

2. **Agent file doesn't exist**
   - Check that file exists: `agents/[agent-name].md`
   - Verify filename matches exactly (case-sensitive)
   - Example: `publicist.md` not `Publicist.md`

3. **Wrong branch name**
   - Default branch is `main`
   - If your default branch is `master`, set:
     ```
     GITHUB_BRANCH=master
     ```

4. **Wrong GitHub username/repo**
   - Verify environment variables:
     ```
     GITHUB_USERNAME=briandusape
     GITHUB_REPO=the-cockpit
     ```

**How to test:**
```bash
# Try loading agent file directly:
https://raw.githubusercontent.com/[USERNAME]/[REPO]/main/agents/publicist.md

# Should show agent instructions, not 404
```

---

### Claude API Errors

**Symptom:** "I'm having trouble thinking right now" or "Claude API error"

**Causes & Solutions:**

1. **Invalid API key**
   - Go to https://console.anthropic.com/
   - Check if key is still valid
   - Regenerate if needed
   - Update `CLAUDE_API_KEY` in Pipedream

2. **No credits remaining**
   - Check Anthropic console billing
   - Add payment method or credits
   - Free tier: $5 in credits

3. **Rate limit exceeded**
   - Standard tier: 50 requests/min
   - Wait 1 minute, try again
   - Consider upgrading tier if needed

4. **Context too long**
   - Max context: 200K tokens
   - Check agent .md file isn't too large
   - Reduce `CLAUDE_MAX_TOKENS` if needed

**How to diagnose:**
```bash
1. Go to Pipedream → Events
2. Find failed execution
3. Click on "call_claude_api" step
4. Look for error details in logs
5. Note the error type and message
```

---

### Response Not Delivered

**Symptom:** Claude generates response (seen in logs) but user doesn't receive it

**Causes & Solutions:**

1. **WhatsApp send failed**
   - Check `send_whatsapp_response` step logs
   - Look for HTTP error codes
   - Common: 401 (invalid token), 403 (forbidden)

2. **Message too long**
   - WhatsApp limit: 4096 characters
   - Bot auto-truncates but may fail
   - Reduce `CLAUDE_MAX_TOKENS` to generate shorter responses:
     ```
     CLAUDE_MAX_TOKENS=2048
     ```

3. **Rate limit hit**
   - WhatsApp test number: 1,000 messages/day
   - Check if limit reached
   - Wait until next day or get production number

**Quick fix:**
```bash
# Set shorter max tokens
CLAUDE_MAX_TOKENS=2048

# Or use Haiku for shorter responses
CLAUDE_MODEL=claude-haiku-4-5-20250929
```

---

## Performance Issues

### Slow Responses (>10 seconds)

**Symptom:** Bot takes a long time to respond

**Causes & Solutions:**

1. **Using Opus model** (slowest)
   - Switch to Sonnet or Haiku:
     ```
     CLAUDE_MODEL=claude-sonnet-4-5-20250929  # Balanced
     CLAUDE_MODEL=claude-haiku-4-5-20250929   # Fastest
     ```

2. **Large agent config files**
   - Keep agent .md files under 10KB
   - Remove unnecessary examples/context

3. **GitHub fetch is slow**
   - Phase 2: Implement caching
   - For now: Ensure repo is public (faster than private)

**Expected response times:**
- Haiku: 2-3 seconds
- Sonnet: 3-5 seconds
- Opus: 6-10 seconds

---

### Hit Pipedream Free Tier Limit

**Symptom:** "Workflow quota exceeded" or stops working after 100 runs

**Solution Options:**

1. **Upgrade Pipedream** ($20/month for 10,000 runs)
   - Go to Pipedream → Billing
   - Select paid plan

2. **Switch to n8n** (self-hosted, unlimited)
   - Deploy n8n on DigitalOcean/Heroku
   - Import workflow logic
   - ~$6-12/month hosting

3. **Optimize workflow** (reduce runs)
   - Add filters to skip non-message events
   - Use longer conversations (fewer agent switches)

**Calculate your usage:**
```
Messages per day × 30 days = Monthly runs

Example:
3 messages/day × 30 = 90 runs/month (fits free tier)
5 messages/day × 30 = 150 runs/month (need paid tier)
```

---

## Error Messages Explained

### "Invalid payload"
**Meaning:** WhatsApp webhook sent malformed data
**Fix:** Ignore these (usually WhatsApp status updates). Workflow auto-handles.

### "Not a message event"
**Meaning:** Webhook was for status update, not a message
**Fix:** Normal behavior. No action needed.

### "Empty message received"
**Meaning:** User sent blank message
**Fix:** Normal. Bot ignores empty messages.

### "Voice messages not yet supported"
**Meaning:** User sent voice message (Phase 2 feature)
**Fix:** Tell user to send text for now

### "Agent config file is empty or too short"
**Meaning:** Fetched agent .md file was empty or corrupted
**Fix:** Check GitHub file, ensure it has content

### "Failed to load agent config: 404"
**Meaning:** Agent file doesn't exist at the URL
**Fix:** Verify filename, branch, and repo settings

### "Claude API error: 401"
**Meaning:** Invalid Claude API key
**Fix:** Check `CLAUDE_API_KEY` in Anthropic console

### "WhatsApp API error: 403"
**Meaning:** Invalid WhatsApp token or permissions
**Fix:** Generate new permanent token

---

## Debugging Steps

### How to Read Pipedream Logs

1. Go to Pipedream → Your Workflow
2. Click "Events" tab
3. Find recent execution
4. Click on execution to expand
5. Review each step:
   - ✅ Green = success
   - ❌ Red = error
   - ⏭️ Skipped = early exit (often normal)
6. Click on step to see:
   - Input data
   - Output data
   - Console logs
   - Error messages

### Testing Individual Steps

1. Go to failed execution
2. Click "Replay from step X"
3. Modify input if needed
4. See what output is generated
5. Compare with expected output

### Testing End-to-End

Send this test sequence:

```bash
1. help
   → Should list agents

2. @publicist
   → Should activate publicist

3. @publicist test message
   → Should get response

4. @growth
   → Should switch agents

5. clear
   → Should clear memory

6. status
   → Should show status
```

If all 6 work, your bot is healthy! ✅

---

## Environment Variables Checklist

Make sure ALL of these are set correctly in Pipedream:

```bash
# Required
✅ CLAUDE_API_KEY=sk-ant-api03-...
✅ WHATSAPP_TOKEN=EAAG...
✅ WHATSAPP_PHONE_NUMBER_ID=123456789
✅ WHATSAPP_VERIFY_TOKEN=your-token
✅ GITHUB_USERNAME=briandusape
✅ GITHUB_REPO=the-cockpit

# Optional (with defaults)
⚪ CLAUDE_MODEL=claude-sonnet-4-5-20250929
⚪ CLAUDE_MAX_TOKENS=4096
⚪ WHATSAPP_API_VERSION=v17.0
⚪ GITHUB_BRANCH=main
```

---

## Still Stuck?

### Before opening an issue:

1. ✅ Checked all solutions in this guide
2. ✅ Reviewed Pipedream execution logs
3. ✅ Verified all environment variables
4. ✅ Tested with "help" command
5. ✅ Checked Meta webhook configuration

### Open a GitHub Issue with:

**Issue template:**
```markdown
## Problem
[Brief description of the issue]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Result]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Platform: Pipedream / n8n / Zapier
- Claude Model: [model name]
- WhatsApp: Test number / Production number

## Logs
[Paste relevant error logs from Pipedream]

## Screenshots
[If applicable]
```

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| No response | Check webhook subscribed to `messages` |
| Verification fails | Match verify tokens exactly |
| Token expired | Generate permanent token |
| Agent not found | Make repo public or add GitHub token |
| Claude error | Check API key and credits |
| Slow responses | Switch to Haiku model |
| Hit free tier | Upgrade to paid or switch to n8n |

---

## Preventive Maintenance

### Weekly Checks
- [ ] Review Pipedream execution logs for errors
- [ ] Check Claude API usage in Anthropic console
- [ ] Verify WhatsApp token is still valid

### Monthly Checks
- [ ] Review cost analysis (Claude + Pipedream)
- [ ] Update agent context if business changes
- [ ] Test all agents work correctly

### When to Upgrade
- **Pipedream:** When hitting 100 runs/month consistently
- **Claude API:** When exceeding budget, switch to Haiku
- **WhatsApp:** When ready for production, get permanent number

---

## Emergency Contacts

**Platform Support:**
- **Pipedream:** https://pipedream.com/support
- **WhatsApp API:** https://developers.facebook.com/support
- **Anthropic:** https://support.anthropic.com/

**The Cockpit:**
- **GitHub Issues:** https://github.com/briandusape/the-cockpit/issues
- **Discussions:** https://github.com/briandusape/the-cockpit/discussions

---

**Last Updated:** 2025-11-09
**Version:** 1.0.0
