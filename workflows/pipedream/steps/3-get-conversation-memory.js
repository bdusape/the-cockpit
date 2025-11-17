// Step 3: Get Conversation Memory
// Retrieves the conversation history for this user-agent combination
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.parse_message) {
      $.flow.exit('No parsed message');
    }

    const { from, agent, specialCommand } = steps.parse_message;

    // Handle special commands
    if (specialCommand === 'help') {
      const helpMessage = `🤖 *The Cockpit - Your AI Agent Team*

*Available Agents:*

📣 *@publicist* - PR, announcements, content creation
📈 *@growth* - Growth hacking, algorithms, virality
🧠 *@strategist* - Big decisions, pivots, strategy
🎬 *@content* - Video scripts, sponsorships
💳 *@credit* - Credit advice, financial planning

*Commands:*
• Type @agent to switch agents
• Type "help" to see this message
• Type "clear" to reset conversation

*Example:*
@publicist PropIQ hit 100 users!`;

      return {
        isSpecialCommand: true,
        responseMessage: helpMessage,
        from
      };
    }

    if (specialCommand === 'reset') {
      // Clear all agents for this user
      const agents = ['publicist', 'growth', 'strategist', 'content', 'credit'];

      for (const agentName of agents) {
        const key = `${from}:${agentName}`;
        try {
          await $.service.db.set(key, null);
        } catch (e) {
          // Ignore errors when clearing
        }
      }

      // Clear last active agent
      await $.service.db.set(`${from}:last_active`, null);

      return {
        isSpecialCommand: true,
        responseMessage: '✅ Conversation cleared! Which agent would you like to talk to?\n\nType "help" to see available agents.',
        from
      };
    }

    // Determine which agent to use
    let activeAgent = agent;

    if (!activeAgent) {
      // No agent specified, check last active agent
      const lastActive = await $.service.db.get(`${from}:last_active`);
      activeAgent = lastActive || 'publicist'; // Default to publicist
      console.log(`No agent specified, using last active: ${activeAgent}`);
    }

    // Get conversation history for this user-agent pair
    const memoryKey = `${from}:${activeAgent}`;
    let conversationHistory = await $.service.db.get(memoryKey) || [];

    // Ensure it's an array
    if (!Array.isArray(conversationHistory)) {
      conversationHistory = [];
    }

    // Keep only last 10 messages (5 exchanges)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    console.log(`📚 Memory retrieved for ${activeAgent}:`, {
      messageCount: conversationHistory.length,
      exchanges: conversationHistory.length / 2
    });

    // Save the last active agent
    await $.service.db.set(`${from}:last_active`, activeAgent);

    return {
      from,
      activeAgent,
      conversationHistory,
      memoryKey,
      isSpecialCommand: false
    };
  }
});
