# ponto CLI — Project Briefing

## Overview

A terminal-based CLI tool to track contracted working hours via **time punching**. Instead of logging durations, the user stamps the current time of day throughout the day — the tool pairs stamps into sessions and calculates hours automatically. Includes an interactive TUI dashboard powered by raw terminal rendering (ANSI + chalk).

---

## Goals

- Provide a fast, frictionless way to stamp in/out throughout the workday
- Calculate worked hours and contract progress automatically
- Surface the exact time the user should stop working to hit their daily and monthly goals

---

## Tech Stack

| Layer       | Choice                                                    |
| ----------- | --------------------------------------------------------- |
| Language    | Node.js (TypeScript, CommonJS)                            |
| TUI         | Raw terminal — ANSI escape codes + chalk (no blessed/ink) |
| Storage     | Local JSON files at `~/.ponto/`                           |
| CLI parsing | `commander`                                               |
| Colors      | `chalk` v4                                                |

---

## Interaction Model — Time Punching

The user stamps clock times throughout the day. The tool infers sessions by pairing stamps:

| Stamp index | Meaning   |
| ----------- | --------- |
| 0, 2, 4, …  | Clock in  |
| 1, 3, 5, …  | Clock out |

**Example workflow:**

```bash
ponto 10h30   # → clocked in  at 10:30
ponto 13      # → clocked out at 13:00  (session: 2h 30m)
ponto 14h     # → clocked in  at 14:00
ponto 18H     # → clocked out at 18:00  (session: 4h 00m)
                  #   Day total:   6h 30m
```

If the last stamp is a clock-in (odd count of stamps), the session is **ongoing** and duration is calculated against the current time.

---

## Time Input Formats

All inputs are case-insensitive:

| Input   | Parsed as                   |
| ------- | --------------------------- |
| `10h30` | 10:30                       |
| `13`    | 13:00 (number ≤ 23 = hours) |
| `14h`   | 14:00                       |
| `18H`   | 18:00                       |
| `10:30` | 10:30 (passthrough)         |

Numbers > 23 are rejected.

---

## Commands

### `ponto <time>`

Stamp the current time for **today**.

```bash
ponto 10h30
ponto 13
ponto 14h
ponto 18H
```

Output after clocking in:

```
  ● CLOCKED IN  10:30  on 2026-05-19
  Leave at 18:30 to hit your 8h daily goal.
```

Output after clocking out:

```
  ○ CLOCKED OUT  13:00  on 2026-05-19
  Session: 10:30 → 13:00 = 2h 30m
  Today total: 2h 30m
```

---

### `ponto <time> --date <date>`

Stamp a time for a **specific date** (backfill).

```bash
ponto 10h30 --date 2026-05-15
ponto 13 --date yesterday
ponto 4h --date 05/12
```

Accepted date formats:

- `YYYY-MM-DD`
- `yesterday`
- `MM/DD` (current year implied)

Stamps are inserted in chronological order within the day.

---

### `ponto --left`

Show contract hours remaining.

```bash
ponto --left
```

Output:

```
  Contract total : 160h 00m
  Logged so far  : 118h 30m
  Remaining      : 41h 30m
  Remaining day  : 2h
```

---

### `ponto --watch`

Launch an **interactive TUI dashboard** that refreshes every second.

```bash
ponto --watch
```

Dashboard layout:

```
╔══════════════════════════════════════════════════════╗
║  ponto                    Mon, 19 May 2026            ║
║  Status : ● CLOCKED IN  (1h 23m ago)                      ║
║  Leave  : 18:15  to hit daily goal                        ║
╠══════════════════════════════════════════════════════╣
║  Sessions                                                 ║
║                                                           ║
║   In      Out     Duration                                ║
║  ──────  ──────  ──────────                             ║
║   10:30   13:00   2h 30m                                  ║
║   14:00   ──:──   3h 47m  ▶ running                      ║
║                                                           ║
║  Today    6h 17m / 8h 00m  ████████░░░░  78%              ║
║  Contract 74% done  ████████████░░░░  118h / 160h         ║
╚══════════════════════════════════════════════════════╝
  [q] quit   [+] stamp now   [r] refresh
```

Key behaviours:

- Refreshes every second while clocked in (running session counter updates live)
- `q` — quit
- `r` — force refresh
- `+` — stamp current time (clock in or out) without leaving the dashboard

---

## Leave Time Calculation

When clocked in:

```
completedMins  = sum of all finished session pairs
lastInMins     = time-of-day (minutes) of the last clock-in stamp
remaining      = max(0, dailyTarget × 60 − completedMins)
leaveAt        = lastInMins + remaining
```

Edge cases:

- If `leaveAt > 24:00` → display `"X min remain for tomorrow"`
- If `remaining == 0` → display `"Daily goal achieved!"`
- If clocked out → display `"Clock in to see leave time"`

---

## Configuration

`~/.ponto/config.json` — created with defaults on first run:

```json
{
  "contractHours": 160,
  "clockType": "24h" | "am/pm",
  "workingDaysCurrentMonth": 21, // active days you are working this month
}
```

---

## Data Storage

`~/.ponto/data.json`:

```json
[
  { "date": "2026-05-19", "stamps": ["10:30", "13:00", "14:00", "18:00"] },
  { "date": "2026-05-15", "stamps": ["09:00", "12:30", "13:30"] }
]
```

- Stamps are always stored in ascending order within a day
- An odd number of stamps means the session is ongoing
- Out-of-order or duplicate stamps are rejected with an error
