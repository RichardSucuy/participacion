"use client";

import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { Podium } from "@/components/Podium";
import { StatusBadge } from "@/components/StatusBadge";
import type { HandRaise, Parallel, PodiumEntry, Round } from "@/types/app";

async function jsonFetch<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Error inesperado");
  return data as T;
}

export function DisplayBoard() {
  const [parallels, setParallels] = useState<Parallel[]>([]);
  const [parallelId, setParallelId] = useState("");
  const [round, setRound] = useState<Round | null>(null);
  const [queue, setQueue] = useState<HandRaise[]>([]);
  const [podium, setPodium] = useState<PodiumEntry[]>([]);

  useEffect(() => {
    jsonFetch<{ parallels: Parallel[] }>("/api/parallels").then((data) => {
      setParallels(data.parallels);
      if (data.parallels[0]) setParallelId(data.parallels[0].id);
    });
  }, []);

  useEffect(() => {
    if (!parallelId) return;

    let stopped = false;
    async function loadLiveState() {
      const roundData = await jsonFetch<{ round: Round | null }>(
        `/api/rounds?parallelId=${parallelId}`,
      );
      if (stopped) return;
      setRound(roundData.round);

      if (!roundData.round) {
        setQueue([]);
        setPodium([]);
        return;
      }

      const queueData = await jsonFetch<{
        handRaises: HandRaise[];
        podium: PodiumEntry[];
      }>(`/api/queue?roundId=${roundData.round.id}`);
      if (!stopped) {
        setQueue(queueData.handRaises);
        setPodium(queueData.podium);
      }
    }

    loadLiveState();
    const interval = window.setInterval(loadLiveState, 1000);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [parallelId]);

  const activeQueue = queue.filter(
    (item) => item.status === "WAITING" || item.status === "REVIEWING",
  );

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-6">
      <header className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-slate-800 shadow-sm">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pantalla de aula</p>
            <h1 className="text-3xl font-semibold text-slate-950">
              {round ? round.title : "Sin ronda activa"}
            </h1>
          </div>
        </div>
        <select
          value={parallelId}
          onChange={(event) => setParallelId(event.target.value)}
          className="h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-900"
        >
          {parallels.map((parallel) => (
            <option key={parallel.id} value={parallel.id}>
              {parallel.name}
            </option>
          ))}
        </select>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_380px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">
              Orden de participacion
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {activeQueue.length} activos
            </span>
          </div>
          <div className="grid gap-3">
            {activeQueue.length === 0 ? (
              <div className="rounded-md bg-slate-50 p-10 text-center text-lg text-slate-500">
                Esperando participaciones.
              </div>
            ) : (
              activeQueue.slice(0, 10).map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[72px_1fr_auto] items-center rounded-md border border-slate-200 px-4 py-3"
                >
                  <div className="text-3xl font-bold text-slate-400">
                    {index + 1}
                  </div>
                  <div className="text-xl font-semibold text-slate-950">
                    {item.student.firstName} {item.student.lastName}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </section>
        <Podium entries={podium} />
      </div>
    </main>
  );
}
