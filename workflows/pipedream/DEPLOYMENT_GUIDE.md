# The Cockpit - Pipedream Deployment Guide

**Quick deployment guide for getting The Cockpit running on Pipedream in under 2 hours.**

---

## Prerequisites

Before you start:

- [ ] WhatsApp Business account set up ([Step 2 in SETUP_GUIDE](../../docs/SETUP_GUIDE.md#step-2-set-up-whatsapp-business))
- [ ] Claude API key ([Step 1 in SETUP_GUIDE](../../docs/SETUP_GUIDE.md#step-1-get-claude-api-key))
- [ ] Pipedream account (free tier is fine)

---

## Deployment Steps

### 1. Create New Workflow

1. Go to https://pipedream.com/
2. Click "New Workflow"
3. Name it "Cockpit WhatsApp Handler"

---

### 2. Add HTTP Webhook Trigger

1. Search for "HTTP / Webhook"
2. Select "HTTP API"
3. Click "Create Source"
4. Copy the webhook URL (you'll need this for Meta)

**Example URL:** `https://eoxxx.m.pipedream.net`

---

### 3. Set Environment Variables

Go to **Settings → Environment Variables** and add:

```bash
CLAUDE_API_KEY=sk-ant-api03-your-key-here
WHATSAPP_TOKEN=EAAG...your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=choose-a-random-secure-string
GITHUB_USERNAME=briandusape
GITHUB_REPO=the-cockpit
```

**Important:** Use your actual values, not the placeholders above!

---

### 4. Add Workflow Steps

Add each step in order by clicking "+ Add Step" → "Run custom code":

#### Step 1: Verify Webhook
- Copy code from `steps/01-verify-webhook.js`
- Paste into Pipedream
- Name the step: `verify_webhook`

#### Step 2: Parse Message
- Copy code from `steps/02-parse-message.js`
- Paste into Pipedream
- Name the step: `parse_message`

#### Step 3: Handle Special Commands
- Copy code from `steps/03-handle-special-commands.js`
- Paste into Pipedream
- Name the step: `handle_special_commands`

#### Step 4: Load Agent Config
- Copy code from `steps/04-load-agent-config.js`
- Paste into Pipedream
- Name the step: `load_agent_config`

#### Step 5: Call Claude API
- Copy code from `steps/05-call-claude-api.js`
- Paste into Pipedream
- Name the step: `call_claude_api`

#### Step 6: Send WhatsApp Response
- Copy code from `steps/06-send-whatsapp-response.js`
- Paste into Pipedream
- Name the step: `send_whatsapp_response`

#### Step 7: Log Metrics
- Copy code from `steps/07-log-metrics.js`
- Paste into Pipedream
- Name the step: `log_metrics`

---

### 5. Configure WhatsApp Webhook

Now go back to your Meta Developer Console:

1. Navigate to WhatsApp → Configuration
2. Click "Edit" next to Webhook
3. Enter:
   - **Callback URL:** Your Pipedream webhook URL
   - **Verify Token:** The same token you set in environment variables
4. Click "Verify and Save"
5. Subscribe to webhook fields:
   - ✅ `messages`

**Expected result:** Green checkmark ✅ next to webhook URL

---

### 6. Deploy Workflow

1. Click "Deploy" in the top-right corner
2. Wait for deployment to complete
3. You should see "Deployed" status

---

### 7. Test Your Bot

Send a test message to your WhatsApp Business number:

```
@publicist
```

**Expected response:**
```
Publicist agent activated 📣 How can I help with announcements today?
```

If you see this response, **you're done! 🎉**

---

## Troubleshooting

### Issue: Webhook verification fails

**Solution:**
- Make sure `WHATSAPP_VERIFY_TOKEN` in Pipedream matches the token in Meta console
- Deploy the workflow BEFORE verifying in Meta console
- Check Pipedream logs for errors

---

### Issue: No messages received

**Solution:**
- Verify webhook is subscribed to `messages` in Meta console
- Check that your phone number is added as a test recipient
- Look for errors in Pipedream execution logs

---

### Issue: "Agent not found" error

**Solution:**
- Confirm your GitHub repo is public (or add GitHub token)
- Check that agent files exist in `agents/` directory
- Verify `GITHUB_USERNAME` and `GITHUB_REPO` are correct

---

### Issue: Claude API errors

**Solution:**
- Verify `CLAUDE_API_KEY` is correct
- Check you have credits remaining in Anthropic console
- Make sure key hasn't expired

---

### Issue: "WhatsApp API error"

**Solution:**
- Check `WHATSAPP_TOKEN` is valid (may expire after 24 hours for temp tokens)
- Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
- Generate a permanent token in Meta Business Settings

---

## Next Steps

Once your bot is working:

1. **Test all agents:**
   ```
   @publicist
   @growth
   @strategist
   @content
   @credit
   ```

2. **Try special commands:**
   ```
   help
   status
   clear
   ```

3. **Customize agents:** Edit files in `agents/` directory

4. **Monitor usage:** Check Pipedream logs for metrics

5. **Phase 2:** Add conversation memory, voice messages

---

## Workflow Health Check

Use this checklist to ensure everything is working:

- [ ] Webhook verification successful (green checkmark in Meta)
- [ ] Test message sent, response received
- [ ] All 5 agents respond correctly
- [ ] Special commands work (help, status, clear)
- [ ] Metrics logged in Pipedream console
- [ ] No errors in workflow execution logs

---

## Performance Expectations

**Typical response times:**
- Simple query: 3-5 seconds
- Complex query: 5-8 seconds

**Free tier limits:**
- 100 workflow runs/month
- ~3 conversations per day

**If you need more:**
- Upgrade to Pipedream paid plan ($20/month for 10,000 runs)
- Or use n8n self-hosted (unlimited runs)

---

## Cost Monitoring

**To track costs:**

1. Check Pipedream logs after each message (Step 7 shows estimated cost)
2. Monitor Anthropic console for API usage
3. Set spending limits in Anthropic billing

**Expected monthly cost (100 messages):**
- Claude API: $0.18-2.10
- Pipedream: $0 (free tier)
- WhatsApp: $0 (free tier)
- **Total: $0.18-2.10/month**

---

## Maintenance

**Weekly:**
- Check Pipedream execution logs for errors
- Review token usage and costs
- Update agent context if needed

**Monthly:**
- Review agent performance
- Add new agents if needed
- Update documentation

**Quarterly:**
- Evaluate upgrade to paid tier if needed
- Consider Phase 2 features (memory, voice)

---

## Getting Help

**If you're stuck:**

1. Check execution logs in Pipedream (Events tab)
2. Review [TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md)
3. Search GitHub Issues
4. Open a new issue with:
   - Error message
   - Execution logs
   - Environment (Pipedream, WhatsApp version)

---

## Optional: Generate Permanent WhatsApp Token

Temporary tokens expire after 24 hours. Generate a permanent one:

1. Go to Meta Business Settings
2. System Users → Add user
3. Assign permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
4. Generate token
5. Update `WHATSAPP_TOKEN` in Pipedream

---

## Security Best Practices

- ✅ Never commit environment variables to Git
- ✅ Use permanent tokens (not temporary ones)
- ✅ Regenerate tokens if compromised
- ✅ Limit authorized phone numbers (Phase 2)
- ✅ Enable webhook signature validation (Phase 2)

---

## Backup Your Workflow

**Export your workflow:**

1. In Pipedream, click workflow menu (⋮)
2. Select "Export"
3. Save JSON file locally
4. Commit to your repo (without sensitive values)

**To restore:**

1. Create new workflow
2. Import saved JSON
3. Re-add environment variables
4. Deploy

---

**Deployment time:** 1-2 hours
**Difficulty:** Intermediate
**Support:** [GitHub Issues](https://github.com/briandusape/the-cockpit/issues)

---

**Last Updated:** 2025-11-09
