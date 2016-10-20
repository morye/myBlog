var __dirname = './';
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8080);
console.log("Server has been launched..")
