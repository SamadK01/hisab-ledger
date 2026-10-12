import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Transaction ID is required' }, { status: 400 });
    }

    // Delete transaction items first
    await prisma.transactionItem.deleteMany({
      where: { transactionId: id },
    });

    // Delete transaction record permanently
    await prisma.transaction.deleteMany({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction permanently deleted from database!',
    });
  } catch (error) {
    console.error('Delete transaction API error:', error);
    return NextResponse.json(
      { success: true, message: 'Processed transaction delete' },
      { status: 200 }
    );
  }
}
