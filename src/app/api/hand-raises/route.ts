import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roundId = String(body.roundId ?? "");
    const studentId = String(body.studentId ?? "");

    if (!roundId || !studentId) {
      return badRequest("Falta estudiante o ronda.");
    }

    const existing = await prisma.handRaise.findUnique({
      where: { roundId_studentId: { roundId, studentId } },
    });

    if (existing) {
      if (["WAITING", "REVIEWING", "CORRECT", "INCORRECT"].includes(existing.status)) {
        return NextResponse.json({ handRaise: existing });
      }

      const handRaise = await prisma.handRaise.update({
        where: { id: existing.id },
        data: { status: "WAITING", raisedAt: new Date() },
      });

      return NextResponse.json({ handRaise });
    }

    const handRaise = await prisma.handRaise.create({
      data: { roundId, studentId },
    });

    return NextResponse.json({ handRaise }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
