# TSLOXI

TypeScript LOX language Interpreter

## Usage

the make file is the primary build system, using tools provided by npm for building (for example, the `lint` target is `npx tsc --noemit`. To run an interactive prompt or script, build the project using the build target then run the output javascript with `node dist/index.js`.

### Building

This project is build with Rolldown to create a single file that can be executed by node.

### Testing

A few simple tests from the book are available in `./src/lox.test.ts` and can be run using `node ./src/lox.test.ts` however for complete integration testing, you should download the appropriate dart skd (i used `2.12` on windows by downloading it from here `https://storage.googleapis.com/dart-archive/channels/stable/release/2.12.0/sdk/dartsdk-windows-x64-release.zip`) clone the `https://github.com/munificent/craftinginterpreters` project into an adjacent file, turn the project into an executable with `make dist/tsloxi.exe` then run

```
dart tool/bin/test.dart jlox --interpreter <path_to_executable>/tsloxi.exe
```

from the root of the "crafting interpreters" repo to run all tests.

This implementation of Lox passes the jlox test suite with `All 239 tests passed (556 expectations).`.
