# Contributing to ponto

Thanks for your interest in contributing. This document covers how to get the project running locally and the conventions to follow.

---

## Prerequisites

- [Bun](https://bun.sh) (used for running, testing, and building)
- Git

## Getting started

```bash
git clone https://github.com/jonathandebrittosedrez/ponto-cli
cd ponto-cli
bun install
bun link        # makes `ponto` available in your PATH
```

## Development

```bash
bun run dev     # run in watch mode
bun test        # run the test suite
```

All tests live alongside their source files (`*.test.ts`). Run the full suite before opening a PR.

---

## Project structure

```
index.ts          # CLI entry point (commander setup)
commands/         # one file per command (left, watch, remove, ...)
shared/           # pure utilities (time parsing, formatting)
storage/          # read/write logic for ~/.ponto/timesheet.json
session/          # session computation (in/out pairing, duration)
dashboard/        # TUI dashboard (--watch)
```

## Conventions

- **Runtime:** Bun only — no Node built-ins where a Bun API exists.
- **No external DB:** all data lives in `~/.ponto/timesheet.json`.
- **Tests:** add a `*.test.ts` next to any new module.
- **Types:** keep `storage/types.ts` as the single source of truth for data shapes.
- **No comments** unless the why is non-obvious.

---

## Submitting changes

1. Open an issue first for any non-trivial change so we can align on the approach.
2. Fork the repo and create a branch from `main`.
3. Make your changes and ensure `bun test` passes.
4. Open a pull request with a clear description of what changed and why.

## Reporting bugs

Open a GitHub issue with:

- The command you ran
- What you expected vs. what happened
- Your OS and Bun version (`bun --version`)
