/**
 * Pipedream Authorization Check Step
 *
 * Add this as the FIRST step in your Pipedream workflow to validate users
 * Priority: 🔴 CRITICAL
 */

export default defineComponent({
  name: "Authorization Check",
  description: "Validates user is authorized to use the service",
  async run({ steps, $ }) {
    const incomingMessage = steps.webhook.entry[0].changes[0].value.messages[0];
    const userPhone = incomingMessage.from; // Phone number without +

    // Get authorized users from environment variable
    const authorizedUsers = (process.env.AUTHORIZED_USERS || '').split(',').map(num => num.trim());

    console.log('🔐 Authorization Check');
    console.log('User:', userPhone);
    console.log('Authorized Users:', authorizedUsers);

    // Check if user is authorized
    const isAuthorized = authorizedUsers.includes(userPhone) ||
                        authorizedUsers.includes(`+${userPhone}`);

    if (!isAuthorized) {
      console.warn('⚠️ UNAUTHORIZED ACCESS ATTEMPT:', userPhone);

      // Log security event
      const securityEvent = {
        timestamp: new Date().toISOString(),
        type: 'unauthorized_access',
        user_phone: userPhone,
        message: incomingMessage.text?.body,
        workflow_id: steps.trigger.context?.id,
      };

      console.error('🚨 SECURITY EVENT:', JSON.stringify(securityEvent));

      // Optional: Send alert to admin
      // await $.send.email({
      //   to: process.env.ADMIN_EMAIL,
      //   subject: '🚨 Unauthorized Access Attempt',
      //   body: JSON.stringify(securityEvent, null, 2)
      // });

      // Send rejection message to user
      const rejectionMessage = `⛔ Unauthorized. This service is private.\n\nIf you believe this is an error, please contact the administrator.`;

      await $.send.http({
        url: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: {
          messaging_product: 'whatsapp',
          to: userPhone,
          type: 'text',
          text: { body: rejectionMessage },
        },
      });

      // Exit workflow (don't process further)
      $.flow.exit('Unauthorized user - workflow terminated');
    }

    console.log('✅ User authorized');

    return {
      authorized: true,
      user_phone: userPhone,
    };
  },
});
