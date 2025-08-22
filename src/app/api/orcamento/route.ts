import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: {
        client: true,
        items: {
          include: {
            produto: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(orcamentos);
  } catch (error: unknown) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar orçamentos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, items, desconto = 0, frete = 0, observacoes } = body;

    if (!clientId || !items || items.length === 0) {
      return NextResponse.json(
        { message: "clientId e items são obrigatórios" },
        { status: 400 }
      );
    }

    // Calcular total
    const subtotal = items.reduce((acc: number, item: any) => {
      return acc + item.quantity * item.preco;
    }, 0);

    const total = subtotal - desconto + frete;

    const orcamento = await prisma.orcamento.create({
      data: {
        clientId,
        desconto,
        frete,
        total,
        observacoes,
        items: {
          create: items.map((item: any) => ({
            produtoId: item.produtoId,
            quantity: item.quantity,
            preco: item.preco,
            subtotal: item.quantity * item.preco,
          })),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            produto: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(orcamento, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      { message: "Erro ao criar orçamento" },
      { status: 500 }
    );
  }
}
