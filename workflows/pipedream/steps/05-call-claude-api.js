/**
 * Step 5: Call Claude API
 *
 * Sends the user's query to Claude with the agent's system instructions.
 *
 * Phase 1 (MVP): Single-turn conversations
 * Phase 2: Add conversation memory for multi-turn conversations
 *
 * Uses Claude Sonnet 4.5 by default (configurable via env var)
 */

export default defineComponent({
  async run({ steps, $ }) {
    const parsed = steps.parse_message;
    const agentConfig = steps.load_agent_config;
    const specialCommand = steps.handle_special_commands;

    // Skip if special command was handled
    if (specialCommand?.isSpecialCommand) {
      console.log('⏭️ Skipping Claude API call (special command handled)');
      $.flow.exit('Special command handled');
      return null;
    }

    // Skip if no message to process
    if (!parsed || !agentConfig) {
      $.flow.exit('No message or agent config');
      return null;
    }

    // Check if there was an error loading the agent
    if (agentConfig.error) {
      console.error('❌ Cannot call Claude API: Agent config load failed');
      return {
        error: true,
        errorType: 'agent_load_error',
        errorMessage: agentConfig.error
      };
    }

    const query = parsed.query;
    const agentInstructions = agentConfig.instructions;

    // Configuration
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';
    const CLAUDE_MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS) || 4096;

    // Validate API key exists
    if (!CLAUDE_API_KEY) {
      console.error('❌ CLAUDE_API_KEY not set in environment variables');
      return {
        error: true,
        errorType: 'missing_api_key',
        errorMessage: 'Claude API key not configured'
      };
    }

    console.log(`🤖 Calling Claude API...`);
    console.log(`   Model: ${CLAUDE_MODEL}`);
    console.log(`   Max tokens: ${CLAUDE_MAX_TOKENS}`);
    console.log(`   Query length: ${query.length} chars`);

    try {
      // Build the request payload
      const requestBody = {
        model: CLAUDE_MODEL,
        max_tokens: CLAUDE_MAX_TOKENS,
        system: agentInstructions,
        messages: [
          {
            role: 'user',
            content: query
          }
        ]
      };

      // Phase 2: Add conversation memory here
      // requestBody.messages = [...conversationHistory, { role: 'user', content: query }];

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Claude API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();

      // Extract the response text
      const assistantReply = data.content[0].text;

      // Log usage stats
      const inputTokens = data.usage.input_tokens;
      const outputTokens = data.usage.output_tokens;
      const totalTokens = inputTokens + outputTokens;

      console.log(`✅ Claude API response received`);
      console.log(`   Input tokens: ${inputTokens.toLocaleString()}`);
      console.log(`   Output tokens: ${outputTokens.toLocaleString()}`);
      console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
      console.log(`   Response length: ${assistantReply.length} chars`);

      // Estimate cost (approximate)
      // Sonnet 4.5: $3/MTok input, $15/MTok output
      const costPerMillionInput = 3.00;
      const costPerMillionOutput = 15.00;
      const estimatedCost =
        (inputTokens / 1_000_000 * costPerMillionInput) +
        (outputTokens / 1_000_000 * costPerMillionOutput);

      console.log(`   Estimated cost: $${estimatedCost.toFixed(4)}`);

      return {
        reply: assistantReply,
        model: CLAUDE_MODEL,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens
        },
        estimatedCost,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error calling Claude API:', error);

      return {
        error: true,
        errorType: 'claude_api_error',
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
});
