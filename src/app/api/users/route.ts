import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        party: {
          include: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role = 'PARTNER', status = 'APPROVED', partyId } = await request.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Valid email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(partyId ? [{ partyId }] : []),
        ],
      },
    });

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName || existingUser.name,
          email: cleanEmail,
          password: cleanPassword,
          role,
          status,
          partyId: partyId || existingUser.partyId,
        },
        include: {
          party: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: cleanName || 'Partner User',
          email: cleanEmail,
          password: cleanPassword,
          role,
          status,
          partyId: partyId || null,
        },
        include: {
          party: true,
        },
      });
    }

    // Sync party email
    if (partyId) {
      await prisma.party.update({
        where: { id: partyId },
        data: {
          ...(cleanEmail ? { email: cleanEmail } : {}),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Partner credentials created successfully!',
      user,
    });
  } catch (error: any) {
    console.error('Create user API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create partner account' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, name, email, password, status, partyId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (name) data.name = name.trim();
    if (email) data.email = email.trim().toLowerCase();
    if (password) data.password = password.trim();
    if (status) data.status = status;
    if (partyId !== undefined) data.partyId = partyId || null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        party: {
          include: {
            transactions: true,
          },
        },
      },
    });

    // Sync party email and name if linked
    if (updatedUser.partyId && (name || email)) {
      await prisma.party
        .update({
          where: { id: updatedUser.partyId },
          data: {
            ...(name ? { name: name.trim() } : {}),
            ...(email ? { email: email.trim().toLowerCase() } : {}),
          },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Partner credentials updated successfully!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update partner credentials' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const deleteParty = searchParams.get('deleteParty') !== 'false'; // default true

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    const partyId = existingUser?.partyId || searchParams.get('partyId');

    // Delete password reset requests
    await prisma.passwordResetRequest.deleteMany({
      where: {
        OR: [
          { userId },
          ...(partyId ? [{ partyId }] : []),
        ],
      },
    }).catch(() => {});

    // Delete user account if exists
    if (existingUser) {
      await prisma.user.delete({
        where: { id: userId },
      }).catch((e) => {
        console.warn('Prisma user delete warning:', e);
      });
    }

    // Cascade delete linked party if requested
    if (partyId && deleteParty) {
      await prisma.transactionItem.deleteMany({
        where: { transaction: { partyId } },
      }).catch(() => {});

      await prisma.transaction.deleteMany({
        where: { partyId },
      }).catch(() => {});

      await prisma.ledgerMessage.deleteMany({
        where: { partyId },
      }).catch(() => {});

      await prisma.party.delete({
        where: { id: partyId },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Partner user account and records deleted successfully!',
    });
  } catch (error: any) {
    console.error('Delete user API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete partner account' },
      { status: 500 }
    );
  }
}
