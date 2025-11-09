/**
 * Step 2: Parse WhatsApp Message
 *
 * Extracts the message details from WhatsApp webhook payload:
 * - Sender phone number
 * - Message text
 * - Agent trigger (e.g., @publicist, @growth)
 * - User query (message without the trigger)
 *
 * Returns null if the webhook is not a message event (e.g., status update)
 */

export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;

    // Validate webhook payload structure
    if (!body || !body.entry || !Array.isArray(body.entry)) {
      console.log('⚠️ Invalid webhook payload structure');
      $.flow.exit('Invalid payload');
      return null;
    }

    // Check if this is a message event
    const entry = body.entry[0];
    const changes = entry?.changes;

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      console.log('⚠️ No changes in webhook payload');
      $.flow.exit('No changes');
      return null;
    }

    const value = changes[0].value;
    const messages = value?.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('⚠️ Not a message event (may be status update), skipping...');
      $.flow.exit('Not a message');
      return null;
    }

    // Extract message details
    const message = messages[0];
    const from = message.from; // User's phone number
    const messageId = message.id;
    const messageType = message.type; // text, voice, image, etc.

    // Handle different message types
    let messageText = '';

    if (messageType === 'text') {
      messageText = message.text?.body || '';
    } else if (messageType === 'audio') {
      // Phase 2: Voice message support
      console.log('🎤 Voice message received (not yet supported)');
      $.flow.exit('Voice messages not yet supported');
      return null;
    } else if (messageType === 'image') {
      // Phase 2: Image support
      console.log('🖼️ Image received (not yet supported)');
      $.flow.exit('Images not yet supported');
      return null;
    } else {
      console.log(`⚠️ Unsupported message type: ${messageType}`);
      $.flow.exit('Unsupported message type');
      return null;
    }

    // Parse agent trigger
    // Format: @publicist [query] or just [query]
    const triggerMatch = messageText.match(/^@(\w+)/);
    const agent = triggerMatch ? triggerMatch[1].toLowerCase() : null;
    const query = triggerMatch
      ? messageText.replace(/^@\w+\s*/, '').trim()
      : messageText.trim();

    // Handle empty messages
    if (!query && !agent) {
      console.log('⚠️ Empty message received');
      $.flow.exit('Empty message');
      return null;
    }

    // Check for special commands
    const specialCommands = ['help', 'agents', 'clear', 'reset', 'status'];
    if (specialCommands.includes(query.toLowerCase())) {
      console.log(`🔧 Special command detected: ${query}`);
      return {
        from,
        messageId,
        agent: 'system',
        query: query.toLowerCase(),
        originalText: messageText,
        isSpecialCommand: true
      };
    }

    console.log(`📋 Message parsed:
      - From: ${from}
      - Agent: ${agent || 'default'}
      - Query: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}
    `);

    return {
      from,
      messageId,
      agent,
      query,
      originalText: messageText,
      messageType,
      isSpecialCommand: false,
      timestamp: new Date().toISOString()
    };
  }
});
