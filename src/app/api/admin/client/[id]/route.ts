import {
  validadorEmail,
  validarCNPJ,
  validarTelefone,
} from "@/utils/validator";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      return NextResponse.json(
        { message: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar cliente" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "ID inválido. Certifique-se de que o ID é um número." },
        { status: 400 }
      );
    }
    const client = await prisma.client.delete({ where: { id: numericId } });
    return NextResponse.json({
      message: "Cliente deletado com sucesso.",
      deletedId: numericId,
      client,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erro ao deletar cliente" }),
      {
        status: 400,
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = Number(segments.pop());

    const { name, email, cnpj: cnpjInput, tel } = await req.json();
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "ID inválido. Certifique-se de que o ID é um número." },
        { status: 400 }
      );
    }

    const telefoneValidado = validarTelefone(tel);
    const cnpjValidado = validarCNPJ(cnpjInput);
    const emailValidado = validadorEmail(email);

    const client = await prisma.client.update({
      where: { id: numericId },
      data: {
        name,
        cnpj: cnpjValidado,
        email: emailValidado.email,
        tel: telefoneValidado,
      },
    });

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erro ao atualizar cliente" },
      { status: 400 }
    );
  }
}
