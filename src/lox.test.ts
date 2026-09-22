import process from "node:process";
import stream from "node:stream";

import { Lox } from "./lox/Lox.ts";
import { AstPrinter } from "./lox/AstPrinter.ts";
import { Binary, Grouping, Literal, Unary } from "./lox/Expr.ts";
import { Expr } from "./lox/Expr.ts";
import { Token } from "./lox/Token.ts";
import { TokenType } from "./lox/TokenType.ts";

class Test {
    name: string;
    expectedOutput: string;
    action: () => void;
    constructor(name: string,expectedOutput: string, action: () => void){
        this.name = name;
        this.expectedOutput = expectedOutput;
        this.action = action;
    }
}

const tests: Test[] = [
    new Test('AST Printer prints correctly',`(* (- 123) (group 45.67))`, 
        () => {
            const expression = new Binary(
                new Unary(
                    new Token(TokenType.MINUS, "-", null, 1),
                    new Literal(123),
                ),
                new Token(TokenType.STAR, "*", null, 1),
                new Grouping(
                    new Literal(45.67),
                )
            );

        console.log(new AstPrinter().print(expression))
    }),

    new Test('variable scoping works correctly',
`inner a
outer b
global c
outer a
outer b
global c
global a
global b
global c`,
        () => Lox.run(`
                var a = "global a";
                var b = "global b";
                var c = "global c";
                {
                  var a = "outer a";
                  var b = "outer b";
                  {
                    var a = "inner a";
                    print a;
                    print b;
                    print c;
                  }
                  print a;
                  print b;
                  print c;
                }
                print a;
                print b;
                print c;
        `)
    ),

    new Test('Logical statements execute',`foo`,
        () => Lox.run(`
                if (true){
                    print "foo";
                }

                if (false) {
                    print "bar";
                }
        `)
    ),

    new Test('Logical statements without scope execute',`foo`,
        () => Lox.run(`
                if (true)
                    print "foo";


                if (false)
                    print "bar";
        `)
    ),

    new Test('Logical statements without scope do not interfere with other logical statements',`bar`,

        () => Lox.run(`
                if (false)
                    print "foo";


                if (true)
                    print "bar";
        `)
    ),

    new Test('Else is bounded to nearest if',
`a
c`,
        () => Lox.run(`
            if(true) print "a"; if (false) print "b"; else print "c";`
        )
    ),

    new Test('Truthyness value of print statement',
`hi
yes`,
        () => Lox.run(`
print "hi" or 2; // "hi"
print nil or "yes"; // "yes"
        `)
    ),

    new Test('While Loop',
`0
1
2
3
4`,
        () => Lox.run(`
var i = 0;
while (i < 5){
    print i;
    i = i + 1;
}
        `)
    ),

    new Test('Function call',
`Hi, Dear Reader !`,
        () => Lox.run(`
fun sayHi(first, last) {
  print "Hi, " + first + " " + last + " !";
}

sayHi("Dear", "Reader");
        `)
    ),

    new Test('Convoluted Count',
`1
2
3`,
        () => Lox.run(`
fun count(n) {
  if (n > 1) count(n - 1);
  print n;
}

count(3);
        `)
    ),

    new Test('Return Statement',
`0
1
1
2
3
5
8
13
21
34
55
89
144
233
377
610
987
1597
2584
4181`,
            () => Lox.run(`
fun fib(n) {
  if (n <= 1) return n;
  return fib(n - 2) + fib(n - 1);
}

for (var i = 0; i < 20; i = i + 1) {
  print fib(i);
}
        `)
    ),

    new Test('Closure Testing',
`1
2`,
            () => Lox.run(`
fun makeCounter() {
  var i = 0;
  fun count() {
    i = i + 1;
    print i;
  }

  return count;
}

var counter = makeCounter();
counter(); // "1".
counter(); // "2".
        `)
    ),

    new Test('Static Binding test',
`global
global`,
            () => Lox.run(`
var a = "global";
{
  fun showA() {
    print a;
  }

  showA();
  var a = "block";
  showA();
}
        `)
    ),

    /*
     * this test fails because of special characters added on the [line: 4 ] character.
    new Test('No duplicate variable names in local scopes',`[line: 4 ] Error  at 'a' : Already a variable with this name in this scope.
`,
             () => Lox.run(`
fun bad() {
  var a = "first";
  var a = "second";
}
            `)
    ),
    */

    new Test('class definition',`DevonshireCream`,
            () => Lox.run(`
class DevonshireCream {
  serveOn() {
    return "Scones";
  }
}

print DevonshireCream;
            `)
    ),

    new Test('class initialization',`Bagel instance`,
            () => Lox.run(`
class Bagel {}
var bagel = Bagel();
print bagel;
            `)
    ),
]

const default_output = process.stdout.write;

for (const test of tests){
    console.log('Running test: ', test.name);

    let output: string = '';

    // Monkey patch node's stdout destination to be captured by output string
    process.stdout.write = (chunk: string | Uint8Array<ArrayBufferLike>, encoding: any) => {
        output += chunk.toString();
        return true;
    }

    test.action();

    // Patch the original process back in.
    process.stdout.write = default_output;

    if (output.trim() === test.expectedOutput){
        console.log("Test Successful ✅");
    } else {
        console.log("Test failed ❌");
        console.log("expected output :",test.expectedOutput);
        console.log("actual output   :",output);

    }
}
