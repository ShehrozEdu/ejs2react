import { CommanderError } from "commander";
import { describe, expect, it } from "vitest";
import { CLI_VERSION, createProgram } from "./index";

/** Runs the program in-process and captures what it prints. */
function run(args: string[]): {
  stdout: string;
  stderr: string;
  exitCode: number;
} {
  let stdout = "";
  let stderr = "";
  const program = createProgram()
    .exitOverride() // throw a CommanderError instead of calling process.exit()
    .configureOutput({
      writeOut: (text) => {
        stdout += text;
      },
      writeErr: (text) => {
        stderr += text;
      },
    });

  try {
    program.parse(args, { from: "user" });
    return { stdout, stderr, exitCode: 0 };
  } catch (error: unknown) {
    // `error` is `unknown`: we must narrow it before reading `.exitCode`.
    if (error instanceof CommanderError) {
      return { stdout, stderr, exitCode: error.exitCode };
    }
    throw error;
  }
}

describe("CLI_VERSION", () => {
  it("is the version from packages/cli/package.json", () => {
    expect(CLI_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("ejs2react program", () => {
  it.each([["--version"], ["-v"]])("prints the version for %s", (flag) => {
    const result = run([flag]);
    expect(result.stdout.trim()).toBe(CLI_VERSION);
    expect(result.exitCode).toBe(0);
  });

  it("prints usage for --help", () => {
    const result = run(["--help"]);
    expect(result.stdout).toContain("Usage: ejs2react");
    expect(result.exitCode).toBe(0);
  });

  it("shows help when run with no arguments", () => {
    const result = run([]);
    expect(result.stdout).toContain("Usage: ejs2react");
  });

  it("fails with exit code 1 on an unknown option", () => {
    const result = run(["--nope"]);
    expect(result.stderr).toContain("unknown option");
    expect(result.exitCode).toBe(1);
  });
});
