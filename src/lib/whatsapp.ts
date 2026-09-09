const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER;
const MSG91_API_URL = 'https://api.msg91.com/api/v5/whatsapp/outbound';

interface SendWhatsAppParams {
  to: string;
  message: string;
}

interface SendTemplateParams {
  to: string;
  templateName: string;
  variables: string[];
  language?: string;
}

/**
 * Send a plain text WhatsApp message via MSG91
 */
export async function sendWhatsAppMessage({ to, message }: SendWhatsAppParams) {
  if (!MSG91_AUTH_KEY) throw new Error('WhatsApp service not configured');

  const phone = to.replace(/[^0-9]/g, '');

  const response = await fetch(MSG91_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: MSG91_AUTH_KEY,
    },
    body: JSON.stringify({
      phone: phone,
      message: message,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Failed to send WhatsApp message');
  return data;
}

/**
 * Send a WhatsApp template message via MSG91
 * Variables array: [name, screeningId, ...other vars]
 */
export async function sendWhatsAppTemplate({ to, templateName, variables, language = 'en' }: SendTemplateParams) {
  if (!MSG91_AUTH_KEY) throw new Error('WhatsApp service not configured');

  const phone = to.replace(/[^0-9]/g, '');

  // Build variables object: { "1": "value1", "2": "value2", ... }
  const variablesObj: Record<string, string> = {};
  variables.forEach((val, idx) => {
    variablesObj[String(idx + 1)] = val;
  });

  const response = await fetch(MSG91_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: MSG91_AUTH_KEY,
    },
    body: JSON.stringify({
      integrated_number: MSG91_WHATSAPP_NUMBER,
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          components: [
            {
              type: 'body',
              parameters: Object.entries(variablesObj).map(([key, val]) => ({
                type: 'text',
                text: val,
              })),
            },
          ],
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('MSG91 template error:', data);
    throw new Error(data?.message || 'Failed to send WhatsApp template');
  }
  return data;
}

/**
 * Generate a wa.me link (fallback)
 */
export function getWhatsAppLink(phoneNumber: string, message: string): string {
  const phone = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
