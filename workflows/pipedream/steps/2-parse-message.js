// Step 2: Parse WhatsApp Message
// Extracts the message text, sender, and agent trigger from the webhook payload
export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;

    // Check if this is a message event
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      console.log('Not a message event, skipping...');
      $.flow.exit('Not a message event');
    }

    const value = body.entry[0].changes[0].value;
    const message = value.messages[0];

    // Extract message details
    const from = message.from; // User's phone number
    const messageId = message.id;
    const timestamp = message.timestamp;
    const messageType = message.type; // text, voice, image, etc.

    // Handle different message types
    let messageText = '';

    if (messageType === 'text') {
      messageText = message.text?.body || '';
    } else if (messageType === 'audio') {
      // Voice message - we'll handle this in Phase 2
      console.log('Voice message received - not yet supported');
      $.flow.exit('Voice messages not yet supported');
    } else {
      console.log(`Unsupported message type: ${messageType}`);
      $.flow.exit('Unsupported message type');
    }

    // Check for special commands first
    const lowerText = messageText.toLowerCase().trim();

    if (lowerText === 'help' || lowerText === 'agents') {
      return {
        specialCommand: 'help',
        from,
        messageId
      };
    }

    if (lowerText === 'clear' || lowerText === 'reset') {
      return {
        specialCommand: 'reset',
        from,
        messageId
      };
    }

    // Parse agent trigger
    // Format: @publicist or @growth or @strategist, etc.
    const triggerMatch = messageText.match(/^@(\w+)/);

    let agent = null;
    let query = messageText;

    if (triggerMatch) {
      agent = triggerMatch[1].toLowerCase();
      // Remove the trigger from the query
      query = messageText.replace(/^@\w+\s*/, '').trim();
    }

    // If no agent specified, we'll use the last active agent (from memory)
    // For now, default to publicist if no agent found

    console.log('📥 Message parsed:', {
      from,
      agent: agent || 'from_memory',
      queryLength: query.length,
      hasQuery: query.length > 0
    });

    return {
      from,
      messageId,
      timestamp,
      agent, // null if no trigger found (will use last active agent)
      query,
      originalText: messageText,
      specialCommand: null
    };
  }
});
