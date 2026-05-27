import { NextResponse } from "next/server";

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "No autorizado") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function serverError(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { error: "No se pudo completar la operacion." },
    { status: 500 },
  );
}
