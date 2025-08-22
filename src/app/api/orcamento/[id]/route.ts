import prisma from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: Number.parseInt(id) },
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

    if (!orcamento) {
      return NextResponse.json(
        { message: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(orcamento);
  } catch (error: unknown) {
    console.error("Erro ao buscar orçamento:", error);
    return NextResponse.json(
      { message: "Erro ao buscar orçamento" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, items, desconto, frete, observacoes } = body;

    const orcamentoId = Number.parseInt(id);

    // Buscar orçamento atual
    const orcamentoAtual = await prisma.orcamento.findUnique({
      where: { id: orcamentoId },
      include: { items: true },
    });

    if (!orcamentoAtual) {
      return NextResponse.json(
        { message: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Se mudando status para CONFIRMADO, criar movimentações
    if (status === "CONFIRMADO" && orcamentoAtual.status === "PENDENTE") {
      // Verificar estoque disponível
      for (const item of orcamentoAtual.items) {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produtoId },
        });

        if (!produto || produto.quantity < item.quantity) {
          return NextResponse.json(
            { message: `Estoque insuficiente para o produto ${produto?.name}` },
            { status: 400 }
          );
        }
      }

      // Criar movimentações e atualizar estoque
      await prisma.$transaction([
        // Atualizar status do orçamento
        prisma.orcamento.update({
          where: { id: orcamentoId },
          data: { status: "CONFIRMADO" },
        }),
        // Criar movimentações de saída
        ...orcamentoAtual.items.map((item) =>
          prisma.inventory.create({
            data: {
              produtoId: item.produtoId,
              type: "saida",
              quantity: item.quantity,
              clientId: orcamentoAtual.clientId,
              orcamentoId: orcamentoId,
            },
          })
        ),
        // Atualizar quantidades dos produtos
        ...orcamentoAtual.items.map((item) =>
          prisma.produto.update({
            where: { id: item.produtoId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          })
        ),
      ]);
    }

    if (status === "CANCELADO" && orcamentoAtual.status === "CONFIRMADO") {
      await prisma.$transaction([
        // Atualizar status do orçamento
        prisma.orcamento.update({
          where: { id: orcamentoId },
          data: { status: "CANCELADO" },
        }),
        // Reverter quantidades dos produtos
        ...orcamentoAtual.items.map((item) =>
          prisma.produto.update({
            where: { id: item.produtoId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          })
        ),
        // Criar movimentações de entrada para reverter
        ...orcamentoAtual.items.map((item) =>
          prisma.inventory.create({
            data: {
              produtoId: item.produtoId,
              type: "entrada",
              quantity: item.quantity,
              orcamentoId: orcamentoId,
            },
          })
        ),
      ]);
    }

    // Atualizar orçamento com novos dados se fornecidos
    const updateData: any = {};
    if (status && status !== orcamentoAtual.status) {
      updateData.status = status;
    }
    if (desconto !== undefined) updateData.desconto = desconto;
    if (frete !== undefined) updateData.frete = frete;
    if (observacoes !== undefined) updateData.observacoes = observacoes;

    // Recalcular total se items foram fornecidos
    if (items) {
      const subtotal = items.reduce((acc: number, item: any) => {
        return acc + item.quantity * item.preco;
      }, 0);
      updateData.total = subtotal - (desconto || 0) + (frete || 0);

      // Atualizar items
      await prisma.orcamentoItem.deleteMany({
        where: { orcamentoId },
      });

      updateData.items = {
        create: items.map((item: any) => ({
          produtoId: item.produtoId,
          quantity: item.quantity,
          preco: item.preco,
          subtotal: item.quantity * item.preco,
        })),
      };
    }

    const orcamento = await prisma.orcamento.update({
      where: { id: orcamentoId },
      data: updateData,
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

    return NextResponse.json(orcamento);
  } catch (error: unknown) {
    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}
