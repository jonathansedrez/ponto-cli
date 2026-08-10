#!/usr/bin/env bun
import { Command } from "commander";
import { initStorage } from "./storage";
import { stamp } from "./commands/stamp";
import { left } from "./commands/left";
import { watch } from "./commands/watch";
import { remove } from "./commands/remove";
import { offdays } from "./commands/offdays";
import { checkForUpdate } from "./shared/update-check";

await initStorage();

const program = new Command();

program
  .name("ponto")
  .description("Time-punching CLI for tracking contracted hours")
  .version("1.1.2")
  .addHelpText(
    "after",
    `
Examples:
  $ ponto                          Stamp current time (clock in / clock out)
  $ ponto 9h30                     Stamp 09:30
  $ ponto 14:00                    Stamp 14:00
  $ ponto --date yesterday         Stamp current time for yesterday
  $ ponto 9h --date 2024-01-15     Stamp 09:00 for a specific date
  $ ponto --left                   Show remaining hours for the month
  $ ponto --watch                  Open the live dashboard (press q to quit)
  $ ponto --offdays                Edit off-days calendar (space to toggle, q to quit)
  $ ponto --remove                 Remove the last stamp of today
  $ ponto --remove 2               Remove stamp at index 2 (0-based)
  $ ponto --remove --date yesterday  Remove last stamp from yesterday`,
  );

program
  .argument("[time]", "Time to stamp (e.g. 10h30, 14h, 13, 10:30)")
  .option("--date <date>", "Date to stamp (YYYY-MM-DD, yesterday, MM/DD)")
  .option("--left", "Show remaining contract hours for the current month")
  .option("--watch", "Launch the interactive TUI dashboard (press q to quit)")
  .option(
    "--offdays",
    "Open the off-days calendar editor (space to toggle, q to quit)",
  )
  .option(
    "--remove [index]",
    "Remove a stamp (index is 0-based; defaults to last)",
  )
  .action(
    async (
      time: string | undefined,
      options: {
        date?: string;
        left?: boolean;
        watch?: boolean;
        offdays?: boolean;
        remove?: string | boolean;
      },
    ) => {
      if (options.left) {
        await left();
        return;
      }

      if (options.watch) {
        await watch();
        return;
      }

      if (options.offdays) {
        await offdays();
        return;
      }

      if (options.remove !== undefined) {
        const index =
          options.remove === true ? undefined : String(options.remove);
        await remove(index, options.date);
        return;
      }

      await stamp(time, options.date);
    },
  );

program.parse();

await checkForUpdate();
