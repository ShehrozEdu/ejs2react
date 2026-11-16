// `declare` tells TypeScript "this constant exists, trust me" without creating it.
// The build (tsup `define`) and the tests (vitest `define`) replace every
// `__CLI_VERSION__` with the version from packages/cli/package.json.
declare const __CLI_VERSION__: string;

export const CLI_VERSION: string = __CLI_VERSION__;
