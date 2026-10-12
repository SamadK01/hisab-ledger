import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword || newPassword.trim().length < 4) {
      return NextResponse.json(
        { success: false, message: 'Valid User ID and new password (min 4 chars) are required.' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword.trim() },
    });

    return NextResponse.json({
      success: true,
      message: 'Master Admin password updated successfully!',
    });
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update password.' },
      { status: 500 }
    );
  }
}
