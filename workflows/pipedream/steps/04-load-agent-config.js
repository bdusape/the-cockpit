/**
 * Step 4: Load Agent Configuration
 *
 * Fetches the agent's system instructions from GitHub.
 * Each agent is defined in a markdown file (e.g., agents/publicist.md).
 *
 * The agent file contains:
 * - Role and personality
 * - Core responsibilities
 * - Knowledge base
 * - Output format guidelines
 * - Constraints
 */

export default defineComponent({
  async run({ steps, $ }) {
    const parsed = steps.parse_message;
    const specialCommand = steps.handle_special_commands;

    // Skip if special command was handled
    if (specialCommand?.isSpecialCommand) {
      console.log('⏭️ Skipping agent load (special command handled)');
      $.flow.exit('Special command handled');
      return null;
    }

    // Skip if no message to process
    if (!parsed) {
      $.flow.exit('No message to process');
      return null;
    }

    const agent = parsed.agent;
    const username = process.env.GITHUB_USERNAME || 'briandusape';
    const repo = process.env.GITHUB_REPO || 'the-cockpit';
    const branch = process.env.GITHUB_BRANCH || 'main';

    // Map agent triggers to filenames
    const agentMap = {
      'publicist': 'publicist.md',
      'growth': 'growth-hacker.md',
      'strategist': 'strategist.md',
      'content': 'content-strategist.md',
      'credit': 'credit-advisor.md'
    };

    // Determine which agent to use
    let agentFilename;
    let agentName;

    if (agent && agentMap[agent]) {
      // Explicit agent trigger was used
      agentFilename = agentMap[agent];
      agentName = agent;
    } else if (agent) {
      // Unknown agent trigger - inform user and use default
      console.log(`⚠️ Unknown agent: ${agent}, using publicist as default`);
      agentFilename = agentMap['publicist'];
      agentName = 'publicist';
    } else {
      // No agent specified - check for last active agent
      // Phase 2: Load from conversation memory
      // For now, default to publicist
      console.log('ℹ️ No agent specified, defaulting to publicist');
      agentFilename = agentMap['publicist'];
      agentName = 'publicist';
    }

    // Construct GitHub raw content URL
    const url = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/agents/${agentFilename}`;

    console.log(`📚 Loading agent config: ${agentName}`);
    console.log(`🔗 URL: ${url}`);

    try {
      // Fetch agent instructions from GitHub
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load agent config: ${response.status} ${response.statusText}`);
      }

      const agentInstructions = await response.text();

      // Validate that we got content
      if (!agentInstructions || agentInstructions.length < 100) {
        throw new Error('Agent config file is empty or too short');
      }

      console.log(`✅ Agent config loaded: ${agentInstructions.length} characters`);

      return {
        agent: agentName,
        agentFilename,
        instructions: agentInstructions,
        instructionsLength: agentInstructions.length,
        loadedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error loading agent config:', error);

      // Return error info - will be handled in response step
      return {
        agent: agentName,
        error: error.message,
        errorType: 'agent_load_error'
      };
    }
  }
});
