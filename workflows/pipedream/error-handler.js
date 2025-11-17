/**
 * Pipedream Error Handler Step
 *
 * Add this as a step in your Pipedream workflow to catch and handle errors
 * Priority: 🟡 MEDIUM
 */

export default defineComponent({
  name: "Error Handler",
  description: "Catches errors and sends alerts",
  async run({ steps, $ }) {
    const errors = [];

    // Check for errors in previous steps
    if (steps.claude_api_call?.$error) {
      errors.push({
        step: 'claude_api_call',
        error: steps.claude_api_call.$error.message,
        type: 'claude_api_error',
      });
    }

    if (steps.send_whatsapp_message?.$error) {
      errors.push({
        step: 'send_whatsapp_message',
        error: steps.send_whatsapp_message.$error.message,
        type: 'whatsapp_api_error',
      });
    }

    if (steps.fetch_agent_config?.$error) {
      errors.push({
        step: 'fetch_agent_config',
        error: steps.fetch_agent_config.$error.message,
        type: 'github_fetch_error',
      });
    }

    // If errors exist, handle them
    if (errors.length > 0) {
      console.error('🚨 ERRORS DETECTED:', JSON.stringify(errors, null, 2));

      // Send email alert to admin
      const emailBody = `
🚨 The Cockpit Error Alert

Timestamp: ${new Date().toISOString()}
User: ${steps.webhook.entry[0].changes[0].value.messages[0].from}
Agent: ${steps.parse_message?.agent || 'unknown'}

Errors:
${errors.map(e => `- ${e.step}: ${e.error}`).join('\n')}

Workflow ID: ${steps.trigger.context.id}
View logs: https://pipedream.com/sources/${process.env.PIPEDREAM_SOURCE_ID}
      `;

      // Send via email (configure your email service)
      // await $.send.email({ to: process.env.ADMIN_EMAIL, subject: '🚨 The Cockpit Error', body: emailBody });

      // Log for monitoring
      console.log('EMAIL_ALERT:', emailBody);

      // Send graceful error message to user
      const errorMessage = errors[0].type === 'claude_api_error'
        ? '⚠️ Our AI is temporarily unavailable. Please try again in a few minutes.'
        : errors[0].type === 'whatsapp_api_error'
        ? '⚠️ Message delivery failed. We\'ve been notified and will investigate.'
        : '⚠️ Something went wrong. Our team has been notified.';

      // Return error response
      return {
        status: 'error',
        errors,
        user_message: errorMessage,
        send_to_user: true,
      };
    }

    return {
      status: 'success',
      errors: [],
    };
  },
});
