# ponto

**A minimal CLI for tracking contracted hours.**

Stamp in and out like a time clock. See what's left in your contract. No accounts, no cloud — just a local JSON file.

---

## Installation

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/jonathandebrittosedrez/ponto-cli
cd ponto-cli
bun install
bun link
```

This adds `ponto` to your `PATH` via `~/.bun/bin`.

---

## Usage

```bash
ponto                        # stamp current time (clock in or out)
ponto 10h30                  # stamp a specific time
ponto 14h                    # stamp at 14:00
ponto 13                     # stamp at 13:00
ponto 10:30                  # stamp using HH:MM format
ponto --date 2026-07-10      # stamp on a specific date
ponto --date yesterday       # stamp on yesterday
ponto --left                 # show contract hours remaining today
ponto --watch                # open the interactive TUI dashboard
ponto remove                 # remove the last stamp
ponto remove 2               # remove stamp at index 2
ponto remove --date yesterday  # remove last stamp from yesterday
```

Stamps alternate between **IN** and **OUT** automatically. Each day's stamps are stored sorted — backfilling a past date just works.

---

## How it works

- Stamps are saved in `~/.ponto/timesheet.json`
- Contract hours are configured in `~/.ponto/config.json`
- `--left` computes remaining hours based on today's stamps and your contract
- `--watch` opens a live TUI that refreshes every second

---

## Development

```bash
bun run dev        # run in watch mode
bun test           # run the test suite
```

---

## Contributing

Pull requests are welcome. For larger changes, open an issue first to discuss what you'd like to change.
