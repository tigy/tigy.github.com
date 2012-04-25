/**
 * Server Main
 */



var configs = require('./config'),
	Dpl = require(configs.project),
	FS = require('fs'),
	Path = require('path'),
	VM = require('vm'),
	server = require('./lib/httpserver');

server.createServer(configs.root, Dpl.configs.port, {
	'.html': 'text/html',
	'.htm': 'text/html',
	'.css': 'text/css',
	'.less': 'text/less',
	'.js': 'text/javascript',
	'.txt': 'text/plain',
	'.xml': 'text/xml',
	'.png': 'image/png',
	'.jpg': 'image/jpg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg',
	'.ico': 'image/icon'
}, {
	'.nodejs': function(filePath, urlInfo, request, response, postData){
		
		FS.readFile(filePath, 'utf-8', function(e, data){
			if (e) {
				response.writeHead(500, '500 - Internal Server Error');
				response.end(e.message);
			}
			
			var context = {
				require: function (module) {
					if(module.indexOf('.') !== -1){
						module = Path.resolve(Path.dirname(filePath), module);
					}
					
					return require.call(this, module);
				},
				request: request,
				response: response,
				urlInfo: urlInfo,
				filePath: filePath,
				rootPath: configs.root,
				console: console,
				content: postData
			};
			
			// VM.runInNewContext(data, context, filePath);
// 			
			// return  ;
			
			try{
				VM.runInNewContext(data, context, filePath);
			} catch(e) {
				response.writeHead(500, '500 - Internal Server Error');
				response.end(e.message);
			}
		});
	}
});