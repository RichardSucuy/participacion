import { NextResponse } from "next/server";
import { serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ roundId: string }> },
) {
  try {
    const { roundId } = await context.params;
    const round = await prisma.round.update({
      where: { id: roundId },
      data: { status: "CLOSED", closedAt: new Date() },
    });

    return NextResponse.json({ round });
  } catch (error) {
    return serverError(error);
  }
}
