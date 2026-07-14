import { test, expect } from "bun:test";
import {
  parseTimeInput,
  parseDateInput,
  InvalidTimeError,
  InvalidDateError,
  parseMinutes,
  formatDuration,
} from "./time";

test("parses valid HH:MM", () => {
  expect(parseTimeInput("09:30")).toBe("09:30");
  expect(parseTimeInput("00:00")).toBe("00:00");
  expect(parseTimeInput("23:59")).toBe("23:59");
});

test("normalizes single-digit hours", () => {
  expect(parseTimeInput("9:05")).toBe("09:05");
});

test("throws on missing colon format", () => {
  expect(() => parseTimeInput("10h30")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("13")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("14h")).toThrow(InvalidTimeError);
});

test("throws on out-of-range hours", () => {
  expect(() => parseTimeInput("24:00")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("99:00")).toThrow(InvalidTimeError);
});

test("throws on out-of-range minutes", () => {
  expect(() => parseTimeInput("10:60")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("10:99")).toThrow(InvalidTimeError);
});

test("throws on empty or garbage input", () => {
  expect(() => parseTimeInput("")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("abc")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("10:3")).toThrow(InvalidTimeError);
});

test("parseMinutes converts HH:MM to minutes since midnight", () => {
  expect(parseMinutes("00:00")).toBe(0);
  expect(parseMinutes("01:00")).toBe(60);
  expect(parseMinutes("10:30")).toBe(630);
  expect(parseMinutes("23:59")).toBe(1439);
});

test("formatDuration formats minutes into Xh MMm", () => {
  expect(formatDuration(0)).toBe("0h 00m");
  expect(formatDuration(90)).toBe("1h 30m");
  expect(formatDuration(150)).toBe("2h 30m");
  expect(formatDuration(390)).toBe("6h 30m");
  expect(formatDuration(480)).toBe("8h 00m");
});

test("parseDateInput accepts valid YYYY-MM-DD", () => {
  expect(parseDateInput("2026-05-15")).toBe("2026-05-15");
  expect(parseDateInput("2026-01-01")).toBe("2026-01-01");
});

test("parseDateInput rejects out-of-range dates", () => {
  expect(() => parseDateInput("2026-13-01")).toThrow(InvalidDateError);
  expect(() => parseDateInput("2026-02-30")).toThrow(InvalidDateError);
});

test("parseDateInput rejects non-YYYY-MM-DD formats", () => {
  expect(() => parseDateInput("")).toThrow(InvalidDateError);
  expect(() => parseDateInput("abc")).toThrow(InvalidDateError);
  expect(() => parseDateInput("yesterday")).toThrow(InvalidDateError);
  expect(() => parseDateInput("05/15")).toThrow(InvalidDateError);
  expect(() => parseDateInput("15-07-2026")).toThrow(InvalidDateError);
});
