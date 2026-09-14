# TSLOXI

TypeScript LOX language Interpreter

## Usage

the make file is the primary build system, using tools provided by npm for building (for example, the `lint` target is `npx tsc --noemit`. To run an interactive prompt or script, build the project using the build target then run the output javascript with `node dist/index.js`.

### Building

This project is build with Rolldown to create a single file that can be executed by node.
