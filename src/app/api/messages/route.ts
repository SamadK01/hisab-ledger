import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_MESSAGES } from '@/lib/seed-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');

    const whereClause = partyId ? { partyId } : {};

    let messages = await prisma.ledgerMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0 && !partyId) {
      for (const m of INITIAL_MESSAGES) {
        await prisma.ledgerMessage.create({
          data: {
            id: m.id,
            partyId: m.partyId,
            senderRole: m.senderRole,
            senderName: m.senderName,
            text: m.text,
            read: m.read || false,
            createdAt: new Date(m.createdAt),
          },
        });
      }
      messages = await prisma.ledgerMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Prisma GET messages error:', error);
    return NextResponse.json(INITIAL_MESSAGES);
  }
}

export async function POST(request: Request) {
  try {
    const { partyId, senderRole, senderName, text } = await request.json();

    if (!partyId || !text) {
      return NextResponse.json(
        { success: false, message: 'Party ID and text message required!' },
        { status: 400 }
      );
    }

    const newMsg = await prisma.ledgerMessage.create({
      data: {
        partyId,
        senderRole: senderRole || 'PARTNER',
        senderName: senderName || 'User',
        text: text.trim(),
      },
    });

    return NextResponse.json(newMsg, { status: 201 });
  } catch (error) {
    console.error('Prisma POST message error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
