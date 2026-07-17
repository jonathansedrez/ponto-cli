import { createCliRenderer } from "@opentui/core";
import { readOffdays, writeOffdays } from "../storage";
import {
  OffdaysView,
  seedWeekends,
  toggleDay,
  prevDay,
  nextDay,
  prevWeek,
  nextWeek,
  nextMonth,
} from "../offdays";
import { todayString } from "../shared/time";

export async function offdays(): Promise<void> {
  const todayStr = todayString(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);

  const minYear = y!;
  const minMonth = m!;

  const loaded = await readOffdays();
  const seeded = seedWeekends(y!, m!, loaded);
  if (seeded.length !== loaded.length) await writeOffdays(seeded);

  let state = {
    year: y!,
    month: m!,
    cursorDay: d!,
    todayStr,
    offdays: seeded,
  };

  const renderer = await createCliRenderer({ exitOnCtrlC: false });

  const refresh = () => {
    for (const child of [...renderer.root.getChildren()]) {
      renderer.root.remove(child);
    }
    renderer.root.add(OffdaysView(state));
  };

  const applyNav = async (next: {
    cursorDay: number;
    year: number;
    month: number;
  }) => {
    const monthChanged = next.year !== state.year || next.month !== state.month;
    state = { ...state, ...next };
    if (monthChanged) {
      const reseeded = seedWeekends(state.year, state.month, state.offdays);
      if (reseeded.length !== state.offdays.length) {
        state = { ...state, offdays: reseeded };
        await writeOffdays(reseeded);
      }
    }
  };

  refresh();
  renderer.requestLive();
  renderer.start();

  renderer.keyInput.on("keypress", async (event) => {
    if (event.name === "q" || (event.ctrl && event.name === "c")) {
      renderer.destroy();
      process.exit(0);
    }

    if (event.name === "left") {
      await applyNav(
        prevDay(state.cursorDay, state.year, state.month, minYear, minMonth),
      );
    } else if (event.name === "right") {
      await applyNav(nextDay(state.cursorDay, state.year, state.month));
    } else if (event.name === "up") {
      await applyNav(
        prevWeek(state.cursorDay, state.year, state.month, minYear, minMonth),
      );
    } else if (event.name === "down") {
      await applyNav(nextWeek(state.cursorDay, state.year, state.month));
    } else if (event.name === "]") {
      await applyNav(nextMonth(state.cursorDay, state.year, state.month));
    } else if (event.name === "space") {
      const newOffdays = toggleDay(
        state.cursorDay,
        state.year,
        state.month,
        state.offdays,
      );
      state = { ...state, offdays: newOffdays };
      await writeOffdays(newOffdays);
    } else {
      return;
    }

    refresh();
  });
}
