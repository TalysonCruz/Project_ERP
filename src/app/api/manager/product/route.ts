import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.produto.findMany();

    return new NextResponse(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar produtos" },
      { status: 400 }
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
