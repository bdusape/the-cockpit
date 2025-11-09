/**
 * Step 1: Verify WhatsApp Webhook
 *
 * This step handles Meta's webhook verification challenge.
 * When you first configure the webhook in Meta Developer Console,
 * Meta sends a GET request with verification parameters.
 *
 * This step validates the verify token and responds with the challenge.
 */

export default defineComponent({
  async run({ steps, $ }) {
    // Check if this is a verification request (GET request with hub.mode)
    const mode = steps.trigger.event.query?.['hub.mode'];
    const token = steps.trigger.event.query?.['hub.verify_token'];
    const challenge = steps.trigger.event.query?.['hub.challenge'];

    // If this is a verification request
    if (mode && token && challenge) {
      const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully!');

        // Respond with the challenge to verify the webhook
        $.respond({
          status: 200,
          headers: {
            'Content-Type': 'text/plain'
          },
          body: parseInt(challenge)
        });

        // Exit the workflow (verification only, no further processing needed)
        $.flow.exit();
      } else {
        console.log('❌ Verification failed: Invalid token');

        $.respond({
          status: 403,
          body: 'Forbidden: Invalid verification token'
        });

        $.flow.exit();
      }
    }

    // If not a verification request, continue to next step
    console.log('📨 Processing incoming message...');
    return {
      isVerification: false
    };
  }
});
