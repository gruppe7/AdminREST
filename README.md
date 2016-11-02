Prerequisites: Atom and its atom-typescript package, and node

1. Install npm packages:
npm install nodemailer-promise
npm install bcrypt
npm install body-parser
npm install jsonwebtoken
npm install promise-mysql


2. Run nodemon server (restarts if the source files are changed) with newest JS standard (harmony) enabled:
```sh
nodemon --harmony server/server.js
```

3. Open http://localhost:8443

The Atom TypeScript Package and nodemon will watch for changes, and compile and restart
the node server when needed.
