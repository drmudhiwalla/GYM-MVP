import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

// POST /api/screening - Save screening data (public, Part 1 flow)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['whatsappNumber', 'name', 'age', 'gender'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const screening = await prisma.screening.create({
      data: {
        screeningId: body.screeningId,
        whatsappNumber: body.whatsappNumber,
        name: body.name,
        age: body.age,
        gender: body.gender,
        workingStatus: body.workingStatus || '',
        consent1: body.consent1 || false,
        consent2: body.consent2 || false,
        consent3: body.consent3 || false,
        bpSystolic: body.bpSystolic || null,
        bpDiastolic: body.bpDiastolic || null,
        bpCategory: body.bpCategory || null,
        heightCm: body.heightCm || null,
        weightKg: body.weightKg || null,
        bmiValue: body.bmiValue || null,
        bmiCategory: body.bmiCategory || null,
        waistCm: body.waistCm || null,
        briValue: body.briValue || null,
        briCategory: body.briCategory || null,
        status: body.status || 'REGISTERED',
      },
    });

    return NextResponse.json({ success: true, id: screening.id });
  } catch (error) {
    console.error('POST /api/screening error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/screening - List all screenings (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const screenings = await prisma.screening.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: screenings });
  } catch (error) {
    console.error('GET /api/screening error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
