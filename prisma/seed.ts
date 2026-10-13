import { PrismaClient } from '@prisma/client';
import {
  INITIAL_PRODUCTS,
  INITIAL_PARTIES,
  INITIAL_TRANSACTIONS,
  DEFAULT_ADMIN_CREDENTIALS,
  DEFAULT_PARTNER_CREDENTIALS,
  INITIAL_MESSAGES,
} from '../src/lib/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Clearing local SQLite database tables completely...');

  // Cascade delete in proper order
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.ledgerMessage.deleteMany({});
  await prisma.passwordResetRequest.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.party.deleteMany({});

  console.log('📦 Seeding Products...');
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.create({
      data: {
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        unit: prod.unit,
        costPrice: prod.costPrice,
        wholesalePrice: prod.wholesalePrice,
        currentStock: prod.currentStock,
        minStock: prod.minStock,
        notes: prod.notes,
      },
    });
    console.log(`   ✓ Product: ${prod.name} (Stock: ${prod.currentStock} ${prod.unit}, Cost: PKR ${prod.costPrice}, Sell: PKR ${prod.wholesalePrice})`);
  }

  console.log('👥 Seeding Parties...');
  for (const party of INITIAL_PARTIES) {
    await prisma.party.create({
      data: {
        id: party.id,
        name: party.name,
        phone: party.phone,
        email: party.email,
        address: party.address,
        partyType: party.partyType,
        openingBalance: party.openingBalance,
        creditLimit: party.creditLimit,
        notes: party.notes,
      },
    });
    console.log(`   ✓ Party: ${party.name} [${party.partyType}] (Email: ${party.email})`);
  }

  console.log('💼 Seeding Transactions & Ledger Items...');
  for (const tx of INITIAL_TRANSACTIONS) {
    await prisma.transaction.create({
      data: {
        id: tx.id,
        partyId: tx.partyId,
        type: tx.type,
        invoiceNo: tx.invoiceNo,
        date: new Date(tx.date),
        subtotal: tx.subtotal,
        discount: tx.discount,
        additionalCost: tx.additionalCost,
        totalAmount: tx.totalAmount,
        cashPaid: tx.cashPaid,
        remainingBalance: tx.remainingBalance,
        paymentMode: tx.paymentMode,
        status: tx.status,
        notes: tx.notes,
        buyingCostTotal: tx.buyingCostTotal || 0,
        sellingPriceTotal: tx.sellingPriceTotal || 0,
        expectedProfit: tx.expectedProfit || 0,
        items: {
          create: (tx.items || []).map((item) => ({
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
    console.log(`   ✓ ${tx.type} #${tx.invoiceNo}: ${tx.partyName} - Total: PKR ${tx.totalAmount}, Paid: PKR ${tx.cashPaid}, Due: PKR ${tx.remainingBalance}`);
  }

  console.log('🔐 Seeding Users & Partner Credentials...');
  // 1. Master Admin
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
  console.log(`   ✓ Master Admin: ${DEFAULT_ADMIN_CREDENTIALS.email} / ${DEFAULT_ADMIN_CREDENTIALS.password}`);

  // 2. Partner Users
  for (let i = 0; i < DEFAULT_PARTNER_CREDENTIALS.length; i++) {
    const cred = DEFAULT_PARTNER_CREDENTIALS[i];
    await prisma.user.create({
      data: {
        id: `user-partner-${i + 1}`,
        name: cred.name,
        email: cred.email,
        password: cred.password,
        role: cred.role,
        status: cred.status,
        partyId: cred.partyId,
      },
    });
    console.log(`   ✓ Partner Account: ${cred.name} (${cred.email} / ${cred.password}) - Status: ${cred.status}`);
  }

  // 3. Messages
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

  console.log('✅ SQLite Database successfully seeded with realistic multi-party trading dataset!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
