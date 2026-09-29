import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Directory names never searched for Markdown: dot dirs (`.vitepress`), site assets, dependencies. */
function skipped(name: string): boolean {
  return name.startsWith(".") || name === "node_modules" || name === "public";
}

/** Every `.md` file under `path`, sorted. A file path is returned as is; a missing path throws. */
export function listMarkdown(path: string): string[] {
  if (!statSync(path).isDirectory()) {
    return [path];
  }
  const out: string[] = [];
  for (const name of readdirSync(path)) {
    if (skipped(name)) {
      continue;
    }
    const full = join(path, name);
    if (statSync(full).isDirectory()) {
      out.push(...listMarkdown(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out.sort();
}
