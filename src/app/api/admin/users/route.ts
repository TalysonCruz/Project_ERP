import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({
          message: "Todos os campos precisam estar preenchidos",
        }),
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Usuário já cadastrado!" }),
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: newPassword,
        role: role,
      },
    });

    const { password: _, ...userWithoutSensitive } = newUser;

    return new Response(JSON.stringify(userWithoutSensitive), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erro ao criar usuario" }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany();

    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Erro desconhecido ao buscar o inventário" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const numericId = Number(id);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { message: "User não encontrado" },
        { status: 404 }
      );
    }
    await prisma.user.delete({ where: { id: numericId } });

    return NextResponse.json(
      { message: "User deletado com sucesso", deletedId: id },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro desconhecido ao buscar o inventário" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, email, password, role } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const data: any = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    const { password: _, ...userWithoutSensitive } = updatedUser;

    return NextResponse.json(userWithoutSensitive, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}
