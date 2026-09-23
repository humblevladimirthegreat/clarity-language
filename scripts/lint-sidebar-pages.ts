import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import config from "../docs/grammar/.vitepress/config.js";

const grammarDir = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/grammar");

type SidebarItem = {
  link?: string;
  items?: SidebarItem[];
};

function pagePath(link: string): string | undefined {
  // External URLs and in-page anchors do not name a docs page.
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(link)) return;
  const pathname = link.split(/[?#]/, 1)[0];
  const relativePath = pathname.replace(/^\//, "");
  return resolve(grammarDir, relativePath);
}

function collectItems(value: unknown): SidebarItem[] {
  if (Array.isArray(value)) return value.flatMap(collectItems);
  if (!value || typeof value !== "object") return [];
  const item = value as SidebarItem;
  return [item, ...(item.items ? item.items.flatMap(collectItems) : [])];
}

const sidebar = config.themeConfig?.sidebar;
const missing: string[] = [];
for (const item of collectItems(sidebar)) {
  if (!item.link) continue;
  const path = pagePath(item.link);
  if (!path) continue;
  // Accept a direct Markdown/HTML file or the directory's index page.
  const candidates = /\.(?:html?|md)$/i.test(path)
    ? [path]
    : [`${path}.md`, `${path}.html`, resolve(path, "index.md")];
  if (!candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile())) {
    missing.push(`${item.link} (${path})`);
  }
}

if (missing.length) {
  console.error(`Sidebar links to ${missing.length} missing page(s):`);
  for (const entry of missing) console.error(`  ${entry}`);
  process.exitCode = 1;
} else {
  console.log("OK: all sidebar pages exist.");
}
