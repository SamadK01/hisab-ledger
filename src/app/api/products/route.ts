import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Prisma GET products error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku || null,
        category: body.category || 'General',
        unit: body.unit || 'kg',
        costPrice: Number(body.costPrice || 0),
        wholesalePrice: Number(body.wholesalePrice || 0),
        currentStock: Number(body.currentStock || 0),
        minStock: Number(body.minStock || 10),
        notes: body.notes || null,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Prisma POST product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
