var sys = require('util')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { 
	sys.puts(stdout);
}
var configs = require('./config'),
	Dpl = require(configs.project);

require("./run");

exec("start " + Dpl.configs.host + ":" + Dpl.configs.port + "/", puts);