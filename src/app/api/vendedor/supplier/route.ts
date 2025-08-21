import prisma from "@/lib/db";
import {
  validadorEmail,
  validarCNPJ,
  validarTelefone,
} from "@/utils/validator";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supplier = await prisma.supplier.findMany();

    return new NextResponse(JSON.stringify(supplier), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar fornecedores" },
      { status: 400 }
    );
  }
}

// export async function DELETE(req: NextRequest) {
//   try {
//     const { id } = await req.json();
//     const numericId = Number(id);

//     const supplier = await prisma.supplier.delete({ where: { id: numericId } });

//     return NextResponse.json({
//       message: "Cliente deletado com sucesso.",
//       deletedId: numericId,
//       supplier,
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

export async function POST(req: NextRequest) {
  try {
    const { name, email, cnpj: cnpjInput, tel } = await req.json();

    if (!name || !email || !cnpjInput || !tel) {
      return new Response(
        JSON.stringify({ message: "Por favor insira todos os dados" }),
        { status: 400 }
      );
    }

    const verifiedEmail = validadorEmail(email);
    const verifiedCpj = validarCNPJ(cnpjInput);
    const verifiedTel = validarTelefone(tel);

    const supplier = await prisma.supplier.create({
      data: {
        name: name,
        email: verifiedEmail.email,
        cnpj: verifiedCpj,
        tel: verifiedTel,
      },
    });
    return new Response(JSON.stringify(supplier), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro ao criar supplier" }), {
      status: 400,
    });
  }
}
