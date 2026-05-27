import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parallelId = searchParams.get("parallelId");

    if (!parallelId) {
      return badRequest("Selecciona un paralelo.");
    }

    const round = await prisma.round.findFirst({
      where: { parallelId, status: "ACTIVE" },
      orderBy: { openedAt: "desc" },
    });

    return NextResponse.json({ round });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parallelId = String(body.parallelId ?? "");
    const title = String(body.title ?? "").trim() || "Participacion en clase";

    if (!parallelId) {
      return badRequest("Selecciona un paralelo.");
    }

    await prisma.round.updateMany({
      where: { parallelId, status: "ACTIVE" },
      data: { status: "CLOSED", closedAt: new Date() },
    });

    const round = await prisma.round.create({
      data: { parallelId, title },
    });

    return NextResponse.json({ round }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
