import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { createdAt: 'desc' },
      include: { transactions: true },
    });

    return NextResponse.json(parties);
  } catch (error) {
    console.error('Prisma GET parties error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newParty = await prisma.party.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        partyType: body.partyType || 'BOTH',
        openingBalance: Number(body.openingBalance || 0),
        creditLimit: body.creditLimit ? Number(body.creditLimit) : null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(newParty, { status: 201 });
  } catch (error) {
    console.error('Prisma POST party error:', error);
    return NextResponse.json({ error: 'Failed to create party in DB' }, { status: 500 });
  }
}
