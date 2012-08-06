var DplBuilder = require("./dplbuilder");
var Program = require('../lib/commander');

process.title = 'DplBuilder 9.0.0';

Program
	.version('9.0.0')
	.usage('[options] <file ...>')
	.parse(process.argv);

if(Program.args.length > 0){
	startBuild(Program.args);
} else {
	Program.prompt("Build File Path: ", startBuild);	
	
}

function startBuild(path){
	if(require("fs").existsSync(path))
		DplBuilder.build(path);
	else
		console.log('\tFile Not Found: ' + process.cwd() + '\\' + path);
}
