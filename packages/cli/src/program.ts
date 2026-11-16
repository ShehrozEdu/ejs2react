import { Command } from "commander";
import { CLI_VERSION } from "./version";

/**
 * Builds the `ejs2react` command-line program.
 * A function (not a module-level object) so each test gets a fresh program.
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name("ejs2react")
    .description(
      "Migrate Express + EJS apps to React, and prove the converted pages render the same.",
    )
    .version(CLI_VERSION, "-v, --version", "print the version")
    .helpOption("-h, --help", "show help")
    // No subcommands yet: running `ejs2react` on its own shows the help.
    .action(() => {
      program.help();
    });

  return program;
}
