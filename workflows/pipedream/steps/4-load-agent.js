// Step 4: Load Agent Configuration
// Fetches the agent's system instructions from GitHub
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.get_memory) {
      $.flow.exit('No memory data');
    }

    // Skip if this is a special command
    if (steps.get_memory.isSpecialCommand) {
      return { isSpecialCommand: true };
    }

    const { activeAgent } = steps.get_memory;
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

    const filename = agentMap[activeAgent];

    if (!filename) {
      // Agent not found
      const availableAgents = Object.keys(agentMap).map(a => `@${a}`).join(', ');
      throw new Error(`Agent "${activeAgent}" not found. Available agents: ${availableAgents}`);
    }

    const url = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/agents/${filename}`;

    console.log(`📖 Loading agent: ${activeAgent} from ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load agent config: HTTP ${response.status} - ${response.statusText}`);
      }

      const agentInstructions = await response.text();

      console.log(`✅ Agent loaded successfully (${agentInstructions.length} characters)`);

      return {
        activeAgent,
        agentInstructions,
        isSpecialCommand: false
      };
    } catch (error) {
      console.error('❌ Error loading agent:', error);
      throw new Error(`Could not load agent "${activeAgent}". Please check your GitHub repository configuration.`);
    }
  }
});
