// Step 2e: Merge Voice Message to Text Flow
// Converts voice message transcription into standard text message format
// Insert this AFTER step 2d (handle-voice-messages) and BEFORE step 2 (parse-message)

export default defineComponent({
  async run({ steps, $ }) {
    // If this was a voice message, merge transcription into message flow
    if (steps.handle_voice_messages?.isVoiceMessage) {
      const { from, messageId, transcription, audioDuration } = steps.handle_voice_messages;

      console.log('🎤 Converting voice to text message format');

      // Create a synthetic message event that looks like a text message
      // This allows the rest of the workflow to process it normally
      const syntheticMessage = {
        from,
        id: messageId,
        timestamp: Date.now().toString(),
        text: {
          body: transcription
        },
        type: 'text',
        _originalType: 'audio',
        _audioDuration: audioDuration,
        _wasTranscribed: true
      };

      // Override the trigger event body so parse-message step sees this as text
      return {
        isVoiceMessage: true,
        message: syntheticMessage,
        transcription,
        from
      };
    }

    return {
      isVoiceMessage: false
    };
  }
});
