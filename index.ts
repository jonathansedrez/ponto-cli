#!/usr/bin/env bun
import { Command } from "commander";
import { initStorage } from "./storage";
import { stamp } from "./commands/stamp";
import { left } from "./commands/left";
import { watch } from "./commands/watch";
import { remove } from "./commands/remove";
import { offdays } from "./commands/offdays";

await initStorage();

const program = new Command();

program
  .name("ponto")
  .description("Time-punching CLI for tracking contracted hours")
  .version("1.0.0");

program
  .argument("[time]", "Time to stamp (e.g. 10h30, 14h, 13, 10:30)")
  .option("--date <date>", "Date to stamp (YYYY-MM-DD, yesterday, MM/DD)")
  .option("--left", "Show contract hours remaining")
  .option("--watch", "Launch the interactive TUI dashboard")
  .option("--offdays", "Open the off-days calendar editor")
  .action(
    async (
      time: string | undefined,
      options: {
        date?: string;
        left?: boolean;
        watch?: boolean;
        offdays?: boolean;
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

      await stamp(time, options.date);
    },
  );

program
  .command("remove")
  .description("Remove a stamp from the timesheet")
  .argument("[index]", "Index of stamp to remove (0-based); defaults to last")
  .option("--date <date>", "Date to remove from (YYYY-MM-DD, yesterday, MM/DD)")
  .action(async (index: string | undefined, options: { date?: string }) => {
    await remove(index, options.date);
  });

program.parse();
