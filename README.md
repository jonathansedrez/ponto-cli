# ponto-cli

## Install

Requires [Bun](https://bun.com).

```bash
git clone <repo-url>
cd ponto-cli
bun install
bun link
```

This adds `ponto` to your PATH via `~/.bun/bin`.

## Usage

```bash
ponto             # stamp current time
ponto 10h30       # stamp a specific time
ponto 10h30 --date yesterday
ponto --left      # show remaining contract hours
ponto --watch     # open the TUI dashboard
```

## Development

```bash
bun run dev       # watch mode
```
