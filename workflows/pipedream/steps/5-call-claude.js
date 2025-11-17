// Step 5: Call Claude API
// Sends the prompt to Claude and gets the AI response
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.load_agent || !steps.parse_message || !steps.get_memory) {
      $.flow.exit('Missing required data');
    }

    // Skip if this is a special command
    if (steps.get_memory.isSpecialCommand) {
      return {
        isSpecialCommand: true,
        reply: steps.get_memory.responseMessage
      };
    }

    const { agentInstructions, activeAgent } = steps.load_agent;
    const { query, originalText } = steps.parse_message;
    const { conversationHistory } = steps.get_memory;

    // If user just typed the agent name with no query, send a greeting
    if (!query || query.trim().length === 0) {
      const greetingPrompt = "The user just activated you. Greet them warmly and ask how you can help them today. Keep it brief (2-3 sentences).";

      const messages = [
        {
          role: 'user',
          content: greetingPrompt
        }
      ];

      console.log('📨 Sending greeting request to Claude');

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          system: agentInstructions,
          messages
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('❌ Claude API error:', errorText);
        throw new Error(`Claude API error: ${claudeResponse.status} - ${claudeResponse.statusText}`);
      }

      const data = await claudeResponse.json();
      const reply = data.content[0].text;

      console.log('✅ Greeting generated:', {
        tokensIn: data.usage.input_tokens,
        tokensOut: data.usage.output_tokens,
        model: data.model
      });

      return {
        reply,
        tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
        model: data.model,
        isGreeting: true,
        userMessage: '', // No user message for greeting
        isSpecialCommand: false
      };
    }

    // Build messages array with conversation history
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: query
      }
    ];

    console.log('🤖 Calling Claude API:', {
      agent: activeAgent,
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
      historyMessages: conversationHistory.length,
      queryLength: query.length
    });

    try {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
          max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 4096,
          temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7,
          system: agentInstructions,
          messages
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('❌ Claude API error:', errorText);
        throw new Error(`Claude API error: ${claudeResponse.status} - ${claudeResponse.statusText}`);
      }

      const data = await claudeResponse.json();
      const reply = data.content[0].text;

      console.log('✅ Claude response received:', {
        tokensIn: data.usage.input_tokens,
        tokensOut: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        model: data.model,
        replyLength: reply.length
      });

      return {
        reply,
        tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
        tokensIn: data.usage.input_tokens,
        tokensOut: data.usage.output_tokens,
        model: data.model,
        isGreeting: false,
        userMessage: query,
        isSpecialCommand: false
      };

    } catch (error) {
      console.error('❌ Error calling Claude API:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }
});
