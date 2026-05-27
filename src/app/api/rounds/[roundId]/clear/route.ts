import { NextResponse } from "next/server";
import { serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ roundId: string }> },
) {
  try {
    const { roundId } = await context.params;

    await prisma.handRaise.updateMany({
      where: { roundId, status: { in: ["WAITING", "REVIEWING"] } },
      data: { status: "LOWERED" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
