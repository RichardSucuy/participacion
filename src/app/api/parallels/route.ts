import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api";
import { normalizeName } from "@/lib/names";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const parallels = await prisma.parallel.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { students: true } } },
    });

    return NextResponse.json({ parallels });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = normalizeName(String(body.name ?? ""));

    if (!name) {
      return badRequest("Escribe el nombre del paralelo.");
    }

    const parallel = await prisma.parallel.create({
      data: { name },
    });

    return NextResponse.json({ parallel }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
