import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ handRaiseId: string }> },
) {
  try {
    const { handRaiseId } = await context.params;
    const body = await request.json();
    const action = String(body.action ?? "");

    const handRaise = await prisma.handRaise.findUnique({
      where: { id: handRaiseId },
    });

    if (!handRaise) {
      return badRequest("No existe esa mano levantada.");
    }

    if (action === "lower") {
      const updated = await prisma.handRaise.update({
        where: { id: handRaiseId },
        data: { status: "LOWERED" },
      });
      return NextResponse.json({ handRaise: updated });
    }

    if (action === "review") {
      const updated = await prisma.handRaise.update({
        where: { id: handRaiseId },
        data: { status: "REVIEWING" },
      });
      return NextResponse.json({ handRaise: updated });
    }

    if (action === "correct" || action === "incorrect") {
      const isCorrect = action === "correct";

      const updated = await prisma.$transaction(async (tx) => {
        const current = await tx.handRaise.update({
          where: { id: handRaiseId },
          data: { status: isCorrect ? "CORRECT" : "INCORRECT" },
        });

        await tx.participation.upsert({
          where: { handRaiseId },
          create: {
            handRaiseId,
            roundId: current.roundId,
            studentId: current.studentId,
            isCorrect,
            points: isCorrect ? 1 : 0,
          },
          update: {
            isCorrect,
            points: isCorrect ? 1 : 0,
          },
        });

        return current;
      });

      return NextResponse.json({ handRaise: updated });
    }

    return badRequest("Accion no valida.");
  } catch (error) {
    return serverError(error);
  }
}
