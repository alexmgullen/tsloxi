default: build run

run:
	node dist/index.js

build: lint
	npx rolldown src/Lox.ts --file dist/index.js

lint:
	npx tsc --noemit
