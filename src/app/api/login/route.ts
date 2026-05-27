import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { badRequest, serverError, unauthorized } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = String(body.role ?? "");

    if (role === "teacher") {
      const pin = String(body.pin ?? "");
      const expectedPin = process.env.TEACHER_PIN ?? "1234";

      if (pin !== expectedPin) {
        return unauthorized("Clave docente incorrecta.");
      }

      return NextResponse.json({ teacher: true });
    }

    if (role !== "student") {
      return badRequest("Rol invalido.");
    }

    const studentId = String(body.studentId ?? "");
    const password = String(body.password ?? "");

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parallel: true },
    });

    if (!student || !(await compare(password, student.passwordHash))) {
      return unauthorized("Estudiante o clave incorrecta.");
    }

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        parallelId: student.parallelId,
        parallelName: student.parallel.name,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
