# Pipedream Workflow for The Cockpit

This directory contains the complete Pipedream workflow configuration for The Cockpit WhatsApp bot.

## Quick Import

**Option 1: Manual Setup**
Follow the [SETUP_GUIDE.md](../../docs/SETUP_GUIDE.md) for step-by-step instructions.

**Option 2: Import Workflow (Coming Soon)**
We'll provide a one-click import link once the workflow is published to Pipedream's directory.

## Workflow Overview

```
1. HTTP Webhook Trigger → Receives WhatsApp messages
2. Verify Webhook → Handles Meta's webhook verification
3. Parse Message → Extracts agent trigger and query
4. Load Agent Config → Fetches agent instructions from GitHub
5. Get Conversation Memory → Retrieves chat history (Phase 2)
6. Call Claude API → Generates AI response
7. Update Memory → Saves conversation context (Phase 2)
8. Send to WhatsApp → Delivers response to user
9. Log Metrics → Tracks usage and costs
```

## Environment Variables Required

Set these in Pipedream → Settings → Environment Variables:

```
CLAUDE_API_KEY=sk-ant-api03-...
WHATSAPP_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=your-custom-verify-token
GITHUB_USERNAME=briandusape
GITHUB_REPO=the-cockpit
```

## Files in This Directory

- `cockpit-whatsapp-handler.yaml` - Full workflow export (coming soon)
- `steps/` - Individual step code snippets
- `utils/` - Helper functions
- `README.md` - This file

## Testing Your Workflow

1. Deploy the workflow in Pipedream
2. Send a test message: `@publicist`
3. Check "Events" tab in Pipedream to see execution
4. Review logs for each step

## Troubleshooting

**Common issues:**

1. **Webhook verification fails**
   - Check `WHATSAPP_VERIFY_TOKEN` matches what you set in Meta console
   - Ensure verification step runs before other steps

2. **No messages received**
   - Verify webhook is subscribed to `messages` in Meta console
   - Check WhatsApp test number is configured
   - Confirm your phone number is added as recipient

3. **Claude API errors**
   - Verify `CLAUDE_API_KEY` is valid
   - Check you have credits remaining
   - Review token limits (max 200K context)

4. **Agent not found**
   - Confirm GitHub repo is public or token is set
   - Check agent filename matches `agentMap`
   - Verify agent .md file exists in `agents/` directory

## Rate Limits

**Pipedream Free Tier:**
- 100 workflow executions per month
- Enough for ~3 conversations per day
- Upgrade to $20/month for 10,000 executions

**WhatsApp Business API:**
- Test number: 1,000 messages per day
- Production: First 1,000 conversations free per month

**Claude API:**
- Rate limits based on your tier
- Standard: 50 requests/min, 40,000 tokens/min

## Optimizations

**To reduce workflow runs:**
1. Cache agent configs (don't fetch from GitHub every time)
2. Batch multiple messages if sent rapidly
3. Use workflow filters to ignore non-message events

**To reduce costs:**
1. Use Haiku model for simple queries
2. Implement prompt caching for agent instructions
3. Set max_tokens lower for concise responses

## Next Steps

- [ ] Add conversation memory (Phase 2)
- [ ] Implement caching for agent configs
- [ ] Add voice message transcription
- [ ] Create analytics dashboard
- [ ] Set up error notifications (email/Slack)

## Resources

- [Pipedream Docs](https://pipedream.com/docs/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Claude API Docs](https://docs.anthropic.com/)
- [The Cockpit Docs](../../docs/)

## Support

For workflow-specific issues, check:
1. Pipedream execution logs
2. [TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md)
3. GitHub Issues

---

**Last Updated:** 2025-11-09
