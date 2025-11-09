/**
 * Step 3: Handle Special Commands
 *
 * Processes system commands like:
 * - help: Show available agents
 * - agents: List all agents
 * - clear/reset: Clear conversation memory
 * - status: Show current active agent
 *
 * If not a special command, this step passes through to agent loading.
 */

export default defineComponent({
  async run({ steps, $ }) {
    const parsed = steps.parse_message;

    // Skip if no parsed message
    if (!parsed) {
      $.flow.exit('No message to process');
      return null;
    }

    // If not a special command, continue to next step
    if (!parsed.isSpecialCommand) {
      return {
        isSpecialCommand: false,
        shouldContinue: true
      };
    }

    console.log(`🔧 Handling special command: ${parsed.query}`);

    let response;

    switch (parsed.query) {
      case 'help':
      case 'agents':
        response = `🤖 **The Cockpit - Available Agents**

Send a message with an agent trigger to get started:

📣 **@publicist** - PR & announcements
Help with product launches, milestones, content creation

📈 **@growth** - Growth & virality tactics
Algorithm optimization, platform growth strategies

🧠 **@strategist** - Strategic decisions
Big business decisions, pivots, ROI analysis

🎬 **@content** - Content creation
Video scripts, sponsorships, monetization

💳 **@credit** - Financial advice
Credit scores, debt management, financial planning

**Example:** "@publicist PropIQ hit 100 users!"

**Special commands:**
• help - Show this message
• clear - Clear conversation memory
• status - Show current agent`;
        break;

      case 'clear':
      case 'reset':
        // Phase 2: Clear conversation memory from database
        response = `🔄 **Conversation cleared**

Your conversation history has been reset.
Which agent would you like to talk to?

Try: @publicist, @growth, @strategist, @content, or @credit`;
        break;

      case 'status':
        response = `📊 **Status**

**Active:** Ready to chat!
**Available agents:** 5 (publicist, growth, strategist, content, credit)

Send @[agent] to start a conversation.`;
        break;

      default:
        response = `❓ Unknown command: ${parsed.query}

Type "help" to see available commands and agents.`;
    }

    console.log(`✅ Special command handled: ${parsed.query}`);

    return {
      isSpecialCommand: true,
      shouldContinue: false,
      response,
      from: parsed.from
    };
  }
});
