import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: { party: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Prisma GET pending users error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { userId, status } = await request.json(); // status: APPROVED or REJECTED

    if (!userId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'User ID and valid status required!' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      include: { party: true },
    });

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Prisma POST approval error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update approval status' }, { status: 500 });
  }
}
