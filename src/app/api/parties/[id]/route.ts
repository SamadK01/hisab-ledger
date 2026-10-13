import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Party ID is required' }, { status: 400 });
    }

    // Search party by ID, email, or name
    const party = await prisma.party.findFirst({
      where: {
        OR: [
          { id },
          { email: id },
          { name: id },
        ],
      },
    });

    const targetId = party?.id || id;
    const partyEmail = party?.email || null;

    // Execute permanent cascading delete atomically in PostgreSQL
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated transaction items first, then transactions
      const partyTxs = await tx.transaction.findMany({
        where: { partyId: targetId },
        select: { id: true },
      });
      const txIds = partyTxs.map((t) => t.id);

      if (txIds.length > 0) {
        await tx.transactionItem.deleteMany({
          where: { transactionId: { in: txIds } },
        });
      }

      await tx.transaction.deleteMany({
        where: { partyId: targetId },
      });

      // 2. Delete associated ledger messages
      await tx.ledgerMessage.deleteMany({
        where: { partyId: targetId },
      });

      // 3. Delete password reset requests tied to party
      await tx.passwordResetRequest.deleteMany({
        where: {
          OR: [
            { partyId: targetId },
            ...(partyEmail ? [{ userEmail: partyEmail }] : []),
          ],
        },
      });

      // 4. Delete user accounts tied to this party
      await tx.user.deleteMany({
        where: {
          OR: [
            { partyId: targetId },
            ...(partyEmail ? [{ email: partyEmail }] : []),
          ],
        },
      });

      // 5. Delete party profile permanently
      await tx.party.deleteMany({
        where: {
          OR: [
            { id: targetId },
            { id },
          ],
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Party, partner credentials, and all associated ledger records permanently deleted!',
    });
  } catch (error: any) {
    console.error('Delete party API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete party' },
      { status: 500 }
    );
  }
}
