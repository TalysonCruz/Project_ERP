import prisma from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { produtoId, quantity, type, supplierId, clientId } = body;

    if (!produtoId || !quantity || !type) {
      return NextResponse.json(
        { message: "productId, quantity e type são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedType = type.toLowerCase();
    if (normalizedType !== "entrada" && normalizedType !== "saida") {
      return NextResponse.json(
        { message: "type deve ser 'entrada'/'ENTRADA' ou 'saida'/'SAIDA'" },
        { status: 400 }
      );
    }

    const currentProduct = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }

    let newQuantity = currentProduct.quantity;

    if (normalizedType === "entrada") {
      newQuantity = currentProduct.quantity + quantity;
    } else {
      if (currentProduct.quantity < quantity) {
        return NextResponse.json(
          { message: "Quantidade insuficiente em estoque" },
          { status: 400 }
        );
      }
      newQuantity = currentProduct.quantity - quantity;
    }

    const result = await prisma.$transaction([
      prisma.produto.update({
        where: { id: produtoId },
        data: { quantity: newQuantity },
      }),
      prisma.inventory.create({
        data: {
          produtoId,
          type: normalizedType,
          quantity,
          supplierId: normalizedType === "entrada" ? supplierId : null,
          clientId: normalizedType === "saida" ? clientId : null,
          created_at: new Date(),
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Movimentação criada com sucesso",
        product: result[0],
        movement: result[1],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(" Erro ao criar movimentação:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Erro desconhecido ao criar movimentação" },
      { status: 500 }
    );
  }
}
