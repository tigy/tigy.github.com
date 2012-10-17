

var HttpServer = require('../../xfly/lib/server/httpserver');
var System = require('./system.js');

var server = new HttpServer();

server.host = System.Configs.host;
server.port = System.Configs.port;
server.physicalPath = System.Configs.physicalPath;

server.start();

System.Configs.rootUrl = server.rootUrl;

module.exports = server;