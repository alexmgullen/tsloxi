# TSLOXI

TypeScript LOX language Interpreter

## Grammar

This language uses [lox language](https://craftinginterpreters.com/the-lox-language.html) syntax which can be seen in BNF here:

```
program        → declaration* EOF ;

declaration    → classDecl
               | funDecl
               | varDecl
               | statement ;

classDecl      → "class" IDENTIFIER ( "<" IDENTIFIER )?
                 "{" function* "}" ;

funDecl        → "fun" function ;

varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

statement      → exprStmt
               | forStmt
               | ifStmt
               | printStmt
               | returnStmt
               | whileStmt
               | block ;

exprStmt       → expression ";" ;

forStmt        → "for" "(" ( varDecl | exprStmt | ";" )
                           expression? ";"
                           expression? ")" statement ;

ifStmt         → "if" "(" expression ")" statement
                 ( "else" statement )? ;

printStmt      → "print" expression ";" ;

returnStmt     → "return" expression? ";" ;

whileStmt      → "while" "(" expression ")" statement ;

block          → "{" declaration* "}" ;

expression     → assignment ;

assignment     → ( call "." )? IDENTIFIER "=" assignment
               | logic_or ;

logic_or       → logic_and ( "or" logic_and )* ;

logic_and      → equality ( "and" equality )* ;

equality       → comparison ( ( "!=" | "==" ) comparison )* ;

comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;

term           → factor ( ( "-" | "+" ) factor )* ;

factor         → unary ( ( "/" | "*" ) unary )* ;

unary          → ( "!" | "-" ) unary | call ;

call           → primary ( "(" arguments? ")" | "." IDENTIFIER )* ;

primary        → "true" | "false" | "nil" | "this"
               | ARRAY | NUMBER | STRING | IDENTIFIER | "(" expression ")"
               | "super" "." IDENTIFIER ;

function       → IDENTIFIER "(" parameters? ")" block ;

parameters     → IDENTIFIER ( "," IDENTIFIER )* ;

arguments      → expression ( "," expression )* ;

ARRAY          → "[" ( primary "," )* "]";

NUMBER         → DIGIT+ ( "." DIGIT+ )? ;

STRING         → "\"" <any char except "\"">* "\"" ;

IDENTIFIER     → ALPHA ( ALPHA | DIGIT )* ;

ALPHA          → "a" ... "z" | "A" ... "Z" | "_" ;

DIGIT          → "0" ... "9" ;
```

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
