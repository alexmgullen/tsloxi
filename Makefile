default: build run

clean:
	del .\dist\tsloxi.js
	del .\dist\tsloxi.exe

run:
	node dist/tsloxi.js

build: clean lint dist/tsloxi.js dist/tsloxi.exe

lint:
	npx tsc --noemit

ast: src/lox/Expr.ts src/lox/Stmt.ts

src/lox/Expr.ts src/lox/Stmt.ts:
	node src/tool/GenerateAst.ts src/lox

dist/tsloxi.js: lint
	npx rolldown src/lox/Lox.ts --file dist/tsloxi.js

dist/tsloxi.exe: dist/tsloxi.js
	node --build-sea sea-config.json
