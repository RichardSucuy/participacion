import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api";
import { normalizeName } from "@/lib/names";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parallelId = searchParams.get("parallelId") ?? undefined;

    const students = await prisma.student.findMany({
      where: { parallelId },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        parallelId: true,
        parallel: { select: { name: true } },
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const firstName = normalizeName(String(body.firstName ?? ""));
    const lastName = normalizeName(String(body.lastName ?? ""));
    const password = String(body.password ?? "");
    const parallelId = String(body.parallelId ?? "");

    if (!firstName || !lastName || !parallelId) {
      return badRequest("Completa nombres, apellidos y paralelo.");
    }

    if (password.length < 4) {
      return badRequest("La clave debe tener al menos 4 caracteres.");
    }

    const passwordHash = await hash(password, 10);
    const student = await prisma.student.create({
      data: { firstName, lastName, passwordHash, parallelId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        parallelId: true,
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
