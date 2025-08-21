import prisma from "@/lib/db";
import {
  validadorEmail,
  validarCNPJ,
  validarTelefone,
} from "@/utils/validator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, cnpj: cpnjInput, tel } = await req.json();

    if (!name || !email || !cpnjInput || !tel) {
      return new Response(
        JSON.stringify({ message: "Por favor insira todos os dados" }),
        { status: 400 }
      );
    }

    const telefoneValidado = validarTelefone(tel);
    const cpnjValidado = validarCNPJ(cpnjInput);
    const emailValidado = validadorEmail(email);

    const client = await prisma.client.create({
      data: {
        name,
        email: emailValidado.email,
        cnpj: cpnjValidado,
        tel: telefoneValidado,
      },
    });

    return new Response(JSON.stringify(client), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erro ao criar cliente" }), {
      status: 400,
    });
  }
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany();
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar usuários" },
      { status: 400 }
    );
  }
}

// export async function DELETE(req: NextRequest) {
//   try {
//     const { id } = await req.json();
//     const numericId = Number(id);
//     if (isNaN(numericId)) {
//       return NextResponse.json(
//         { error: "ID inválido. Certifique-se de que o ID é um número." },
//         { status: 400 }
//       );
//     }
//     const client = await prisma.client.delete({ where: { id: numericId } });
//     return NextResponse.json({
//       message: "Cliente deletado com sucesso.",
//       deletedId: numericId,
//       client,
//     });
//   } catch (error) {
//     console.error(error);
//     return new Response(
//       JSON.stringify({ message: "Erro ao deletar usuário" }),
//       {
//         status: 400,
//       }
//     );
//   }
// }

export async function PUT(req: NextRequest) {
  try {
    const { id, name, email, cnpj: cnpjInput, tel } = await req.json();
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
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Erro ao atualizar usu��rio" },
      { status: 400 }
    );
  }
}
