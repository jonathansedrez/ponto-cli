import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Config, Timesheet, Offdays } from "./types";

const PONTO_DIR = join(process.env.HOME ?? "~", ".ponto");
const CONFIG_PATH = join(PONTO_DIR, "config.json");
const DATA_PATH = join(PONTO_DIR, "timesheet.json");
const OFFDAYS_PATH = join(PONTO_DIR, "offdays.json");

const DEFAULT_CONFIG: Config = {
  contractHours: 160,
  workingDaysCurrentMonth: 21,
};

export async function initStorage(): Promise<void> {
  await mkdir(PONTO_DIR, { recursive: true });

  const configFile = Bun.file(CONFIG_PATH);
  if (!(await configFile.exists())) {
    await Bun.write(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  const dataFile = Bun.file(DATA_PATH);
  if (!(await dataFile.exists())) {
    await Bun.write(DATA_PATH, JSON.stringify([], null, 2));
  }

  const ofdaysFile = Bun.file(OFFDAYS_PATH);
  if (!(await ofdaysFile.exists())) {
    await Bun.write(OFFDAYS_PATH, JSON.stringify([], null, 2));
  }
}

export async function readConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_PATH);
  return file.json() as Promise<Config>;
}

export async function writeConfig(config: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function readTimesheet(): Promise<Timesheet> {
  const file = Bun.file(DATA_PATH);
  return file.json() as Promise<Timesheet>;
}

export async function writeTimesheet(timesheet: Timesheet): Promise<void> {
  await Bun.write(DATA_PATH, JSON.stringify(timesheet, null, 2));
}

export async function readOffdays(): Promise<Offdays> {
  const file = Bun.file(OFFDAYS_PATH);
  if (!(await file.exists())) return [];
  const data = await file.json();
  if (!Array.isArray(data)) return [];
  return data as Offdays;
}

export async function writeOffdays(offdays: Offdays): Promise<void> {
  await Bun.write(OFFDAYS_PATH, JSON.stringify(offdays, null, 2));
}

export { PONTO_DIR, CONFIG_PATH, DATA_PATH, OFFDAYS_PATH };
export type { Config, Timesheet, Offdays };
