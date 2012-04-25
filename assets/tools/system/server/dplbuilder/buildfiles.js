

var configs = require('../config'),
	Dpl = require(configs.project),
	BuildFiles = require(configs.buildFiles),
	DplBuilder = require('./dplbuilder'),
	Path = require('path'),
	IO = require('../lib/io');
	

DplBuilder.BuildFile.prototype.rootPath = configs.root;

DplBuilder.BuildFiles = BuildFiles;

DplBuilder.saveFile = function(BuildFiles){
	var data = JSON.stringify(BuildFiles);

		data = 'var BuildFiles = ' + data + ';\r\n\r\n\r\n\
if(typeof module === \'object\') {\
	module.exports = BuildFiles;\
}\r\n';
		IO.writeFile(configs.buildFiles, data);
};

DplBuilder.saveFileRaw = function(data){
	data = 'var BuildFiles = ' + data + ';\r\n\r\n\r\n\
if(typeof module === \'object\') {\
	module.exports = BuildFiles;\
}\r\n';
		IO.writeFile(configs.buildFiles, data);
};

DplBuilder.getBuildFile = function(name, basePath){
	return new DplBuilder.BuildFile(name, DplBuilder.BuildFiles[name]);
}

DplBuilder.buildAndLogInternal = function(buildFileName, response){
	var buildFile = DplBuilder.getBuildFile(buildFileName);

	buildFile.log = function(message){
		response.write(htmlDecode(message));
		response.write('<br>');
	};

	buildFile.error = function(message){
		response.write(message);
		response.write('<br>');
	};
	
	try{
	
		buildFile.build();
		
	}catch(e) {
		response.write('<br>');
		response.end(e.message);
	}
	
	response.write('<br>');
};

DplBuilder.buildAndLog = function(buildFileName, response, url){
	
	response.writeHead(200, {
		'Content-Type': 'text/html'
	});
	
	DplBuilder.buildAndLogInternal(buildFileName, response);
	
	response.write('<a href="' + url + '">Back</a>');
	
	response.end();
};

function htmlDecode(str) {   
  return str
  	.replace(/&gt;/g,    "&")
  	.replace(/&lt;/g,        "<")
  	.replace(/&gt;/g,        ">")
  	.replace(/&nbsp;/g,        "    ")
  	.replace(/'/g,      "\'")
  	.replace(/&quot;/g,      "\"")
  	.replace(/<br>/g,      "\n")
   }   

module.exports = DplBuilder;