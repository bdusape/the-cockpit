// Step 2f: Handle Admin Commands
// Processes admin commands like /invite, /users, /stats
// Insert this AFTER step 1b (authorize-user) in your workflow

export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.authorize_user?.authorized) {
      return { isAdminCommand: false };
    }

    const body = steps.trigger.event.body;
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return { isAdminCommand: false };
    }

    const message = body.entry[0].changes[0].value.messages[0];
    const text = message.text?.body || '';
    const from = message.from;
    const user = steps.authorize_user.user;

    // Check if this is an admin command
    if (!text.startsWith('/admin')) {
      return { isAdminCommand: false };
    }

    console.log('⚙️ Admin command detected');

    // Check if user has admin permissions
    const isAdmin = user.role === 'owner' || user.role === 'admin';

    if (!isAdmin) {
      return {
        isAdminCommand: true,
        error: true,
        responseMessage: '🚫 You do not have admin permissions.'
      };
    }

    // Parse admin command
    const parts = text.split(/\s+/);
    const command = parts[1]?.toLowerCase();

    // Load team config
    const username = process.env.GITHUB_USERNAME || 'briandusape';
    const repo = process.env.GITHUB_REPO || 'the-cockpit';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const teamConfigUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/config/team-access.json`;
    const response = await fetch(teamConfigUrl);
    const teamConfig = await response.json();

    let responseMessage;

    switch (command) {
      case 'users':
        responseMessage = buildUsersListMessage(teamConfig);
        break;

      case 'stats':
        responseMessage = await buildStatsMessage(teamConfig, $);
        break;

      case 'plan':
        responseMessage = buildPlanMessage(teamConfig);
        break;

      case 'help':
      default:
        responseMessage = buildAdminHelpMessage();
        break;
    }

    return {
      isAdminCommand: true,
      error: false,
      responseMessage,
      from
    };
  }
});

function buildUsersListMessage(config) {
  const { users, team } = config;

  let message = `👥 **Team Users** (${team.name})\n\n`;

  Object.entries(users).forEach(([key, user]) => {
    const status = user.isActive ? '✅' : '❌';
    message += `${status} **${user.name}**\n`;
    message += `   Role: ${user.role}\n`;
    message += `   Phone: ${user.phoneNumber}\n`;
    message += `   Limit: ${user.messageLimit || 'unlimited'} messages/month\n\n`;
  });

  return message;
}

async function buildStatsMessage(config, $) {
  const { usage, team } = config;
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Get total stats from Pipedream data store
  const monthlyStatsKey = `stats:monthly:${currentMonth}`;
  const monthlyStats = await $.service.db.get(monthlyStatsKey) || {
    messages: 0,
    tokens: 0,
    cost: 0
  };

  let message = `📊 **Usage Statistics**\n\n`;
  message += `**Plan:** ${team.plan}\n`;
  message += `**Period:** ${currentMonth}\n\n`;

  message += `**Messages:**\n`;
  message += `   Used: ${monthlyStats.messages}\n`;
  message += `   Limit: ${usage.messagesLimit || 'unlimited'}\n`;
  message += `   Remaining: ${usage.messagesLimit ? usage.messagesLimit - monthlyStats.messages : '∞'}\n\n`;

  message += `**Costs:**\n`;
  message += `   Tokens: ${monthlyStats.tokens?.toLocaleString() || 0}\n`;
  message += `   Estimated: $${monthlyStats.cost?.toFixed(2) || '0.00'}\n\n`;

  const percentUsed = usage.messagesLimit
    ? ((monthlyStats.messages / usage.messagesLimit) * 100).toFixed(1)
    : 0;

  message += `**Progress:** ${percentUsed}% of monthly limit used`;

  return message;
}

function buildPlanMessage(config) {
  const { team, plans } = config;
  const currentPlan = plans[team.plan];

  let message = `💳 **Current Plan**\n\n`;
  message += `**${currentPlan.name}**\n`;

  if (currentPlan.price) {
    message += `Price: $${currentPlan.price}/month\n`;
  } else {
    message += `Price: Free\n`;
  }

  message += `Max Users: ${currentPlan.maxUsers}\n`;
  message += `Messages/Month: ${currentPlan.maxMessagesPerMonth}\n\n`;

  message += `**Features:**\n`;
  currentPlan.features.forEach(feature => {
    message += `✅ ${feature.replace(/_/g, ' ')}\n`;
  });

  return message;
}

function buildAdminHelpMessage() {
  return `⚙️ **Admin Commands**\n\n` +
    `\`/admin users\` - List all team members\n` +
    `\`/admin stats\` - View usage statistics\n` +
    `\`/admin plan\` - View current plan details\n` +
    `\`/admin help\` - Show this message\n\n` +
    `**Note:** To invite users or manage billing, update the team-access.json file in your repository.`;
}
