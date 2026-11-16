#!/usr/bin/env node
// The `bin` entry: what runs when someone types `npx ejs2react`.
// Keep it tiny; the logic lives in program.ts so it can be tested.
import { createProgram } from "./program";

createProgram().parse();
