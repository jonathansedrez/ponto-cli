import { createCliRenderer } from "@opentui/core";
import { readTimesheet, writeTimesheet } from "../storage";
import {
  todayString,
  parseTimeInput,
  parseMinutes,
  InvalidTimeError,
} from "../shared/time";
import { buildReviewEntries, ReviewView } from "../review";
import type { ReviewEntry, ReviewViewState } from "../review";
import type { Timesheet } from "../storage/types";

type ReviewMode = "navigating" | "editing" | "confirming";

interface ReviewState {
  entries: ReviewEntry[];
  cursorIndex: number;
  mode: ReviewMode;
  inputBuffer: string;
  errorMessage: string | null;
  timesheet: Timesheet;
}

function hasUnsavedChanges(entries: ReviewEntry[]): boolean {
  return entries.some((e) => e.newStamps.size > 0);
}

function addStampToEntry(entry: ReviewEntry, time: string): ReviewEntry {
  const newStagedStamps = [...entry.stagedStamps, time].sort(
    (a, b) => parseMinutes(a) - parseMinutes(b),
  );
  const newStamps = new Set(entry.newStamps);
  newStamps.add(time);
  return { ...entry, stagedStamps: newStagedStamps, newStamps };
}

function applySave(state: ReviewState): {
  updatedTimesheet: Timesheet;
  remainingEntries: ReviewEntry[];
} {
  const updatedTimesheet = state.timesheet.map((day) => {
    const entry = state.entries.find((e) => e.date === day.date);
    if (!entry || entry.newStamps.size === 0) return day;
    return { date: day.date, stamps: entry.stagedStamps };
  });

  const remainingEntries = state.entries.filter(
    (e) => e.stagedStamps.length % 2 !== 0,
  );

  return { updatedTimesheet, remainingEntries };
}

function toViewState(state: ReviewState): ReviewViewState {
  return {
    entries: state.entries,
    cursorIndex: state.cursorIndex,
    mode: state.mode,
    inputBuffer: state.inputBuffer,
    errorMessage: state.errorMessage,
  };
}

export async function review(): Promise<void> {
  const timesheet = await readTimesheet();
  const todayStr = todayString(new Date());
  const entries = buildReviewEntries(timesheet, todayStr);

  if (entries.length === 0) {
    console.log("  No incomplete days this month.");
    return;
  }

  let state: ReviewState = {
    entries,
    cursorIndex: 0,
    mode: "navigating",
    inputBuffer: "",
    errorMessage: null,
    timesheet,
  };

  const renderer = await createCliRenderer({ exitOnCtrlC: false });

  const refresh = () => {
    for (const child of [...renderer.root.getChildren()]) {
      renderer.root.remove(child);
    }
    renderer.root.add(ReviewView(toViewState(state)));
  };

  refresh();
  renderer.requestLive();
  renderer.start();

  renderer.keyInput.on("keypress", async (event) => {
    if (state.mode === "navigating") {
      if (event.name === "up") {
        state = {
          ...state,
          cursorIndex: Math.max(0, state.cursorIndex - 1),
        };
      } else if (event.name === "down") {
        state = {
          ...state,
          cursorIndex: Math.min(
            state.entries.length - 1,
            state.cursorIndex + 1,
          ),
        };
      } else if (event.name === "return") {
        state = {
          ...state,
          mode: "editing",
          inputBuffer: "",
          errorMessage: null,
        };
      } else if (event.name === "s") {
        const { updatedTimesheet, remainingEntries } = applySave(state);
        await writeTimesheet(updatedTimesheet);
        if (remainingEntries.length === 0) {
          renderer.destroy();
          console.log("  All caught up!");
          process.exit(0);
          return;
        }
        state = {
          ...state,
          entries: remainingEntries,
          timesheet: updatedTimesheet,
          cursorIndex: Math.min(state.cursorIndex, remainingEntries.length - 1),
          errorMessage: null,
        };
      } else if (event.name === "q" || (event.ctrl && event.name === "c")) {
        if (hasUnsavedChanges(state.entries)) {
          state = { ...state, mode: "confirming" };
        } else {
          renderer.destroy();
          process.exit(0);
          return;
        }
      } else {
        return;
      }
    } else if (state.mode === "editing") {
      if (event.name === "escape") {
        state = {
          ...state,
          mode: "navigating",
          inputBuffer: "",
          errorMessage: null,
        };
      } else if (event.name === "return") {
        const entry = state.entries[state.cursorIndex]!;
        try {
          const time = parseTimeInput(state.inputBuffer);
          if (entry.stagedStamps.includes(time)) {
            state = {
              ...state,
              errorMessage: `${time} is already stamped for this day`,
              inputBuffer: "",
            };
          } else {
            const updatedEntry = addStampToEntry(entry, time);
            const updatedEntries = [...state.entries];
            updatedEntries[state.cursorIndex] = updatedEntry;
            state = {
              ...state,
              entries: updatedEntries,
              mode: "navigating",
              inputBuffer: "",
              errorMessage: null,
            };
          }
        } catch (e) {
          if (e instanceof InvalidTimeError) {
            state = {
              ...state,
              errorMessage: `Invalid time: "${state.inputBuffer}"`,
              inputBuffer: "",
            };
          }
        }
      } else if (event.name === "backspace") {
        state = {
          ...state,
          inputBuffer: state.inputBuffer.slice(0, -1),
          errorMessage: null,
        };
      } else if (
        event.name &&
        event.name.length === 1 &&
        !event.ctrl &&
        !event.meta
      ) {
        state = {
          ...state,
          inputBuffer: state.inputBuffer + event.name,
          errorMessage: null,
        };
      } else {
        return;
      }
    } else if (state.mode === "confirming") {
      if (event.name === "y") {
        renderer.destroy();
        process.exit(0);
        return;
      } else if (event.name === "n") {
        state = { ...state, mode: "navigating" };
      } else {
        return;
      }
    }

    refresh();
  });
}
