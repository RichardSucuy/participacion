export type Parallel = {
  id: string;
  name: string;
  _count?: { students: number };
};

export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  parallelId: string;
  parallelName?: string;
  parallel?: { name: string };
};

export type Round = {
  id: string;
  title: string;
  status: "ACTIVE" | "CLOSED";
  parallelId: string;
  openedAt: string;
};

export type HandRaise = {
  id: string;
  roundId: string;
  studentId: string;
  status: "WAITING" | "REVIEWING" | "LOWERED" | "CORRECT" | "INCORRECT";
  raisedAt: string;
  student: Pick<Student, "id" | "firstName" | "lastName">;
};

export type PodiumEntry = {
  id: string;
  points: number;
  createdAt: string;
  student: Pick<Student, "id" | "firstName" | "lastName">;
};

export type HistoryRow = {
  id: string;
  firstName: string;
  lastName: string;
  parallelName: string;
  points: number;
  correct: number;
  incorrect: number;
  attempts: number;
};
