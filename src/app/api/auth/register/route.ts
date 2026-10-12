import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LocalStoreManager } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, partyType = 'BOTH', phone, address } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim();

    if (!cleanName || !normalizedEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Name, Email and Password are required!' },
        { status: 400 }
      );
    }

    // Check DB existing user
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'An account with this email already exists!' },
          { status: 400 }
        );
      }

      // Create Party profile first
      const party = await prisma.party.create({
        data: {
          name: cleanName,
          email: normalizedEmail,
          phone: phone || null,
          address: address || null,
          partyType,
          openingBalance: 0,
        },
      });

      // Create User with PENDING_APPROVAL status!
      const newUser = await prisma.user.create({
        data: {
          name: cleanName,
          email: normalizedEmail,
          password: cleanPassword,
          role: 'PARTNER',
          status: 'PENDING_APPROVAL',
          partyId: party.id,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Registration submitted! Account status set to PENDING_APPROVAL.',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
            partyId: newUser.partyId,
          },
          party,
        },
        { status: 201 }
      );
    } catch (e) {
      console.error('Prisma register error, fallback to local store:', e);
    }

    // Fallback registration
    const localParty = LocalStoreManager.addParty({
      name: cleanName,
      email: normalizedEmail,
      phone: phone || null,
      address: address || null,
      partyType,
      openingBalance: 0,
    });

    const fallbackUser = {
      id: `user-partner-${Date.now()}`,
      name: cleanName,
      email: normalizedEmail,
      role: 'PARTNER' as const,
      status: 'PENDING_APPROVAL' as const,
      partyId: localParty.id,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Partner registration submitted! Awaiting Master Admin approval.',
        user: fallbackUser,
        party: localParty,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete partner registration' },
      { status: 500 }
    );
  }
}
