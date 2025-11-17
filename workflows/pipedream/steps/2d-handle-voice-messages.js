// Step 2d: Handle Voice Messages
// Transcribes WhatsApp voice messages to text
// Insert this BEFORE step 2 (parse-message) to handle voice before text parsing

export default defineComponent({
  async run({ steps, $ }) {
    const body = steps.trigger.event.body;

    // Check if this is a voice/audio message
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return { isVoiceMessage: false };
    }

    const message = body.entry[0].changes[0].value.messages[0];
    const messageType = message.type;

    if (messageType !== 'audio') {
      return { isVoiceMessage: false };
    }

    console.log('🎤 Voice message received');

    const from = message.from;
    const messageId = message.id;
    const audioData = message.audio;

    // Get audio file URL from WhatsApp
    const audioId = audioData.id;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappToken = process.env.WHATSAPP_TOKEN;

    // Step 1: Get audio file URL from WhatsApp Media API
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v17.0/${audioId}`,
      {
        headers: {
          'Authorization': `Bearer ${whatsappToken}`
        }
      }
    );

    if (!mediaResponse.ok) {
      throw new Error(`Failed to get audio URL: ${mediaResponse.statusText}`);
    }

    const mediaData = await mediaResponse.json();
    const audioUrl = mediaData.url;

    console.log('📥 Audio URL retrieved');

    // Step 2: Download audio file
    const audioResponse = await fetch(audioUrl, {
      headers: {
        'Authorization': `Bearer ${whatsappToken}`
      }
    });

    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    console.log(`📦 Audio downloaded (${audioBuffer.byteLength} bytes)`);

    // Step 3: Transcribe using AssemblyAI (or alternative)
    // Note: You'll need to set ASSEMBLYAI_API_KEY in environment variables
    // Alternative: Use OpenAI Whisper API if you prefer

    const transcriptionService = process.env.TRANSCRIPTION_SERVICE || 'assemblyai'; // or 'openai'

    let transcription;

    if (transcriptionService === 'assemblyai') {
      transcription = await transcribeWithAssemblyAI(audioUrl, whatsappToken);
    } else if (transcriptionService === 'openai') {
      transcription = await transcribeWithOpenAI(audioBuffer);
    } else {
      throw new Error('No transcription service configured. Set TRANSCRIPTION_SERVICE to "assemblyai" or "openai"');
    }

    console.log(`✅ Transcription complete: "${transcription.substring(0, 50)}..."`);

    // Return transcribed text as if it was a text message
    // This will be processed by subsequent steps (parse-message, etc.)
    return {
      isVoiceMessage: true,
      from,
      messageId,
      transcription,
      audioUrl,
      audioDuration: audioData.duration || null,
      originalMessageType: 'audio'
    };
  }
});

// Transcription with AssemblyAI
async function transcribeWithAssemblyAI(audioUrl, whatsappToken) {
  const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;

  if (!assemblyAIKey) {
    throw new Error('ASSEMBLYAI_API_KEY not set. Get one from https://www.assemblyai.com/');
  }

  // Download audio with WhatsApp token
  const audioResponse = await fetch(audioUrl, {
    headers: { 'Authorization': `Bearer ${whatsappToken}` }
  });

  const audioBuffer = await audioResponse.arrayBuffer();

  // Upload to AssemblyAI
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'authorization': assemblyAIKey,
      'content-type': 'application/octet-stream'
    },
    body: audioBuffer
  });

  const { upload_url } = await uploadResponse.json();

  // Request transcription
  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': assemblyAIKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_code: 'en' // Change if needed
    })
  });

  const { id: transcriptId } = await transcriptResponse.json();

  // Poll for completion
  let transcript;
  while (true) {
    const pollingResponse = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: { 'authorization': assemblyAIKey }
      }
    );

    transcript = await pollingResponse.json();

    if (transcript.status === 'completed') {
      return transcript.text;
    } else if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    // Wait 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Transcription with OpenAI Whisper
async function transcribeWithOpenAI(audioBuffer) {
  const openAIKey = process.env.OPENAI_API_KEY;

  if (!openAIKey) {
    throw new Error('OPENAI_API_KEY not set. Get one from https://platform.openai.com/');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', new Blob([audioBuffer]), 'audio.ogg');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`OpenAI transcription failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}
