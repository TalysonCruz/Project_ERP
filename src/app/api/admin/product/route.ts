import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        category: true,
        inventories: {
          include: {
            supplier: true,
            client: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(produtos, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Erro desconhecido ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, quantity, barcode, categoryId, supplierId } =
      await req.json();

    if (!name || !quantity || !barcode || !categoryId) {
      return NextResponse.json(
        { message: "Por favor insira todos os dados" },
        { status: 400 }
      );
    }

    const product = await prisma.produto.create({
      data: {
        name,
        quantity,
        barcode,
        categoryId,
        inventories: {
          create: [
            {
              type: "entrada",
              quantity,
              supplierId: supplierId ?? null,
              created_at: new Date(),
            },
          ],
        },
      },
      include: {
        category: true,
        inventories: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Erro desconhecido ao criar produto" },
      { status: 500 }
    );
  }
}
