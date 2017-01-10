Prerequisites: Atom and its atom-typescript package, and node

1. Install npm packages:
```sh
cd server
npm install
```
2. Create a config-release.js file in server folder:
```sh
module.exports = {
  "secret”:’’, //string for building log in tokens
  "db": {
    "connectionLimit":10,
		"mysql": “”  //url for mysql server, with db username and password
	},
	"logger": {
		"api": "logs/api.log",
		"exception": "logs/exceptions.log"
	},
  "mailer": {
    "email":"", //email sender
    "password":"", //password for email
    "server":"" //email server
  },
  "studmail":'@stud.ntnu.no', 
  "mailsender":'Studentforeningen Handelshøyskolen i Trondheim',
  "website":'localhost:3000' //website address, used for creating links in emails
};

```

3. Run nodemon server (restarts if the source files are changed) with newest JS standard (harmony) enabled:
```sh
nodemon --harmony server/server.js
```


The Atom TypeScript Package and nodemon will watch for changes, and compile and restart
the node server when needed.
