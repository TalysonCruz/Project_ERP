import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const product = await prisma.produto.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { message: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar product" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const product = await prisma.produto.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json(
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }

    await prisma.produto.delete({ where: { id } });

    return NextResponse.json(
      { message: "Produto deletado com sucesso", deletedId: id },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Erro desconhecido ao deletar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());
    const { name, quantity, barcode, categoryId, supplierId, clientId } =
      await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    // Busca o produto atual
    const currentProduct = await prisma.produto.findUnique({ where: { id } });
    if (!currentProduct) {
      return NextResponse.json(
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const quantityDiff = quantity - currentProduct.quantity;

    let inventoryData = undefined;
    if (quantityDiff !== 0) {
      inventoryData = {
        create: [
          {
            type: quantityDiff > 0 ? "entrada" : "saida",
            quantity: Math.abs(quantityDiff),
            supplierId: quantityDiff > 0 ? supplierId ?? null : null,
            clientId: quantityDiff < 0 ? clientId ?? null : null,
            created_at: new Date(),
          },
        ],
      };
    }
    const product = await prisma.produto.update({
      where: { id },
      data: {
        name,
        barcode,
        categoryId,
        quantity,
        inventories: inventoryData,
      },
      include: {
        inventories: true,
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Erro desconhecido ao atualizar produto" },
      { status: 500 }
    );
  }
}
