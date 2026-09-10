const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER;

interface SendTemplateParams {
  to: string;
  templateName: string;
  variables: string[];
  language?: string;
}

/**
 * Send a WhatsApp template message via MSG91
 */
export async function sendWhatsAppTemplate({ to, templateName, variables, language = 'en' }: SendTemplateParams) {
  if (!MSG91_AUTH_KEY) throw new Error('WhatsApp service not configured');

  const phone = to.replace(/[^0-9]/g, '');

  const response = await fetch('https://api.msg91.com/api/v5/whatsapp/outbound/template/', {
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
              parameters: variables.map((val) => ({
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
  console.log('MSG91 response:', JSON.stringify(data));
  if (!response.ok || data.type === 'error') {
    console.error('MSG91 template error:', data);
    throw new Error(data?.message || data?.error?.message || 'Failed to send WhatsApp template');
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
