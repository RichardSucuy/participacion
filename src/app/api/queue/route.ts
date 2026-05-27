import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get("roundId");

    if (!roundId) {
      return badRequest("Falta la ronda.");
    }

    const handRaises = await prisma.handRaise.findMany({
      where: { roundId },
      orderBy: { raisedAt: "asc" },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    const podium = await prisma.participation.findMany({
      where: { roundId, points: { gt: 0 } },
      orderBy: { createdAt: "asc" },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      take: 5,
    });

    return NextResponse.json({ handRaises, podium });
  } catch (error) {
    return serverError(error);
  }
}
