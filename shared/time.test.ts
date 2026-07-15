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

test("parses HHhMM format", () => {
  expect(parseTimeInput("10h30")).toBe("10:30");
  expect(parseTimeInput("9h05")).toBe("09:05");
});

test("parses bare hour format", () => {
  expect(parseTimeInput("13")).toBe("13:00");
  expect(parseTimeInput("0")).toBe("00:00");
});

test("parses HHh format (h suffix, no minutes)", () => {
  expect(parseTimeInput("14h")).toBe("14:00");
  expect(parseTimeInput("18H")).toBe("18:00");
});

test("throws on out-of-range hours", () => {
  expect(() => parseTimeInput("24:00")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("99:00")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("24")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("24h")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("24h00")).toThrow(InvalidTimeError);
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

test("parses am/pm format", () => {
  expect(parseTimeInput("9:30am")).toBe("09:30");
  expect(parseTimeInput("9:30pm")).toBe("21:30");
  expect(parseTimeInput("12:00pm")).toBe("12:00");
  expect(parseTimeInput("12:00am")).toBe("00:00");
  expect(parseTimeInput("1:00pm")).toBe("13:00");
  expect(parseTimeInput("11:59pm")).toBe("23:59");
});

test("parses am/pm case-insensitively", () => {
  expect(parseTimeInput("9:30AM")).toBe("09:30");
  expect(parseTimeInput("9:30PM")).toBe("21:30");
  expect(parseTimeInput("9:30Am")).toBe("09:30");
});

test("throws on invalid am/pm hours", () => {
  expect(() => parseTimeInput("0:00am")).toThrow(InvalidTimeError);
  expect(() => parseTimeInput("13:00pm")).toThrow(InvalidTimeError);
});

test("throws on invalid am/pm minutes", () => {
  expect(() => parseTimeInput("9:60am")).toThrow(InvalidTimeError);
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
