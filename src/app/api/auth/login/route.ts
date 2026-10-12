import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_ADMIN_CREDENTIALS, DEFAULT_PARTNER_CREDENTIALS, INITIAL_USER, INITIAL_PARTNER_USERS } from '@/lib/seed-data';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Auto-seed default Master Admin & Partner test accounts if missing
    try {
      let dbAdmin = await prisma.user.findUnique({
        where: { email: DEFAULT_ADMIN_CREDENTIALS.email },
      });

      if (!dbAdmin) {
        dbAdmin = await prisma.user.create({
          data: {
            name: 'Master Business Admin',
            email: DEFAULT_ADMIN_CREDENTIALS.email,
            password: DEFAULT_ADMIN_CREDENTIALS.password,
            role: 'ADMIN',
            status: 'APPROVED',
          },
        });
      }

      // Seed Partner accounts in DB if missing or sync partyId
      for (const partnerCred of DEFAULT_PARTNER_CREDENTIALS) {
        const existingPartnerUser = await prisma.user.findUnique({
          where: { email: partnerCred.email },
        });
        if (!existingPartnerUser) {
          await prisma.user.create({
            data: {
              name: partnerCred.name,
              email: partnerCred.email,
              password: partnerCred.password,
              role: 'PARTNER',
              status: 'APPROVED',
              partyId: partnerCred.partyId,
            },
          });
        } else if (!existingPartnerUser.partyId || existingPartnerUser.partyId !== partnerCred.partyId) {
          await prisma.user.update({
            where: { id: existingPartnerUser.id },
            data: { partyId: partnerCred.partyId },
          });
        }
      }

      // Check DB credentials
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user && user.role === 'PARTNER' && !user.partyId) {
        const matchedParty = await prisma.party.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              { name: user.name },
            ],
          },
        });
        if (matchedParty) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { partyId: matchedParty.id },
          });
        }
      }

      if (user && user.password === cleanPassword) {
        if (user.status === 'PENDING_APPROVAL') {
          return NextResponse.json(
            {
              success: false,
              pending: true,
              message: 'Aapka partner account abhi pending approval hai. Master Admin ki manzoori ke baad login ho jayega.',
            },
            { status: 403 }
          );
        }

        if (user.status === 'REJECTED') {
          return NextResponse.json(
            {
              success: false,
              message: 'Aapka partner registration request reject kar diya gaya hai.',
            },
            { status: 403 }
          );
        }

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            partyId: user.partyId,
          },
        });
      }
    } catch (e) {
      console.error('Prisma Auth error, falling back to static check:', e);
    }

    // Static fallback checks
    if (
      normalizedEmail === DEFAULT_ADMIN_CREDENTIALS.email &&
      cleanPassword === DEFAULT_ADMIN_CREDENTIALS.password
    ) {
      return NextResponse.json({
        success: true,
        user: INITIAL_USER,
      });
    }

    const partnerCredMatch = DEFAULT_PARTNER_CREDENTIALS.find(
      (p) => p.email.toLowerCase() === normalizedEmail && p.password === cleanPassword
    );

    if (partnerCredMatch) {
      const partnerUser = INITIAL_PARTNER_USERS.find((u) => u.email === partnerCredMatch.email);
      return NextResponse.json({
        success: true,
        user: partnerUser || {
          id: `partner-${partnerCredMatch.partyId}`,
          name: partnerCredMatch.name,
          email: partnerCredMatch.email,
          role: 'PARTNER',
          status: 'APPROVED',
          partyId: partnerCredMatch.partyId,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password credentials!' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication error occurred' },
      { status: 500 }
    );
  }
}
