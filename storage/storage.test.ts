import { test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "ponto-test-"));
  process.env.HOME = tmpDir;
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

test("initStorage creates ~/.ponto/ with config.json and data.json", async () => {
  const { initStorage } = await import("./index");
  await initStorage();

  const configFile = Bun.file(join(tmpDir, ".ponto", "config.json"));
  const dataFile = Bun.file(join(tmpDir, ".ponto", "timesheet.json"));

  expect(await configFile.exists()).toBe(true);
  expect(await dataFile.exists()).toBe(true);
});

test("readConfig returns default config", async () => {
  const { readConfig } = await import("./index");
  const config = await readConfig();

  expect(config.contractHours).toBe(160);
  expect(config.workingDaysCurrentMonth).toBe(21);
});

test("writeConfig persists changes", async () => {
  const { readConfig, writeConfig } = await import("./index");
  const config = await readConfig();
  config.contractHours = 120;
  await writeConfig(config);

  const updated = await readConfig();
  expect(updated.contractHours).toBe(120);
});

test("readTimesheet returns empty array on init", async () => {
  const { readTimesheet } = await import("./index");
  const timesheet = await readTimesheet();
  expect(timesheet).toEqual([]);
});

test("writeTimesheet persists entries", async () => {
  const { readTimesheet, writeTimesheet } = await import("./index");
  const entry = { date: "2026-07-07", stamps: ["09:00", "13:00"] };
  await writeTimesheet([entry]);

  const timesheet = await readTimesheet();
  expect(timesheet).toEqual([entry]);
});

test("initStorage is idempotent — does not overwrite existing files", async () => {
  const { initStorage, readTimesheet, writeTimesheet } =
    await import("./index");
  const entry = { date: "2026-07-07", stamps: ["09:00"] };
  await writeTimesheet([entry]);

  await initStorage();

  const timesheet = await readTimesheet();
  expect(timesheet).toEqual([entry]);
});
