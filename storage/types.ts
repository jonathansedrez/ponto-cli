export interface Config {
  contractHours: number;
  clockType: "24h" | "am/pm";
  workingDaysCurrentMonth: number;
}

export interface DayEntry {
  date: string;
  stamps: string[];
}

export type Timesheet = DayEntry[];
