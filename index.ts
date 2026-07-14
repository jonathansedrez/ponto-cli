#!/usr/bin/env bun
import { Command } from "commander";
import { initStorage } from "./storage";
import { stamp } from "./commands/stamp";

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
  .action(
    async (
      time: string | undefined,
      options: { date?: string; left?: boolean; watch?: boolean },
    ) => {
      if (options.left) {
        // TODO: implement in PON-11
        return;
      }

      if (options.watch) {
        // TODO: implement in PON-12
        return;
      }

      await stamp(time, options.date);
    },
  );

program.parse();
