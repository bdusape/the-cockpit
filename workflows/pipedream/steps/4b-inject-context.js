// Step 4b: Inject Business Context into Agent
// Loads business-state.json and injects it into the agent's system prompt
// Insert this AFTER step 4 (load-agent) in your workflow

export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.load_agent) {
      $.flow.exit('No agent loaded');
    }

    // Skip if this is a special command or collaboration
    if (steps.load_agent.isSpecialCommand || steps.parse_collaboration?.isCollaboration) {
      return {
        agentInstructions: steps.load_agent.agentInstructions,
        contextInjected: false
      };
    }

    const { agentInstructions, activeAgent } = steps.load_agent;

    // Load business state from GitHub
    const username = process.env.GITHUB_USERNAME || 'briandusape';
    const repo = process.env.GITHUB_REPO || 'the-cockpit';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const contextUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/config/business-state.json`;

    console.log(`📊 Loading business context from: ${contextUrl}`);

    try {
      const response = await fetch(contextUrl);

      if (!response.ok) {
        console.log('⚠️ Business context not found, skipping injection');
        return {
          agentInstructions,
          contextInjected: false
        };
      }

      const businessState = await response.json();

      // Build context string
      const contextString = buildContextString(businessState);

      // Inject context into agent instructions
      const enhancedInstructions = agentInstructions + '\n\n' + contextString;

      console.log(`✅ Context injected (${contextString.length} characters)`);

      return {
        agentInstructions: enhancedInstructions,
        contextInjected: true,
        businessState,
        activeAgent
      };

    } catch (error) {
      console.error('❌ Error loading business context:', error);
      // Graceful fallback: use original instructions
      return {
        agentInstructions,
        contextInjected: false,
        error: error.message
      };
    }
  }
});

function buildContextString(state) {
  const today = new Date().toISOString().split('T')[0];

  let context = `\n---\n\n## CURRENT BUSINESS CONTEXT (Last Updated: ${state.lastUpdated})\n\n`;

  // Products and metrics
  context += `### Products:\n\n`;

  for (const [key, product] of Object.entries(state.products)) {
    context += `**${product.name}:**\n`;
    context += `- Status: ${product.status}\n`;

    if (product.metrics) {
      context += `- Current Metrics:\n`;
      for (const [metric, value] of Object.entries(product.metrics)) {
        context += `  - ${metric}: ${value}\n`;
      }
    }

    if (product.goals) {
      context += `- Goals: ${Object.values(product.goals).join(', ')}\n`;
    }

    context += '\n';
  }

  // Current priorities
  if (state.currentPriorities && state.currentPriorities.length > 0) {
    context += `### Current Priorities:\n`;
    state.currentPriorities.forEach((priority, i) => {
      context += `${i + 1}. ${priority}\n`;
    });
    context += '\n';
  }

  // Recent wins
  if (state.recentWins && state.recentWins.length > 0) {
    context += `### Recent Wins:\n`;
    state.recentWins.forEach(win => {
      context += `- ${win}\n`;
    });
    context += '\n';
  }

  // Upcoming milestones
  if (state.upcomingMilestones && state.upcomingMilestones.length > 0) {
    context += `### Upcoming Milestones:\n`;
    state.upcomingMilestones.forEach(milestone => {
      context += `- ${milestone}\n`;
    });
    context += '\n';
  }

  // Competitive positioning (relevant for publicist, growth, strategist)
  if (state.competitivePositioning) {
    context += `### Competitive Positioning:\n`;
    for (const [product, positioning] of Object.entries(state.competitivePositioning)) {
      if (positioning.uniqueFeatures) {
        context += `\n**${product} unique features:**\n`;
        positioning.uniqueFeatures.forEach(feature => {
          context += `- ${feature}\n`;
        });
      }
    }
    context += '\n';
  }

  context += `**IMPORTANT:** Use this current context when responding. Reference actual metrics, recent wins, and current priorities. Keep responses relevant to today (${today}).\n`;

  context += `\n---\n`;

  return context;
}
