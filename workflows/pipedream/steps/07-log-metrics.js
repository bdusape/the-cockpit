/**
 * Step 7: Log Metrics (Optional)
 *
 * Tracks usage metrics for monitoring and cost estimation:
 * - Messages processed
 * - Tokens used
 * - Estimated costs
 * - Response times
 * - Errors
 *
 * Phase 1: Simple console logging
 * Phase 2: Send to analytics service (e.g., PostHog, Mixpanel)
 */

export default defineComponent({
  async run({ steps, $ }) {
    const parsed = steps.parse_message;
    const agentConfig = steps.load_agent_config;
    const claudeResponse = steps.call_claude_api;
    const whatsappResponse = steps.send_whatsapp_response;
    const specialCommand = steps.handle_special_commands;

    // Skip if no message was processed
    if (!parsed) {
      console.log('⏭️ No message to log');
      return null;
    }

    // Calculate response time
    const startTime = new Date(parsed.timestamp);
    const endTime = new Date();
    const responseTimeMs = endTime - startTime;

    // Build metrics object
    const metrics = {
      timestamp: new Date().toISOString(),
      user: parsed.from,
      agent: agentConfig?.agent || 'unknown',
      messageType: parsed.messageType,
      isSpecialCommand: parsed.isSpecialCommand || false,
      responseTime: {
        milliseconds: responseTimeMs,
        seconds: (responseTimeMs / 1000).toFixed(2)
      },
      success: whatsappResponse?.success || false
    };

    // Add Claude API metrics if available
    if (claudeResponse && !claudeResponse.error) {
      metrics.claude = {
        model: claudeResponse.model,
        tokensUsed: claudeResponse.usage.totalTokens,
        inputTokens: claudeResponse.usage.inputTokens,
        outputTokens: claudeResponse.usage.outputTokens,
        estimatedCost: claudeResponse.estimatedCost
      };
    }

    // Add error info if applicable
    if (claudeResponse?.error) {
      metrics.error = {
        type: claudeResponse.errorType,
        message: claudeResponse.errorMessage
      };
    }

    // Log metrics to console
    console.log('📊 ===== METRICS SUMMARY =====');
    console.log(`   User: ${metrics.user}`);
    console.log(`   Agent: ${metrics.agent}`);
    console.log(`   Response time: ${metrics.responseTime.seconds}s`);

    if (metrics.claude) {
      console.log(`   Tokens used: ${metrics.claude.tokensUsed.toLocaleString()}`);
      console.log(`   Estimated cost: $${metrics.claude.estimatedCost.toFixed(4)}`);
    }

    console.log(`   Success: ${metrics.success ? '✅' : '❌'}`);

    if (metrics.error) {
      console.log(`   Error: ${metrics.error.type} - ${metrics.error.message}`);
    }

    console.log('========================');

    // Phase 2: Send to analytics service
    // Example:
    // await fetch('https://your-analytics-endpoint.com/track', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metrics)
    // });

    return metrics;
  }
});
