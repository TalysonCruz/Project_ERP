import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const vendedores = await prisma.user.findMany({
      where: { role: "VENDEDOR" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(vendedores, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Erro desconhecido ao buscar vendedores" },
      { status: 500 }
    );
  }
}
