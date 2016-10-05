Prerequisites: Atom and its atom-typescript package, and node

1. Install npm packages:
```sh
npm install -g nodemon typings
```

2. Install JavaScript dependencies (settings file: package.json):
```sh
cd server
npm install
cd ../client
npm install
cd ..
```

3. Install TypeScript dependencies (settings file: typings.json):
```sh
cd client
typings install
cd ..
```

4. Compile client/app/boot.ts through the Atom menu: Packages->TypeScript->Build (settings file: tsconfig.json). 
Only needed to do once as Atom compiles the .ts files when changed. 

5. Run nodemon server (restarts if the source files are changed) with newest JS standard (harmony) enabled:
```sh
nodemon --harmony server/server.js
```

6. Open http://localhost:3000

The Atom TypeScript Package and nodemon will watch for changes, and compile and restart
the node server when needed. 