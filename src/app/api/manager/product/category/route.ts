// /api/admin/product/category
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const category = await prisma.category.findMany();

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar categoria" },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { message: "O nome da categoria é obrigatório" },
        { status: 400 }
      );
    }
    const category = await prisma.category.create({ data: { name } });
    return new NextResponse(JSON.stringify(category), { status: 201 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Erro desconhecido ao criar categoria" }),
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const numericId = Number(id);
    if (!numericId) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }
    const category = await prisma.category.delete({ where: { id: numericId } });

    return NextResponse.json({
      message: "Categoria deletado com sucesso.",
      deletedId: numericId,
      category,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Erro ao deletar categoria" }),
      {
        status: 400,
      }
    );
  }
}
