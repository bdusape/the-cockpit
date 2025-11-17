/**
 * Pipedream Metrics Logger Step
 *
 * Add this as the final step in your Pipedream workflow to log metrics
 * Priority: 🟡 MEDIUM
 */

export default defineComponent({
  name: "Metrics Logger",
  description: "Logs conversation metrics for monitoring and cost tracking",
  async run({ steps, $ }) {
    const metrics = {
      // Timestamp
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],

      // User info
      user_phone: steps.webhook.entry[0].changes[0].value.messages[0].from,

      // Agent info
      agent: steps.parse_message?.agent || 'unknown',
      agent_valid: steps.validate_agent?.is_valid || false,

      // Message info
      query_length: steps.webhook.entry[0].changes[0].value.messages[0].text?.body?.length || 0,

      // Claude API metrics (if successful)
      claude_called: !!steps.claude_api_call,
      model: steps.claude_api_call?.model || null,
      tokens_input: steps.claude_api_call?.usage?.input_tokens || 0,
      tokens_output: steps.claude_api_call?.usage?.output_tokens || 0,
      tokens_total: (steps.claude_api_call?.usage?.input_tokens || 0) + (steps.claude_api_call?.usage?.output_tokens || 0),

      // Cost calculation (claude-sonnet-4-5 pricing)
      cost_input_usd: (steps.claude_api_call?.usage?.input_tokens || 0) * 0.000003, // $3 per 1M tokens
      cost_output_usd: (steps.claude_api_call?.usage?.output_tokens || 0) * 0.000015, // $15 per 1M tokens
      cost_total_usd: ((steps.claude_api_call?.usage?.input_tokens || 0) * 0.000003) +
                      ((steps.claude_api_call?.usage?.output_tokens || 0) * 0.000015),

      // Response info
      response_length: steps.claude_api_call?.content?.[0]?.text?.length || 0,

      // Performance
      latency_ms: steps.claude_api_call ?
        new Date(steps.claude_api_call.$timestamp).getTime() - new Date(steps.webhook.$timestamp).getTime() :
        null,

      // Status
      status: steps.error_handler?.status || 'success',
      errors: steps.error_handler?.errors || [],

      // Workflow metadata
      workflow_id: steps.trigger.context?.id,
      execution_id: steps.trigger.event?.id,
    };

    // Log to console (viewable in Pipedream logs)
    console.log('📊 METRICS:', JSON.stringify(metrics, null, 2));

    // Optional: Send to external analytics
    // Examples:
    // - PostHog: await $.send.http({ url: 'https://app.posthog.com/capture/', method: 'POST', data: metrics });
    // - Mixpanel: await $.send.http({ url: 'https://api.mixpanel.com/track', method: 'POST', data: metrics });
    // - Custom webhook: await $.send.http({ url: process.env.ANALYTICS_WEBHOOK, method: 'POST', data: metrics });

    // Store in Pipedream Data Store for aggregation
    // await this.$data.push(metrics);

    return metrics;
  },
});
