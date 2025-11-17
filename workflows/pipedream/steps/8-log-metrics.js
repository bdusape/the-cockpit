// Step 8: Log Metrics
// Tracks usage metrics for monitoring and analytics
export default defineComponent({
  async run({ steps, $ }) {
    // Skip if no Claude response
    if (!steps.call_claude) {
      return { logged: false };
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      user: steps.parse_message?.from,
      agent: steps.load_agent?.activeAgent,
      isSpecialCommand: steps.call_claude?.isSpecialCommand || false,
      isGreeting: steps.call_claude?.isGreeting || false,
      tokensUsed: steps.call_claude?.tokensUsed || 0,
      tokensIn: steps.call_claude?.tokensIn || 0,
      tokensOut: steps.call_claude?.tokensOut || 0,
      model: steps.call_claude?.model,
      queryLength: steps.parse_message?.query?.length || 0,
      replyLength: steps.call_claude?.reply?.length || 0,
      conversationDepth: steps.get_memory?.conversationHistory?.length || 0,
      success: steps.send_whatsapp?.success || false
    };

    // Calculate estimated cost
    // Claude Sonnet 4.5 pricing (as of Nov 2025):
    // Input: $3 per million tokens
    // Output: $15 per million tokens
    const costPerInputToken = 3 / 1_000_000;
    const costPerOutputToken = 15 / 1_000_000;

    const estimatedCost = (
      (metrics.tokensIn * costPerInputToken) +
      (metrics.tokensOut * costPerOutputToken)
    );

    metrics.estimatedCost = estimatedCost;

    console.log('📊 METRICS:', metrics);

    // Get daily stats
    const dailyStatsKey = `stats:daily:${metrics.date}`;
    const dailyStats = await $.service.db.get(dailyStatsKey) || {
      date: metrics.date,
      messages: 0,
      tokens: 0,
      cost: 0,
      agents: {}
    };

    // Update daily stats
    dailyStats.messages += 1;
    dailyStats.tokens += metrics.tokensUsed;
    dailyStats.cost += estimatedCost;

    // Track per-agent usage
    if (metrics.agent) {
      if (!dailyStats.agents[metrics.agent]) {
        dailyStats.agents[metrics.agent] = {
          messages: 0,
          tokens: 0,
          cost: 0
        };
      }
      dailyStats.agents[metrics.agent].messages += 1;
      dailyStats.agents[metrics.agent].tokens += metrics.tokensUsed;
      dailyStats.agents[metrics.agent].cost += estimatedCost;
    }

    // Save daily stats
    await $.service.db.set(dailyStatsKey, dailyStats);

    // Get monthly stats
    const month = metrics.date.substring(0, 7); // YYYY-MM
    const monthlyStatsKey = `stats:monthly:${month}`;
    const monthlyStats = await $.service.db.get(monthlyStatsKey) || {
      month,
      messages: 0,
      tokens: 0,
      cost: 0
    };

    monthlyStats.messages += 1;
    monthlyStats.tokens += metrics.tokensUsed;
    monthlyStats.cost += estimatedCost;

    await $.service.db.set(monthlyStatsKey, monthlyStats);

    console.log('📈 Daily stats:', dailyStats);
    console.log('📅 Monthly stats:', monthlyStats);

    return {
      logged: true,
      metrics,
      dailyStats,
      monthlyStats
    };
  }
});
