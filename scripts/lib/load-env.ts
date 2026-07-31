import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Load `.env` into process.env (only keys not already set).
 * No dependency on dotenv; supports KEY=VALUE lines and # comments.
 */
export function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function loadProjectEnv(rootDir: string): void {
  loadEnvFile(join(rootDir, ".env"));
}
