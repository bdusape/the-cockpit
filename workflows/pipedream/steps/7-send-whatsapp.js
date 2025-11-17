// Step 7: Send Response to WhatsApp
// Delivers the AI response back to the user via WhatsApp
export default defineComponent({
  async run({ steps, $ }) {
    if (!steps.call_claude || !steps.parse_message) {
      $.flow.exit('Missing required data');
    }

    const { reply } = steps.call_claude;
    const { from } = steps.parse_message;

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappToken = process.env.WHATSAPP_TOKEN;

    if (!phoneNumberId || !whatsappToken) {
      throw new Error('WhatsApp credentials not configured. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TOKEN environment variables.');
    }

    console.log('📤 Sending response to WhatsApp:', {
      to: from,
      messageLength: reply.length
    });

    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            type: 'text',
            text: {
              body: reply
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ WhatsApp API error:', errorText);
        throw new Error(`WhatsApp API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ Message sent successfully:', {
        messageId: data.messages?.[0]?.id,
        to: from
      });

      return {
        success: true,
        whatsappMessageId: data.messages?.[0]?.id,
        to: from
      };

    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }
});
