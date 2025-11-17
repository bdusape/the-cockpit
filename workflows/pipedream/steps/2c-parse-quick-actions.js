// Step 2c: Parse Quick Actions
// Detects and handles quick action commands like /weekly-review, /content-blast
// Insert this AFTER step 2 (parse-message) in your workflow

export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.parse_message) {
      $.flow.exit('No parsed message');
    }

    const { originalText, from, messageId } = steps.parse_message;

    // Check if this is a quick action (starts with /)
    if (!originalText.startsWith('/')) {
      return {
        isQuickAction: false
      };
    }

    // Load quick actions config from GitHub
    const username = process.env.GITHUB_USERNAME || 'briandusape';
    const repo = process.env.GITHUB_REPO || 'the-cockpit';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const configUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/config/quick-actions.json`;

    try {
      const response = await fetch(configUrl);
      if (!response.ok) {
        return {
          isQuickAction: false
        };
      }

      const config = await response.json();
      const { quickActions } = config;

      // Check for /actions or /help command
      if (originalText.toLowerCase() === '/actions' || originalText.toLowerCase() === '/help') {
        const helpMessage = buildHelpMessage(quickActions);
        return {
          isQuickAction: true,
          isHelp: true,
          from,
          messageId,
          responseMessage: helpMessage
        };
      }

      // Parse quick action command
      // Format: /action-name [optional input]
      const parts = originalText.slice(1).split(/\s+(.+)/); // Split on first space
      const actionName = parts[0].toLowerCase();
      const userInput = parts[1] || '';

      // Find matching action
      const action = quickActions[actionName];

      if (!action) {
        return {
          isQuickAction: true,
          error: true,
          errorMessage: `Quick action "/${actionName}" not found.\n\nType /actions to see all available quick actions.`
        };
      }

      console.log(`⚡ Quick action triggered: /${actionName}`);

      // If action requires input but none provided, ask for it
      if (action.requiresInput && !userInput) {
        return {
          isQuickAction: true,
          error: false,
          needsInput: true,
          actionName,
          responseMessage: `${action.emoji} **${action.name}**\n\n${action.prompt}`
        };
      }

      // Build the full prompt
      let fullPrompt = action.prompt;

      if (userInput && action.requiresInput) {
        fullPrompt += `\n\n${userInput}`;
      }

      return {
        isQuickAction: true,
        error: false,
        needsInput: false,
        actionName,
        action,
        agent: action.agent,
        prompt: fullPrompt,
        from,
        messageId,
        isCollaboration: action.agent === 'collaborate',
        collaborateAgents: action.collaborateAgents || []
      };

    } catch (error) {
      console.error('Error loading quick actions:', error);
      return {
        isQuickAction: false
      };
    }
  }
});

function buildHelpMessage(quickActions) {
  let message = `⚡ **Quick Actions**\n\nTrigger powerful workflows with a single command:\n\n`;

  const categories = {
    'Strategy & Planning': ['weekly-review', 'monthly-goals', 'pricing-analysis', 'launch-plan'],
    'Content Creation': ['content-blast', 'content-repurpose', 'announcement'],
    'Growth & Marketing': ['growth-audit', 'viral-breakdown', 'competitor-analysis']
  };

  for (const [category, actions] of Object.entries(categories)) {
    message += `**${category}:**\n`;

    actions.forEach(actionKey => {
      const action = quickActions[actionKey];
      if (action) {
        message += `${action.emoji} \`/${actionKey}\` - ${action.description}\n`;
      }
    });

    message += '\n';
  }

  message += `**Usage:**\n`;
  message += `• Type \`/action-name\` to trigger\n`;
  message += `• Some actions require input (they'll prompt you)\n`;
  message += `• Type \`/actions\` to see this list again\n\n`;

  message += `**Example:**\n\`/weekly-review\` → Strategist guides you through a weekly review`;

  return message;
}
