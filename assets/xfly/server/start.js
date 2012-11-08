

var Configs = require('../lib/server/configs'),
	WebServer = require('../lib/server/webserver'),
	HttpApplication = require('../lib/server/httpapplication'),
	configs = require('./servers.json');
	
var rootPath = require('path').resolve(__filename, configs.rootPath);

var server = new WebServer();

for(var i = 0; i < configs.websites.length; i++){
	var app = new HttpApplication(configs.websites[i], configs);
	initApp(app);
	server.add(app);
}


server.start();



function initApp(app){
	
}

exports.rootPath = rootPath;
exports.server = server;


