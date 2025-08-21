import prisma from "@/lib/db";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = Number.parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: "ID do produto inválido" },
        { status: 400 }
      );
    }

    const movimentacoes = await prisma.inventory.findMany({
      where: {
        produtoId: productId,
      },
      select: {
        type: true,
        quantity: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    let saldoAtual = 0;
    const historico: {
      tipo: string;
      quantidade: number;
      saldoApos: number;
      data: Date;
    }[] = [];

    for (const mov of movimentacoes) {
      if (mov.type.toLowerCase() === "entrada") {
        saldoAtual += mov.quantity;
      } else if (mov.type.toLowerCase() === "saida") {
        saldoAtual -= mov.quantity;
      }

      historico.push({
        tipo: mov.type,
        quantidade: mov.quantity,
        saldoApos: saldoAtual,
        data: mov.created_at,
      });
    }

    return NextResponse.json({
      productId,
      saldoAtual,
      totalMovimentacoes: movimentacoes.length,
      historico,
    });
  } catch (error) {
    console.error("Erro ao calcular estoque:", error);
    return NextResponse.json(
      { message: "Erro ao calcular estoque do produto" },
      { status: 500 }
    );
  }
}
