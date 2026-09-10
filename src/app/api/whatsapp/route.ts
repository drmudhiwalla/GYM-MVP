import { NextResponse } from 'next/server';
import { sendWhatsAppTemplate, getWhatsAppLink } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, templateName, variables, fallbackMessage } = body;

    if (!to) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const hasMsg91 = !!process.env.MSG91_AUTH_KEY;
    console.log(`WhatsApp request: to=${to}, template=${templateName}, hasMsg91=${hasMsg91}`);

    if (hasMsg91 && templateName) {
      try {
        const result = await sendWhatsAppTemplate({
          to,
          templateName,
          variables: variables || [],
        });
        console.log('MSG91 success:', JSON.stringify(result));
        return NextResponse.json({ success: true, method: 'api', data: result });
      } catch (apiError) {
        console.error('MSG91 API failed:', apiError);
      }
    }

    const link = getWhatsAppLink(to, fallbackMessage || '');
    console.log('Falling back to wa.me link');
    return NextResponse.json({ success: true, method: 'link', link });

  } catch (error) {
    console.error('POST /api/whatsapp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
