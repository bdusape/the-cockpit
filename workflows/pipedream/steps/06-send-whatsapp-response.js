/**
 * Step 6: Send Response to WhatsApp
 *
 * Delivers the AI response (or error message) back to the user via WhatsApp.
 * Handles both successful responses and error cases gracefully.
 *
 * WhatsApp message length limit: 4096 characters
 * If response is longer, it will be truncated with a warning.
 */

export default defineComponent({
  async run({ steps, $ }) {
    const parsed = steps.parse_message;
    const claudeResponse = steps.call_claude_api;
    const specialCommand = steps.handle_special_commands;

    // Determine the response to send
    let messageToSend;
    let recipient;

    // Handle special command response
    if (specialCommand?.isSpecialCommand) {
      messageToSend = specialCommand.response;
      recipient = specialCommand.from;
    }
    // Handle Claude API response
    else if (claudeResponse && !claudeResponse.error) {
      messageToSend = claudeResponse.reply;
      recipient = parsed.from;
    }
    // Handle errors
    else if (claudeResponse?.error) {
      const errorType = claudeResponse.errorType;

      switch (errorType) {
        case 'missing_api_key':
          messageToSend = `⚠️ Configuration error: Claude API key not set. Please contact the administrator.`;
          break;

        case 'agent_load_error':
          messageToSend = `⚠️ Sorry, I couldn't load the agent configuration. Please try again or type "help" for available agents.`;
          break;

        case 'claude_api_error':
          messageToSend = `⚠️ I'm having trouble thinking right now. Please try again in a moment.\n\nIf this persists, type "help" for assistance.`;
          break;

        default:
          messageToSend = `⚠️ Something went wrong. Please try again or type "help" for assistance.`;
      }

      recipient = parsed.from;
    }
    // No message to send
    else {
      console.log('⚠️ No message to send, exiting...');
      $.flow.exit('No message to send');
      return null;
    }

    // WhatsApp message length limit is 4096 characters
    const MAX_MESSAGE_LENGTH = 4096;

    if (messageToSend.length > MAX_MESSAGE_LENGTH) {
      console.log(`⚠️ Message too long (${messageToSend.length} chars), truncating...`);
      messageToSend = messageToSend.substring(0, MAX_MESSAGE_LENGTH - 100) +
        '\n\n...(message truncated due to length limit)';
    }

    // Configuration
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v17.0';

    // Validate configuration
    if (!WHATSAPP_TOKEN) {
      console.error('❌ WHATSAPP_TOKEN not set in environment variables');
      $.respond({
        status: 500,
        body: { error: 'WhatsApp token not configured' }
      });
      return null;
    }

    if (!WHATSAPP_PHONE_NUMBER_ID) {
      console.error('❌ WHATSAPP_PHONE_NUMBER_ID not set in environment variables');
      $.respond({
        status: 500,
        body: { error: 'WhatsApp phone number ID not configured' }
      });
      return null;
    }

    console.log(`📤 Sending message to WhatsApp...`);
    console.log(`   To: ${recipient}`);
    console.log(`   Length: ${messageToSend.length} chars`);

    try {
      // Build WhatsApp API request
      const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: {
            body: messageToSend
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`WhatsApp API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();

      console.log('✅ Message sent successfully!');
      console.log(`   Message ID: ${data.messages[0].id}`);

      return {
        success: true,
        messageId: data.messages[0].id,
        recipient,
        messageLength: messageToSend.length,
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending message to WhatsApp:', error);

      // Return error but don't fail the workflow
      return {
        success: false,
        error: error.message,
        recipient,
        timestamp: new Date().toISOString()
      };
    }
  }
});
