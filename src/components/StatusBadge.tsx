import type { HandRaise } from "@/types/app";

const labels: Record<HandRaise["status"], string> = {
  WAITING: "En cola",
  REVIEWING: "En revision",
  LOWERED: "Bajo la mano",
  CORRECT: "Correcto",
  INCORRECT: "Incorrecto",
};

const styles: Record<HandRaise["status"], string> = {
  WAITING: "bg-slate-100 text-slate-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  LOWERED: "bg-zinc-100 text-zinc-600",
  CORRECT: "bg-emerald-100 text-emerald-700",
  INCORRECT: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: HandRaise["status"] }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
