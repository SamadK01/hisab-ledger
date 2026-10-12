import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const requests = await prisma.passwordResetRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Prisma GET password requests error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, partyId, partyName, reason } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, message: 'User ID and Email are required.' },
        { status: 400 }
      );
    }

    const newRequest = await prisma.passwordResetRequest.create({
      data: {
        userId,
        userName: userName || 'Partner',
        userEmail,
        partyId: partyId || null,
        partyName: partyName || null,
        reason: reason || 'Partner requested password change',
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Password change request sent to Master Admin!',
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST password request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit password reset request.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { requestId, targetUserId, newPassword, status = 'RESOLVED' } = body;

    if (newPassword && targetUserId) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { password: newPassword },
      });
    }

    if (requestId) {
      await prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error) {
    console.error('PUT password request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update partner password.' },
      { status: 500 }
    );
  }
}
