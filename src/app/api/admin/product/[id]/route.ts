import prisma from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

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
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar produto" },
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
    const {
      name,
      quantity,
      barcode,
      categoryId,
      supplierId,
      clientId,
      movementType,
    } = await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const currentProduct = await prisma.produto.findUnique({ where: { id } });
    if (!currentProduct) {
      return NextResponse.json(
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }

    let newQuantity = currentProduct.quantity;
    let inventoryData = undefined;

    if (quantity !== undefined && quantity > 0) {
      const isEntry = supplierId || movementType === "entrada";
      const isExit = clientId || movementType === "saida";

      if (isEntry) {
        newQuantity = currentProduct.quantity + quantity;
        inventoryData = {
          create: [
            {
              type: "entrada",
              quantity: quantity,
              supplierId: supplierId ?? null,
              clientId: null,
              created_at: new Date(),
            },
          ],
        };
      } else if (isExit) {
        // Saída: subtrai do estoque atual
        if (currentProduct.quantity < quantity) {
          return NextResponse.json(
            { message: "Quantidade insuficiente em estoque" },
            { status: 400 }
          );
        }
        newQuantity = currentProduct.quantity - quantity;
        inventoryData = {
          create: [
            {
              type: "saida",
              quantity: quantity,
              supplierId: null,
              clientId: clientId ?? null,
              created_at: new Date(),
            },
          ],
        };
      } else {
        return NextResponse.json(
          {
            message:
              "Especifique supplierId para entrada ou clientId para saída",
          },
          { status: 400 }
        );
      }
    }

    const product = await prisma.produto.update({
      where: { id },
      data: {
        name: name ?? currentProduct.name,
        barcode: barcode ?? currentProduct.barcode,
        categoryId: categoryId ?? currentProduct.categoryId,
        quantity: newQuantity,
        inventories: inventoryData,
      },
      include: {
        inventories: true,
        category: true,
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error: unknown) {
    console.error("[v0] Erro ao atualizar produto:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Erro desconhecido ao atualizar produto" },
      { status: 500 }
    );
  }
}
