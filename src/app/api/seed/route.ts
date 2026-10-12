import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PARTIES, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, DEFAULT_ADMIN_CREDENTIALS, DEFAULT_PARTNER_CREDENTIALS } from '@/lib/seed-data';

export async function POST() {
  try {
    // Delete existing records
    await prisma.transactionItem.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.party.deleteMany({});

    // Seed products
    for (const p of INITIAL_PRODUCTS) {
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          unit: p.unit,
          costPrice: p.costPrice,
          wholesalePrice: p.wholesalePrice,
          currentStock: p.currentStock,
          minStock: p.minStock,
          notes: p.notes,
        },
      });
    }

    // Seed parties
    for (const p of INITIAL_PARTIES) {
      await prisma.party.create({
        data: {
          id: p.id,
          name: p.name,
          phone: p.phone,
          email: p.email,
          address: p.address,
          partyType: p.partyType,
          openingBalance: p.openingBalance,
          creditLimit: p.creditLimit,
          notes: p.notes,
        },
      });
    }

    // Seed transactions
    for (const t of INITIAL_TRANSACTIONS) {
      await prisma.transaction.create({
        data: {
          id: t.id,
          partyId: t.partyId,
          type: t.type,
          invoiceNo: t.invoiceNo,
          date: new Date(t.date),
          subtotal: t.subtotal,
          discount: t.discount,
          additionalCost: t.additionalCost,
          totalAmount: t.totalAmount,
          cashPaid: t.cashPaid,
          remainingBalance: t.remainingBalance,
          paymentMode: t.paymentMode,
          status: t.status,
          notes: t.notes,
          items: {
            create: (t.items || []).map((item) => ({
              id: item.id,
              productId: item.productId || null,
              productName: item.productName,
              unit: item.unit,
              quantity: item.quantity,
              rate: item.rate,
              subtotal: item.subtotal,
            })),
          },
        },
      });
    }

    // Ensure default admin user
    await prisma.user.upsert({
      where: { email: DEFAULT_ADMIN_CREDENTIALS.email },
      update: {
        role: 'ADMIN',
        status: 'APPROVED',
      },
      create: {
        name: 'Master Business Admin',
        email: DEFAULT_ADMIN_CREDENTIALS.email,
        password: DEFAULT_ADMIN_CREDENTIALS.password,
        role: 'ADMIN',
        status: 'APPROVED',
      },
    });

    // Ensure default partner users and link them to their seed party IDs
    for (const partnerCred of DEFAULT_PARTNER_CREDENTIALS) {
      await prisma.user.upsert({
        where: { email: partnerCred.email },
        update: {
          partyId: partnerCred.partyId,
          role: 'PARTNER',
          status: 'APPROVED',
        },
        create: {
          name: partnerCred.name,
          email: partnerCred.email,
          password: partnerCred.password,
          role: 'PARTNER',
          status: 'APPROVED',
          partyId: partnerCred.partyId,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Database successfully re-seeded with demo data!' });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
