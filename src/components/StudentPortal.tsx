"use client";

import { Hand, LogOut, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { HandRaise, Parallel, Round, Student } from "@/types/app";
import { StatusBadge } from "./StatusBadge";

type SessionStudent = Student & { parallelName: string };

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Error inesperado");
  return data as T;
}

export function StudentPortal() {
  const [parallels, setParallels] = useState<Parallel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parallelId, setParallelId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<SessionStudent | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [queue, setQueue] = useState<HandRaise[]>([]);
  const [message, setMessage] = useState("");
  const [registering, setRegistering] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    jsonFetch<{ parallels: Parallel[] }>("/api/parallels")
      .then((data) => setParallels(data.parallels))
      .catch((error) => setMessage(error.message));

    window.setTimeout(() => {
      const stored = localStorage.getItem("student-session");
      if (stored) setSession(JSON.parse(stored));
    }, 0);
  }, []);

  useEffect(() => {
    if (!parallelId) return;

    jsonFetch<{ students: Student[] }>(`/api/students?parallelId=${parallelId}`)
      .then((data) => setStudents(data.students))
      .catch((error) => setMessage(error.message));
  }, [parallelId]);

  useEffect(() => {
    if (!session) return;

    let stopped = false;
    async function loadLiveState() {
      try {
        const roundData = await jsonFetch<{ round: Round | null }>(
          `/api/rounds?parallelId=${session!.parallelId}`,
        );
        if (stopped) return;
        setRound(roundData.round);

        if (!roundData.round) {
          setQueue([]);
          return;
        }

        const queueData = await jsonFetch<{ handRaises: HandRaise[] }>(
          `/api/queue?roundId=${roundData.round.id}`,
        );
        if (!stopped) setQueue(queueData.handRaises);
      } catch (error) {
        if (!stopped) setMessage(error instanceof Error ? error.message : "Error de conexion");
      }
    }

    loadLiveState();
    const interval = window.setInterval(loadLiveState, 1000);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [session]);

  const myHand = useMemo(
    () => queue.find((item) => item.studentId === session?.id) ?? null,
    [queue, session],
  );

  const activeQueue = queue.filter((item) => item.status === "WAITING" || item.status === "REVIEWING");
  const myPosition = myHand ? activeQueue.findIndex((item) => item.id === myHand.id) + 1 : 0;

  async function login() {
    setBusy(true);
    setMessage("");
    try {
      const data = await jsonFetch<{ student: SessionStudent }>("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student", studentId, password }),
      });
      setSession(data.student);
      localStorage.setItem("student-session", JSON.stringify(data.student));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo iniciar sesion");
    } finally {
      setBusy(false);
    }
  }

  async function register() {
    setBusy(true);
    setMessage("");
    try {
      const data = await jsonFetch<{ student: Student }>("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, password, parallelId }),
      });
      setRegistering(false);
      setStudentId(data.student.id);
      setFirstName("");
      setLastName("");
      const refreshed = await jsonFetch<{ students: Student[] }>(`/api/students?parallelId=${parallelId}`);
      setStudents(refreshed.students);
      setMessage("Registro creado. Ahora ingresa con tu clave.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo registrar");
    } finally {
      setBusy(false);
    }
  }

  async function raiseHand() {
    if (!round || !session) return;
    setBusy(true);
    try {
      await jsonFetch("/api/hand-raises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId: round.id, studentId: session.id }),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo levantar la mano");
    } finally {
      setBusy(false);
    }
  }

  async function lowerHand() {
    if (!myHand) return;
    setBusy(true);
    try {
      await jsonFetch(`/api/hand-raises/${myHand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lower" }),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo bajar la mano");
    } finally {
      setBusy(false);
    }
  }

  if (session) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{session.parallelName}</p>
            <h1 className="text-2xl font-semibold text-slate-950">
              {session.firstName} {session.lastName}
            </h1>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700"
            onClick={() => {
              localStorage.removeItem("student-session");
              setSession(null);
            }}
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ronda actual</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {round ? round.title : "El docente aun no abre participacion"}
          </h2>

          <button
            disabled={!round || busy || myHand?.status === "WAITING" || myHand?.status === "REVIEWING" || myHand?.status === "CORRECT" || myHand?.status === "INCORRECT"}
            onClick={raiseHand}
            className="mt-6 flex h-28 w-full items-center justify-center gap-3 rounded-lg bg-slate-900 text-xl font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Hand className="h-8 w-8" />
            Levantar mano
          </button>

          {myHand ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">Tu estado</p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={myHand.status} />
                  {myPosition > 0 ? <span className="font-semibold text-slate-900">Puesto {myPosition}</span> : null}
                </div>
              </div>
              {(myHand.status === "WAITING" || myHand.status === "REVIEWING") ? (
                <button
                  onClick={lowerHand}
                  className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700"
                >
                  Bajar mano
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        {message ? <p className="mt-4 text-sm text-rose-700">{message}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-8">
      <div className="mb-7">
        <p className="text-sm font-medium text-slate-500">Participacion Logica</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Ingreso estudiante</h1>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-medium text-slate-700">Paralelo</label>
        <select
          value={parallelId}
          onChange={(event) => setParallelId(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-900"
        >
          <option value="">Seleccionar</option>
          {parallels.map((parallel) => (
            <option key={parallel.id} value={parallel.id}>{parallel.name}</option>
          ))}
        </select>

        {registering ? (
          <div className="mt-4 grid gap-3">
            <input className="h-11 rounded-md border border-slate-300 px-3" placeholder="Nombres" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            <input className="h-11 rounded-md border border-slate-300 px-3" placeholder="Apellidos" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            <input className="h-11 rounded-md border border-slate-300 px-3" placeholder="Clave" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button disabled={busy} onClick={register} className="h-11 rounded-md bg-slate-900 px-4 font-medium text-white">Crear registro</button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="h-11 rounded-md border border-slate-300 bg-white px-3">
              <option value="">Selecciona tu nombre</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
              ))}
            </select>
            <input className="h-11 rounded-md border border-slate-300 px-3" placeholder="Clave" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button disabled={busy} onClick={login} className="h-11 rounded-md bg-slate-900 px-4 font-medium text-white">Ingresar</button>
          </div>
        )}

        <button
          onClick={() => setRegistering((value) => !value)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700"
        >
          <UserPlus className="h-4 w-4" />
          {registering ? "Ya tengo registro" : "Crear mi registro"}
        </button>
        {message ? <p className="mt-4 text-sm text-rose-700">{message}</p> : null}
      </section>
    </main>
  );
}
