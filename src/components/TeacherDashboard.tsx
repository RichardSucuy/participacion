"use client";

import { Check, Eye, LogOut, Play, Plus, RotateCcw, Square, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Podium } from "@/components/Podium";
import { StatusBadge } from "@/components/StatusBadge";
import type { HandRaise, HistoryRow, Parallel, PodiumEntry, Round, Student } from "@/types/app";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Error inesperado");
  return data as T;
}

export function TeacherDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [parallels, setParallels] = useState<Parallel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parallelId, setParallelId] = useState("");
  const [parallelName, setParallelName] = useState("");
  const [roundTitle, setRoundTitle] = useState("");
  const [round, setRound] = useState<Round | null>(null);
  const [queue, setQueue] = useState<HandRaise[]>([]);
  const [podium, setPodium] = useState<PodiumEntry[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    window.setTimeout(() => {
      setAuthenticated(localStorage.getItem("teacher-auth") === "true");
    }, 0);
    loadParallels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!parallelId) return;
    loadStudents();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parallelId]);

  useEffect(() => {
    if (!parallelId || !authenticated) return;

    let stopped = false;
    async function loadLiveState() {
      try {
        const roundData = await jsonFetch<{ round: Round | null }>(`/api/rounds?parallelId=${parallelId}`);
        if (stopped) return;
        setRound(roundData.round);

        if (!roundData.round) {
          setQueue([]);
          setPodium([]);
          return;
        }

        const queueData = await jsonFetch<{ handRaises: HandRaise[]; podium: PodiumEntry[] }>(
          `/api/queue?roundId=${roundData.round.id}`,
        );
        if (!stopped) {
          setQueue(queueData.handRaises);
          setPodium(queueData.podium);
        }
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
  }, [parallelId, authenticated]);

  const activeQueue = useMemo(
    () => queue.filter((item) => item.status === "WAITING" || item.status === "REVIEWING"),
    [queue],
  );

  async function loadParallels() {
    const data = await jsonFetch<{ parallels: Parallel[] }>("/api/parallels");
    setParallels(data.parallels);
    if (!parallelId && data.parallels[0]) setParallelId(data.parallels[0].id);
  }

  async function loadStudents() {
    const data = await jsonFetch<{ students: Student[] }>(`/api/students?parallelId=${parallelId}`);
    setStudents(data.students);
  }

  async function loadHistory() {
    const data = await jsonFetch<{ summary: HistoryRow[] }>(`/api/history?parallelId=${parallelId}`);
    setHistory(data.summary);
  }

  async function login() {
    setBusy(true);
    setMessage("");
    try {
      await jsonFetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "teacher", pin }),
      });
      localStorage.setItem("teacher-auth", "true");
      setAuthenticated(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo ingresar");
    } finally {
      setBusy(false);
    }
  }

  async function createParallel() {
    if (!parallelName.trim()) return;
    setBusy(true);
    try {
      await jsonFetch("/api/parallels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: parallelName }),
      });
      setParallelName("");
      await loadParallels();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear paralelo");
    } finally {
      setBusy(false);
    }
  }

  async function startRound() {
    setBusy(true);
    try {
      const data = await jsonFetch<{ round: Round }>("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parallelId, title: roundTitle }),
      });
      setRound(data.round);
      setRoundTitle("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo abrir ronda");
    } finally {
      setBusy(false);
    }
  }

  async function closeRound() {
    if (!round) return;
    await jsonFetch(`/api/rounds/${round.id}/close`, { method: "POST" });
    setRound(null);
    await loadHistory();
  }

  async function clearHands() {
    if (!round) return;
    await jsonFetch(`/api/rounds/${round.id}/clear`, { method: "POST" });
  }

  async function action(handRaiseId: string, actionName: string) {
    await jsonFetch(`/api/hand-raises/${handRaiseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionName }),
    });
    await loadHistory();
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
        <h1 className="text-3xl font-semibold text-slate-950">Panel docente</h1>
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-medium text-slate-700">Clave docente</label>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && login()}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3"
            type="password"
          />
          <button disabled={busy} onClick={login} className="mt-4 h-11 w-full rounded-md bg-slate-900 font-medium text-white">
            Ingresar
          </button>
          {message ? <p className="mt-3 text-sm text-rose-700">{message}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Participacion Logica</p>
          <h1 className="text-3xl font-semibold text-slate-950">Panel docente</h1>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700"
          onClick={() => {
            localStorage.removeItem("teacher-auth");
            setAuthenticated(false);
          }}
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="grid content-start gap-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-sm font-medium text-slate-700">Paralelo activo</label>
            <select value={parallelId} onChange={(event) => setParallelId(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3">
              {parallels.map((parallel) => (
                <option key={parallel.id} value={parallel.id}>{parallel.name}</option>
              ))}
            </select>
            <div className="mt-3 flex gap-2">
              <input value={parallelName} onChange={(event) => setParallelName(event.target.value)} placeholder="Nuevo paralelo" className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3" />
              <button title="Crear paralelo" disabled={busy} onClick={createParallel} className="grid h-10 w-10 place-items-center rounded-md bg-slate-900 text-white">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-sm font-medium text-slate-700">Ronda</label>
            <input value={roundTitle} onChange={(event) => setRoundTitle(event.target.value)} placeholder="Tema o ejercicio" className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button disabled={!parallelId || busy} onClick={startRound} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 text-sm font-medium text-white">
                <Play className="h-4 w-4" />
                Abrir
              </button>
              <button disabled={!round} onClick={closeRound} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700">
                <Square className="h-4 w-4" />
                Cerrar
              </button>
            </div>
            <button disabled={!round} onClick={clearHands} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700">
              <RotateCcw className="h-4 w-4" />
              Bajar todas las manos
            </button>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-950">Estudiantes</h2>
            <p className="mt-1 text-sm text-slate-500">{students.length} registrados</p>
          </section>
        </aside>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Cola en vivo</h2>
                <p className="text-sm text-slate-500">{round ? round.title : "Sin ronda activa"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {activeQueue.length} en espera
              </span>
            </div>

            <div className="grid gap-2">
              {queue.length === 0 ? (
                <div className="rounded-md bg-slate-50 p-8 text-center text-slate-500">Aun no hay manos levantadas.</div>
              ) : (
                queue.map((item, index) => (
                  <div key={item.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-[64px_1fr_auto] md:items-center">
                    <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                    <div>
                      <p className="font-semibold text-slate-950">{item.student.firstName} {item.student.lastName}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button title="Revisar" onClick={() => action(item.id, "review")} className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-700"><Eye className="h-4 w-4" /></button>
                      <button title="Correcto" onClick={() => action(item.id, "correct")} className="grid h-9 w-9 place-items-center rounded-md bg-emerald-600 text-white"><Check className="h-4 w-4" /></button>
                      <button title="Incorrecto" onClick={() => action(item.id, "incorrect")} className="grid h-9 w-9 place-items-center rounded-md bg-rose-600 text-white"><X className="h-4 w-4" /></button>
                      <button title="Bajar mano" onClick={() => action(item.id, "lower")} className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-700"><RotateCcw className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="grid content-start gap-5">
            <Podium entries={podium} />
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold text-slate-950">Historial</h2>
              <div className="grid gap-2">
                {history
                  .slice()
                  .sort((a, b) => b.points - a.points || b.correct - a.correct)
                  .slice(0, 8)
                  .map((row) => (
                    <div key={row.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                      <span>{row.firstName} {row.lastName}</span>
                      <span className="font-semibold">{row.points} pts</span>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-rose-700">{message}</p> : null}
    </main>
  );
}
