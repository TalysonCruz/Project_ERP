import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inventory = await prisma.inventory
      .findMany({
        include: {
          produto: {
            include: {
              category: true,
            },
          },
          client: true,
          supplier: true,
        },
        orderBy: {
          created_at: "desc",
        },
      })
      .catch(async (error) => {
        return await prisma.inventory.findMany({
          orderBy: {
            created_at: "desc",
          },
        });
      });

    return NextResponse.json(inventory, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("[v0] Erro na API de inventário:", error);

    if (error instanceof Error) {
      console.error("[v0] Detalhes do erro:", error.message);
      return NextResponse.json(
        {
          message: `Erro ao buscar inventário: ${error.message}`,
          error: error.message,
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.json(
      {
        message: "Erro desconhecido ao buscar o inventário",
        error: "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
