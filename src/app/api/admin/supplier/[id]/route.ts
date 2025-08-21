import prisma from "@/lib/db";
import {
  validadorEmail,
  validarCNPJ,
  validarTelefone,
} from "@/utils/validator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { inventories: true },
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar fornecedor" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());

    const { name, email, cnpj: cnpjInput, tel } = await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const telefoneValidado = validarTelefone(tel);
    const cnpjValidado = validarCNPJ(cnpjInput);
    const emailValidado = validadorEmail(email);

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name,
        email: emailValidado.email,
        cnpj: cnpjValidado,
        tel: telefoneValidado,
      },
    });
    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erro ao atualizar cliente" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido. Certifique-se de que o ID é um número." },
        { status: 400 }
      );
    }
    const supplier = await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({
      message: "Cliente deletado com sucesso.",
      deletedId: id,
      supplier,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erro ao deletar Fornecedor" }),
      {
        status: 400,
      }
    );
  }
}
