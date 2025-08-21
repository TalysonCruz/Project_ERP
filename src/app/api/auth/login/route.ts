import prisma from "@/lib/db";
import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/jwt";
import "dotenv/config";

export async function POST(req: NextRequest) {
  try {
    const { password, email } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email e senha são obrigatórios!" }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Credenciais inválidas!" }),
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "Credenciais inválidas!" }),
        {
          status: 401,
        }
      );
    }

    const token = generateToken({
      userID: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutSensitive } = user;

    return new Response(
      JSON.stringify({ user: userWithoutSensitive, token: token }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erro interno no servidor" }),
      { status: 500 }
    );
  }
}
