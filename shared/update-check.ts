import { join } from "node:path";

declare const PONTO_VERSION: string | undefined;
const CURRENT_VERSION =
  typeof PONTO_VERSION !== "undefined" ? PONTO_VERSION : "dev";
const REPO = "jonathansedrez/ponto-cli";
const CACHE_FILE = join(process.env.HOME ?? "~", ".ponto", "update-check.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface Cache {
  checkedAt: number;
  latestVersion: string;
}

async function readCache(): Promise<Cache | null> {
  try {
    const file = Bun.file(CACHE_FILE);
    if (!(await file.exists())) return null;
    return await file.json();
  } catch {
    return null;
  }
}

async function writeCache(latest: string) {
  try {
    await Bun.write(
      CACHE_FILE,
      JSON.stringify({ checkedAt: Date.now(), latestVersion: latest }),
    );
  } catch {
    // non-critical
  }
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { tag_name: string };
    return data.tag_name ?? null;
  } catch {
    return null;
  }
}

export async function checkForUpdate() {
  if (CURRENT_VERSION === "dev") return;

  let latest: string | null = null;

  const cache = await readCache();
  if (cache && Date.now() - cache.checkedAt < CACHE_TTL_MS) {
    latest = cache.latestVersion;
  } else {
    latest = await fetchLatestVersion();
    if (latest) await writeCache(latest);
  }

  if (latest && latest !== CURRENT_VERSION) {
    console.log(
      `\n  Update available: ${CURRENT_VERSION} → ${latest}\n  Run to update: curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install.sh | bash\n`,
    );
  }
}
