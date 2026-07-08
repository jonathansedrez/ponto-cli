export interface Session {
  in: string;
  out: string | null;
  durationMinutes: number;
  ongoing: boolean;
}

export type LeaveAtResult =
  | { kind: "in-progress"; time: string }
  | { kind: "goal-met" }
  | { kind: "incomplete" };
