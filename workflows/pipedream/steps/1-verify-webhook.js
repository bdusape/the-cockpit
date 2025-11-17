// Step 1: Verify WhatsApp Webhook
// This handles Meta's webhook verification challenge
export default defineComponent({
  async run({ steps, $ }) {
    // Check if this is a verification request from Meta
    const mode = steps.trigger.event.query?.['hub.mode'];
    const token = steps.trigger.event.query?.['hub.verify_token'];
    const challenge = steps.trigger.event.query?.['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    // If this is a verification request
    if (mode && token) {
      console.log('Webhook verification request received');

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully!');

        // Respond with the challenge to verify the webhook
        $.respond({
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
          body: parseInt(challenge)
        });

        // Stop execution here for verification requests
        $.flow.exit('Webhook verification complete');
      } else {
        console.log('❌ Verification failed - token mismatch');
        $.respond({
          status: 403,
          body: 'Verification failed'
        });
        $.flow.exit('Verification failed');
      }
    }

    // If we get here, this is a normal message event, continue to next step
    console.log('Normal message event, continuing to parse...');
    return { verified: true };
  }
});
