import { NextResponse } from "next/server";
import { serverError } from "@/lib/api";
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
        parallel: { select: { name: true } },
        participations: {
          select: { isCorrect: true, points: true },
        },
        handRaises: {
          select: { status: true },
        },
      },
    });

    const summary = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      parallelName: student.parallel.name,
      points: student.participations.reduce((sum, item) => sum + item.points, 0),
      correct: student.participations.filter((item) => item.isCorrect).length,
      incorrect: student.participations.filter((item) => !item.isCorrect).length,
      attempts: student.handRaises.length,
    }));

    return NextResponse.json({ summary });
  } catch (error) {
    return serverError(error);
  }
}
