import { VERSION } from "@ejs2react/core";

/** The line printed by `ejs2react --version` (wired up in task 0.5). */
export function formatVersion(): string {
  return `ejs2react v${VERSION}`;
}
