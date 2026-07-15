export interface Config {
  contractHours: number;
  workingDaysCurrentMonth: number;
}

export interface DayEntry {
  date: string;
  stamps: string[];
}

export type Timesheet = DayEntry[];
