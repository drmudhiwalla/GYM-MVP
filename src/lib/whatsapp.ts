const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER;

interface SendTemplateParams {
  to: string;
  templateName: string;
  variables: string[];
  language?: string;
}

export async function sendWhatsAppTemplate({ to, templateName, variables, language = 'en' }: SendTemplateParams) {
  if (!MSG91_AUTH_KEY) throw new Error('MSG91_AUTH_KEY not set');
  if (!MSG91_WHATSAPP_NUMBER) throw new Error('MSG91_WHATSAPP_NUMBER not set');

  const phone = to.replace(/[^0-9]/g, '');

  const components: Record<string, { type: string; value: string }> = {};
  variables.forEach((val, idx) => {
    components[`body_${idx + 1}`] = { type: 'text', value: val };
  });

  const body = {
    integrated_number: MSG91_WHATSAPP_NUMBER,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: templateName,
        language: { code: language, policy: 'deterministic' },
        to_and_components: [
          {
            to: [phone],
            components: components,
          },
        ],
      },
    },
  };

  console.log('MSG91 request:', JSON.stringify({ ...body, payload: { ...body.payload, template: { ...body.payload.template, to_and_components: [{ to: ['REDACTED'], components }] } } }));

  const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: MSG91_AUTH_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log('MSG91 response:', JSON.stringify(data));

  if (!response.ok || data.type === 'error') {
    throw new Error(data?.message || data?.error?.message || JSON.stringify(data));
  }
  return data;
}

export function getWhatsAppLink(phoneNumber: string, message: string): string {
  const phone = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
