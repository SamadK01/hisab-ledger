import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');

    const parties = await prisma.party.findMany({
      where: partyId ? { id: partyId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { transactions: true, users: true },
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

    // If Master Admin created a partner with portal login credentials, provision user account immediately
    if (body.email && body.password) {
      const cleanEmail = body.email.trim().toLowerCase();
      const cleanPassword = body.password.trim();
      if (cleanEmail && cleanPassword) {
        await prisma.user.upsert({
          where: { email: cleanEmail },
          update: {
            name: body.name,
            password: cleanPassword,
            role: 'PARTNER',
            status: 'APPROVED',
            partyId: newParty.id,
          },
          create: {
            name: body.name,
            email: cleanEmail,
            password: cleanPassword,
            role: 'PARTNER',
            status: 'APPROVED',
            partyId: newParty.id,
          },
        });
      }
    }

    return NextResponse.json(newParty, { status: 201 });
  } catch (error) {
    console.error('Prisma POST party error:', error);
    return NextResponse.json({ error: 'Failed to create party in DB' }, { status: 500 });
  }
}
