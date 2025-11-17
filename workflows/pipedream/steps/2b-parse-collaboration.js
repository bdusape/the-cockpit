// Step 2b: Parse Agent Collaboration Commands
// Detects and handles multi-agent collaboration requests
// Insert this AFTER step 2 (parse-message) in your workflow

export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.parse_message) {
      $.flow.exit('No parsed message');
    }

    const { originalText, from, messageId } = steps.parse_message;

    // Check for collaboration syntax: @collaborate agent1 agent2 "task"
    // or @collab agent1 agent2 "task"
    const collaborationPattern = /^@(?:collaborate|collab)\s+@?(\w+)\s+@?(\w+)\s+(.+)$/i;
    const match = originalText.match(collaborationPattern);

    if (!match) {
      // Not a collaboration request, continue normal flow
      return {
        isCollaboration: false
      };
    }

    const [, agent1, agent2, task] = match;

    // Validate agents exist
    const validAgents = ['publicist', 'growth', 'strategist', 'content', 'credit'];

    if (!validAgents.includes(agent1.toLowerCase())) {
      return {
        isCollaboration: true,
        error: true,
        errorMessage: `Agent "${agent1}" not found. Available: ${validAgents.map(a => '@' + a).join(', ')}`
      };
    }

    if (!validAgents.includes(agent2.toLowerCase())) {
      return {
        isCollaboration: true,
        error: true,
        errorMessage: `Agent "${agent2}" not found. Available: ${validAgents.map(a => '@' + a).join(', ')}`
      };
    }

    console.log('🤝 Collaboration detected:', {
      agent1,
      agent2,
      task: task.substring(0, 50) + '...'
    });

    return {
      isCollaboration: true,
      error: false,
      agent1: agent1.toLowerCase(),
      agent2: agent2.toLowerCase(),
      task,
      from,
      messageId
    };
  }
});
