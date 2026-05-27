import { Medal, Trophy } from "lucide-react";
import type { PodiumEntry } from "@/types/app";

const places = [
  { label: "2", height: "h-32", tone: "bg-slate-200", order: "order-1" },
  { label: "1", height: "h-44", tone: "bg-amber-200", order: "order-2" },
  { label: "3", height: "h-24", tone: "bg-stone-200", order: "order-3" },
];

function nameOf(entry?: PodiumEntry) {
  if (!entry) return "Sin asignar";
  return `${entry.student.firstName} ${entry.student.lastName}`;
}

export function Podium({ entries }: { entries: PodiumEntry[] }) {
  const ordered = [entries[1], entries[0], entries[2]];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-slate-900">
        <Trophy className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold">Podio de la ronda</h2>
      </div>
      <div className="grid min-h-64 grid-cols-3 items-end gap-3">
        {places.map((place, index) => (
          <div
            key={place.label}
            className={`podium-rise flex flex-col items-center ${place.order}`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="mb-3 flex min-h-16 items-end text-center text-sm font-medium text-slate-700">
              {nameOf(ordered[index])}
            </div>
            <div
              className={`${place.height} ${place.tone} flex w-full flex-col items-center justify-center rounded-t-lg border border-slate-300 text-slate-900`}
            >
              <Medal className="mb-2 h-6 w-6" />
              <span className="text-3xl font-bold">{place.label}</span>
            </div>
          </div>
        ))}
      </div>
      {entries.length > 3 ? (
        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          {entries.slice(3).map((entry, index) => (
            <div key={entry.id} className="flex justify-between rounded-md bg-slate-50 px-3 py-2">
              <span>{index + 4}. {nameOf(entry)}</span>
              <span>{entry.points} punto</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
