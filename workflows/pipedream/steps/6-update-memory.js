// Step 6: Update Conversation Memory
// Saves the user message and assistant response to conversation history
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.call_claude || !steps.get_memory) {
      $.flow.exit('Missing required data');
    }

    // Skip if this is a special command
    if (steps.call_claude.isSpecialCommand) {
      return { isSpecialCommand: true };
    }

    const { reply, userMessage, isGreeting } = steps.call_claude;
    const { memoryKey, conversationHistory } = steps.get_memory;

    // Don't save greetings to memory (they're just activation messages)
    if (isGreeting) {
      console.log('Skipping memory save for greeting message');
      return {
        memorySaved: false,
        reason: 'greeting'
      };
    }

    // Add new messages to history
    const updatedHistory = [
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      },
      {
        role: 'assistant',
        content: reply
      }
    ];

    // Keep only last 10 messages (5 exchanges)
    const trimmedHistory = updatedHistory.slice(-10);

    // Save to Pipedream Data Store
    await $.service.db.set(memoryKey, trimmedHistory);

    console.log('💾 Memory updated:', {
      key: memoryKey,
      totalMessages: trimmedHistory.length,
      exchanges: trimmedHistory.length / 2
    });

    return {
      memorySaved: true,
      messageCount: trimmedHistory.length,
      exchanges: trimmedHistory.length / 2
    };
  }
});
