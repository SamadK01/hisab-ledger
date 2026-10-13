import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  INITIAL_PARTIES,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  DEFAULT_ADMIN_CREDENTIALS,
  DEFAULT_PARTNER_CREDENTIALS,
  INITIAL_MESSAGES,
} from '@/lib/seed-data';

export async function POST() {
  try {
    // Delete existing records in correct relation order
    await prisma.transactionItem.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.ledgerMessage.deleteMany({});
    await prisma.passwordResetRequest.deleteMany({});
    await prisma.user.deleteMany({});
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

    // Seed transactions with items
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
          buyingCostTotal: t.buyingCostTotal || 0,
          sellingPriceTotal: t.sellingPriceTotal || 0,
          expectedProfit: t.expectedProfit || 0,
          items: {
            create: (t.items || []).map((item) => ({
              id: item.id,
              productId: item.productId || null,
              productName: item.productName,
              unit: item.unit,
              quantity: item.quantity,
              rate: item.rate,
              costPrice: item.costPrice || 0,
              subtotal: item.subtotal,
              costSubtotal: item.costSubtotal || 0,
              expectedProfit: item.expectedProfit || 0,
            })),
          },
        },
      });
    }

    // Master Admin user
    await prisma.user.create({
      data: {
        id: 'user-admin-1',
        name: 'Master Business Admin',
        email: DEFAULT_ADMIN_CREDENTIALS.email,
        password: DEFAULT_ADMIN_CREDENTIALS.password,
        role: 'ADMIN',
        status: 'APPROVED',
      },
    });

    // Partner users
    for (let i = 0; i < DEFAULT_PARTNER_CREDENTIALS.length; i++) {
      const p = DEFAULT_PARTNER_CREDENTIALS[i];
      await prisma.user.create({
        data: {
          id: `user-partner-${i + 1}`,
          name: p.name,
          email: p.email,
          password: p.password,
          role: p.role,
          status: p.status,
          partyId: p.partyId,
        },
      });
    }

    // Messages
    for (const msg of INITIAL_MESSAGES) {
      await prisma.ledgerMessage.create({
        data: {
          id: msg.id,
          partyId: msg.partyId,
          senderRole: msg.senderRole,
          senderName: msg.senderName,
          text: msg.text,
          read: Boolean(msg.read),
          createdAt: new Date(msg.createdAt),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database successfully re-seeded with clean multi-party trading dataset!',
    });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
