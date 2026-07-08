export interface Session {
  in: string;
  out: string | null;
  durationMinutes: number;
  ongoing: boolean;
}
