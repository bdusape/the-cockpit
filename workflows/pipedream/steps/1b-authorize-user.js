// Step 1b: Authorize User
// Checks if the user is authorized to use the bot
// Insert this AFTER step 1 (verify-webhook) and BEFORE step 2 (parse-message)

export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;

    // Skip for webhook verification
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return { authorized: true, skipped: true };
    }

    const message = body.entry[0].changes[0].value.messages[0];
    const from = message.from; // Phone number

    console.log(`🔐 Authorizing user: ${from}`);

    // Load team access config from GitHub
    const username = process.env.GITHUB_USERNAME || 'briandusape';
    const repo = process.env.GITHUB_REPO || 'the-cockpit';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const teamConfigUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/config/team-access.json`;

    try {
      const response = await fetch(teamConfigUrl);

      if (!response.ok) {
        console.log('⚠️ Team config not found, allowing all users');
        return {
          authorized: true,
          user: { phoneNumber: from, role: 'default' }
        };
      }

      const teamConfig = await response.json();
      const { users, team, usage } = teamConfig;

      // Check if user is in authorized users list
      const userEntry = Object.values(users).find(u => u.phoneNumber === from);

      if (!userEntry) {
        console.log(`❌ User ${from} not authorized`);

        // Send unauthorized message
        const unauthorizedMessage = `🚫 Access Denied\n\nYou are not authorized to use The Cockpit.\n\nIf you believe this is an error, please contact the team administrator.`;

        await sendWhatsAppMessage(from, unauthorizedMessage);

        $.flow.exit('User not authorized');
      }

      // Check if user is active
      if (!userEntry.isActive) {
        console.log(`❌ User ${from} is inactive`);

        const inactiveMessage = `🚫 Account Inactive\n\nYour access has been deactivated.\n\nPlease contact the team administrator.`;

        await sendWhatsAppMessage(from, inactiveMessage);

        $.flow.exit('User inactive');
      }

      // Check usage limits
      const currentMonth = new Date().toISOString().substring(0, 7);

      // Get user's message count for current month
      const userStatsKey = `usage:${from}:${currentMonth}`;
      const userStats = await $.service.db.get(userStatsKey) || { messages: 0 };

      // Check team-wide usage
      if (usage.messagesLimit && usage.messagesUsed >= usage.messagesLimit) {
        console.log(`⚠️ Team has reached monthly message limit`);

        const limitMessage = `⚠️ Monthly Limit Reached\n\nYour team has used ${usage.messagesUsed}/${usage.messagesLimit} messages this month.\n\nUpgrade your plan or wait until next month to continue.`;

        await sendWhatsAppMessage(from, limitMessage);

        $.flow.exit('Team message limit reached');
      }

      // Check user-specific limit (if set)
      if (userEntry.messageLimit && userStats.messages >= userEntry.messageLimit) {
        console.log(`⚠️ User ${from} has reached personal message limit`);

        const userLimitMessage = `⚠️ Personal Limit Reached\n\nYou've used ${userStats.messages}/${userEntry.messageLimit} messages this month.\n\nContact your team admin for more access.`;

        await sendWhatsAppMessage(from, userLimitMessage);

        $.flow.exit('User message limit reached');
      }

      console.log(`✅ User authorized: ${userEntry.name} (${userEntry.role})`);

      // Increment usage
      userStats.messages += 1;
      await $.service.db.set(userStatsKey, userStats);

      return {
        authorized: true,
        user: userEntry,
        usage: {
          userMessages: userStats.messages,
          userLimit: userEntry.messageLimit || 'unlimited',
          teamMessages: usage.messagesUsed + 1,
          teamLimit: usage.messagesLimit
        },
        team: team.name,
        plan: team.plan
      };

    } catch (error) {
      console.error('Error checking authorization:', error);

      // Fail open: allow user if can't load config
      return {
        authorized: true,
        user: { phoneNumber: from, role: 'default' },
        error: error.message
      };
    }
  }
});

async function sendWhatsAppMessage(to, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const whatsappToken = process.env.WHATSAPP_TOKEN;

  await fetch(
    `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      })
    }
  );
}
