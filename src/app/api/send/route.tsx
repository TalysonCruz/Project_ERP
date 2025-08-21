import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message, attachment } = await req.json();

    // Validação básica
    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    const emailData: {
      from: string;
      to: string;
      subject: string;
      html: string;
      attachments?: Array<{
        filename: string;
        content: string;
      }>;
    } = {
      from: "Talyson Cruz Ribeiro <onboarding@resend.dev>",
      to,
      subject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${message}
      </div>`,
    };

    // Adiciona anexo se fornecido
    if (attachment && attachment.content) {
      emailData.attachments = [
        {
          filename: attachment.filename || "documento.pdf",
          content: attachment.content,
        },
      ];
    }

    const data = await resend.emails.send(emailData);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Erro ao enviar email:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error || "Erro interno do servidor",
          details: process.env.NODE_ENV === "development" ? error : undefined,
        },
      },
      { status: 500 }
    );
  }
}
