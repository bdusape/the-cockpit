/**
 * WhatsApp Business API webhook payload fixtures
 * These simulate incoming messages from WhatsApp to the Pipedream workflow
 */

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice';
  text?: { body: string };
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
      };
      field: string;
    }>;
  }>;
}

/**
 * Create a standard WhatsApp webhook payload
 */
export function createWhatsAppPayload(
  phoneNumber: string,
  message: string,
  messageType: 'text' | 'image' | 'voice' = 'text'
): WhatsAppWebhookPayload {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'test-entry-id',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: process.env.WHATSAPP_BUSINESS_NUMBER || '+1234567890',
                phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || 'test-phone-id',
              },
              contacts: [
                {
                  profile: { name: 'Test User' },
                  wa_id: phoneNumber.replace(/\+/g, ''),
                },
              ],
              messages: [
                {
                  from: phoneNumber.replace(/\+/g, ''),
                  id: `msg_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: messageType,
                  ...(messageType === 'text' && {
                    text: { body: message },
                  }),
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
}

/**
 * Create payload for unauthorized user
 */
export function createUnauthorizedPayload(message: string): WhatsAppWebhookPayload {
  return createWhatsAppPayload(process.env.UNAUTHORIZED_TEST_NUMBER || '+0987654321', message);
}

/**
 * Create payload for authorized user
 */
export function createAuthorizedPayload(message: string): WhatsAppWebhookPayload {
  return createWhatsAppPayload(process.env.TEST_PHONE_NUMBER || '+1234567890', message);
}

/**
 * Create payload with empty message
 */
export function createEmptyMessagePayload(): WhatsAppWebhookPayload {
  return createAuthorizedPayload('');
}

/**
 * Create payload with special characters
 */
export function createSpecialCharactersPayload(): WhatsAppWebhookPayload {
  return createAuthorizedPayload(
    '@growth How to go viral? 🚀\n\nTried everything:\n- SEO ✅\n- Ads ❌\n- Organic content 📝'
  );
}
