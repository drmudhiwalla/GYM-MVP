import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sendWhatsAppTemplate, getWhatsAppLink } from '@/lib/whatsapp';

// POST /api/whatsapp - Send WhatsApp message
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, templateName, variables, fallbackMessage } = body;

    if (!to) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Try API if configured
    if (process.env.MSG91_AUTH_KEY && templateName) {
      try {
        const result = await sendWhatsAppTemplate({
          to,
          templateName,
          variables: variables || [],
        });
        return NextResponse.json({ success: true, method: 'api', data: result });
      } catch (apiError) {
        console.error('MSG91 API failed, falling back to wa.me:', apiError);
      }
    }

    // Fallback: return wa.me link
    const link = getWhatsAppLink(to, fallbackMessage || '');
    return NextResponse.json({ success: true, method: 'link', link });

  } catch (error) {
    console.error('POST /api/whatsapp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
