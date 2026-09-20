import fs from "node:fs";


// the book mentions that they get "lazy" when it comes to string manipulation to define this code, this is the non lazy implementation since I found it easier than trying to use exclusively string manipulation.
class ClassDefinition {
    name: string;
    parameters: ParameterDefinition[];
    constructor(name: string, parameters: ParameterDefinition[]){
        this.name = name;
        this.parameters = parameters;
    }
}

class ImportDefinition {
    objects: string[];
    location: string;
    constructor(location: string, objects: string[]){
        this.location = location;
        this.objects = objects;
    }
}

class ParameterDefinition {
    name: string;
    type: string;

    constructor(name: string, type: string){
        this.name = name;
        this.type = type;
    }
}

export class GenerateAst {
    static main(args: string[]): number{
        if (args.length != 3){
            console.log("Usage: node <path_to_file>/GenerateAst.ts <output_directory>");
            process.exit(64);
        }

        const outputDir: string = args[2]!;

        this.defineAst(outputDir,"Expr",[
            new ClassDefinition("Binary",[
                new ParameterDefinition("left","Expr"),
                new ParameterDefinition("operator","Token"),
                new ParameterDefinition("right","Expr"),

            ]),

            new ClassDefinition("Call",[
                new ParameterDefinition("callee","Expr"),
                new ParameterDefinition("paren","Token"),
                new ParameterDefinition("args","Expr[]")
            ]),

            new ClassDefinition("Grouping",[
                new ParameterDefinition("expression","Expr"),
            ]),
            
            new ClassDefinition("Literal",[
                new ParameterDefinition("value","any"),
            ]),
            new ClassDefinition("Logical",[
                new ParameterDefinition("left","Expr"),
                new ParameterDefinition("operator","Token"),
                new ParameterDefinition("right","Expr"),
            ]),
            new ClassDefinition("Unary",[
                new ParameterDefinition("operator","Token"),
                new ParameterDefinition("right","Expr"),
            ]),
            new ClassDefinition("Variable",[
                new ParameterDefinition("name","Token"),
            ]),
            new ClassDefinition("Assign",[
                new ParameterDefinition("name","Token"),
                new ParameterDefinition("value","Expr"),
            ]),
            ],
            [
                new ImportDefinition("./Token.ts",["Token"])
            ]
        );

        this.defineAst(outputDir,"Stmt",[
            new ClassDefinition("Block",[
                new ParameterDefinition("statements","Stmt[]")
            ]),
            new ClassDefinition("Expression",[
                new ParameterDefinition("expression","Expr")
            ]),
            new ClassDefinition("If",[
                new ParameterDefinition("condition","Expr"),
                new ParameterDefinition("thenBranch","Stmt"),
                new ParameterDefinition("elseBranch","Stmt | null"),
            ]),
            new ClassDefinition("Print",[
                new ParameterDefinition("expression","Expr")
            ]),
            new ClassDefinition("Var",[
                new ParameterDefinition("name","Token"),
                new ParameterDefinition("initializer","Expr")
            ]),
            new ClassDefinition("While",[
                new ParameterDefinition("condition","Expr"),
                new ParameterDefinition("body","Stmt"),
            ]),
            ],
            [
                new ImportDefinition("./Token.ts",["Token"]),
                new ImportDefinition("./Expr.ts",["Expr"])
            ]
        );

        return 0;
    };
    static defineAst(outputDir: string, baseName: string, types: ClassDefinition[], imports: ImportDefinition[]){
        const path: string = outputDir + "/" + baseName + ".ts";
        const stream = fs.createWriteStream(path,{ encoding: 'utf8'})

        for (const i of imports){
            stream.write('import {' + i.objects.join(', ') + '} from "' + i.location + '";')
        }

        stream.write('\n');
        
        //nodejs doesn't have a writeline interface so we need to add the newline ourselves
        stream.write('export abstract class ' + baseName + '{\n');
        
        stream.write("    abstract accept<R>(visitor: Visitor<R>): R;\n");
       
        // also, since typescript doesn't need children to be in the parent interface (which is equivalent to an abstract class here) we'll close this interface before defining the child classes;
        stream.write('}\n');

        this.defineVisitor(stream, baseName, types);

        for (const t of types){
            GenerateAst.defineType(stream, baseName, t.name, t.parameters);
        }
    };
    static defineType(stream: fs.WriteStream, baseName: string, className: string, fields: ParameterDefinition[]){
        stream.write("export class " + className + " implements " + baseName + " {\n");

        // fields
        for (const field of fields){
            stream.write("    " + field.name + " : " + field.type + ";\n");
        }


        //constructor
        stream.write("    constructor(");
        for (const field of fields){
            stream.write(field.name + ": " +field.type + ",")
        }
        stream.write(") {\n");

        for (const field of fields){
            stream.write("        this." + field.name + " = " + field.name + ";\n");
        }
        
        stream.write("    };\n");
        
        // visitor pattern
        stream.write("    accept<R>(visitor: Visitor<R>): R {\n");
        stream.write("        return visitor.visit" + className + baseName + "(this);\n");
        stream.write("    }\n");

        stream.write("};\n")
    };
    static defineVisitor(stream: fs.WriteStream, baseName: string, fields: ClassDefinition[]){

        stream.write("export interface Visitor<R> {\n");

        for (const field of fields){
            stream.write("      visit" + field.name + baseName + "( " + baseName.toLowerCase() + ":" + field.name + " ): R;\n")
        }

        stream.write("}\n");

    }
}

const args = process.argv

GenerateAst.main(args);
