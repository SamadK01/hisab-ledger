import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const txs = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: {
        party: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(txs);
  } catch (error) {
    console.error('Prisma GET transactions error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      partyId,
      type,
      invoiceNo,
      date,
      subtotal,
      discount,
      additionalCost,
      totalAmount,
      cashPaid,
      remainingBalance,
      paymentMode,
      notes,
      receiptImage,
      buyingCostTotal,
      sellingPriceTotal,
      expectedProfit,
      lossAmount,
      lossReason,
      items = [],
    } = body;

    const newTx = await prisma.transaction.create({
      data: {
        partyId,
        type,
        invoiceNo: invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
        date: date ? new Date(date) : new Date(),
        subtotal: Number(subtotal || 0),
        discount: Number(discount || 0),
        additionalCost: Number(additionalCost || 0),
        totalAmount: Number(totalAmount || 0),
        cashPaid: Number(cashPaid || 0),
        remainingBalance: Number(remainingBalance || 0),
        paymentMode: paymentMode || 'CASH',
        notes: notes || null,
        receiptImage: receiptImage || null,
        buyingCostTotal: Number(buyingCostTotal || 0),
        sellingPriceTotal: Number(sellingPriceTotal || 0),
        expectedProfit: Number(expectedProfit || 0),
        lossAmount: Number(lossAmount || 0),
        lossReason: lossReason || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            productName: item.productName || 'General Item',
            unit: item.unit || 'kg',
            quantity: Number(item.quantity || 0),
            rate: Number(item.rate || 0),
            costPrice: Number(item.costPrice || 0),
            subtotal: Number(item.subtotal || 0),
            costSubtotal: Number(item.costSubtotal || 0),
            expectedProfit: Number(item.expectedProfit || 0),
          })),
        },
      },
      include: {
        party: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    console.error('Prisma POST transaction error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
