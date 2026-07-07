import { createCliRenderer } from "@opentui/core";
import { Dashboard } from "./dashboard";
import { initStorage } from "./storage";

await initStorage();

const renderer = await createCliRenderer({ exitOnCtrlC: false });

renderer.root.add(Dashboard());

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "q") {
    renderer.destroy();
    process.exit(0);
  }
});
