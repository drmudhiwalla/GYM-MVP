import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

// GET /api/screening/[id] - Get single screening (public for Part 2 flow)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const screening = await prisma.screening.findFirst({
      where: { screeningId: id },
    });

    if (!screening) {
      return NextResponse.json({ error: 'Screening not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: screening });
  } catch (error) {
    console.error('GET /api/screening/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/screening/[id] - Delete screening (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.screening.findFirst({
      where: { screeningId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Screening not found' }, { status: 404 });
    }

    await prisma.screening.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/screening/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/screening/[id] - Update screening (admin or Part 2 flow)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.screening.findFirst({
      where: { screeningId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Screening not found' }, { status: 404 });
    }

    const screening = await prisma.screening.update({
      where: { id: existing.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: screening });
  } catch (error) {
    console.error('PATCH /api/screening/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
