import Link from "next/link";
import type { ReactNode } from "react";
import { GraduationCap, Monitor, UserRound } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-8">
      <p className="text-sm font-medium text-slate-500">UTMACH Nivelacion</p>
      <h1 className="mt-2 max-w-2xl text-4xl font-semibold text-slate-950">
        Participacion Logica
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Control local de participaciones por paralelo, con cola ordenada,
        validacion docente, historial y podio de ronda.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <EntryCard
          href="/estudiante"
          icon={<UserRound />}
          title="Estudiante"
          text="Ingresar, levantar o bajar la mano."
        />
        <EntryCard
          href="/docente"
          icon={<GraduationCap />}
          title="Docente"
          text="Abrir rondas, validar respuestas y revisar historial."
        />
        <EntryCard
          href="/pantalla"
          icon={<Monitor />}
          title="Pantalla"
          text="Proyectar la cola y el podio en el aula."
        />
      </div>
    </main>
  );
}

function EntryCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-md bg-slate-100 text-slate-800">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}
