

var Config = require("./config"),
	Http = require('http'),
	Path = require('path'),
	Url = require('url'),
	FS = require('fs'),
	Util = require('util');

var XFly = {
	
	defaultHandlers: {
		directory: require('./handlers/directoryhandler'),
		error: require('./handlers/errorhandler'),
		file: require('./handlers/filehandler'),
		dynaticimage: require('./handlers/dynaticimagehandler'),
	},
	
	specailHandlers: [
		function(context){
			if(/^\/@\//i.test(context.urlInfo.pathname)) {
				var path = context.urlInfo.pathname.substr(3);
				
				if(/^assets\//i.test(path)){
					context.physicalPath = Path.resolve(XFly.rootPath, "xfly/xfly/", path);
					XFly.rewrite(context);
					return true;
				}
				
			
				context.physicalPath = Path.resolve(XFly.rootPath, "xfly/xfly/", path);
				XFly.rewrite(context);
				return true;
			}
		},
		function(context){
			var m = /@((\d+)\D+(\d+))?\.(jpg|png|gif|bmp|ico)$/i.exec(context.urlInfo.pathname);
			if(m) {
				var q = context.urlInfo.query || (context.urlInfo.query = {});
				
				q.width = +m[2] || 100;
				q.width = +m[3] || 100;
				q.extName = m[4];
				XFly.defaultHandlers.dynaticimage(context);
				return true;
			}
		}
	],
	
	fileHandlers: {
		'.njs': require('./handlers/njshandler'),
		'.asp': require('./handlers/asphandler'),
		'.md': require('./handlers/markdownhandler'),
	},
	
	beforeProcess: function(context){
	
	},
	
	aferProcess: function(context){
	
	},
	
	rewrite: function(context, url){
		if(url){
			context.orignalUrlInfo = context.urlInfo;
			context.urlInfo = Url.parse(url, true);
			context.physicalPath = Path.normalize(XFly.rootPath + context.urlInfo.pathname);
			
		}
	
		// 使用文件方式处理请求。
		FS.stat(context.physicalPath, function(err, stats) {
			
			// 如果文件不存在，则调用错误报告器。
			if(err){
				context.statusCode = 404;
				XFly.defaultHandlers.error.call(XFly, context);
				
			// 如果目标是一个文件。
			} else if(stats.isFile()) {
				(XFly.fileHandlers[context.fileExt = Path.extname(context.physicalPath)] || XFly.defaultHandlers.file).call(XFly, context);
				
			// // 如果目标是一个文件夹。
			// } else if(stats.isDirectory()) {
// 				
				// // 如果末尾不包含 /, 自动补上。
				// if(!(/\/$/).test(context.urlInfo.pathname)) {
					// context.urlInfo.pathname += "/";
				// }
// 				
				// // 文件夹列表
				// XFly.defaultHandlers.directory.call(XFly, context);
			
			// 无权限访问。
			} else {
				context.statusCode = 400;
				XFly.defaultHandlers.error.call(XFly, context);
			}
			
		});
		
	},
	
	reportError: function(context, e){
		context.error = e;
		XFly.defaultHandlers.error.call(XFly, context);
	},
	
	rootPath: Path.resolve(Config.rootPath) + Path.sep,
	
	servers: [],
	
	log: function(){
		console.log.apply(console, arguments); 
	},

	init: function(){
		// 创建服务器

		for(var i = Config.servers.length - 1; i >= 0; i--){
			XFly.servers[i] = createServer(Config.servers[i]);
		}
			
		function createServer(configs){
			var address = {};
			var server = Http.createServer(createHttpHandler(Path.resolve(XFly.rootPath, configs.path), address, configs.transferEncoding, configs.fileEncoding));
			
			server.on('error', function (e) {
				if (e.code == 'EADDRINUSE') {
					console.error('Cannot create server on port ' + port);
				}
			});
			
			server.on('listening', function(){
				var addr = server.address();
				address.address = addr.address;
				address.port = addr.port;
				
				address.path = configs.rootUrl || ('http://' + (address.address === '0.0.0.0' ? 'localhost' : address.address) + ":" + address.port + "/");
				XFly.log("[" + configs.path + "]Server running at " + address.path);
			});
			
			server.listen(configs.port, configs.address);
			
			
			return server;
		}

		/**
		 * 创建真实的 HTTP 处理函数。
		 * @param {String} virtualPath 当前服务器的虚拟路径。
		 * @param {String} physicalPath 当前服务器的物理路径。
		 */
		function createHttpHandler(rootPath, serverUrlInfo, transferEncoding, fileEncoding) {
			return function(request, response) {
				
				// 设置编码。
				request.setEncoding(transferEncoding);
			
				/**
				 * 存储当前请求的全部信息。
				 */
				var context = {
				
					/**
					 * 原始请求对象。
					 */
					request: request,
					
					/**
					 * 原始响应的对象。
					 */
					response: response,
					
					/**
					 * 文件传输编码。
					 */
					fileEncoding: fileEncoding,
					
					/**
					 * 用户传输的原始 POST 数据。
					 */
					postData: '',
					
					/**
					 * 当前服务器的文件跟目录。
					 */
					rootPath: rootPath,
					
					/**
					 * 当前服务器的文件跟目录。
					 * 
					 * - path: 跟路径。
					 * - address: 请求的地址。
					 * - port: 请求的端口。
					 */
					rootUrlInfo: serverUrlInfo,
					
					/**
					 * 用户请求的原始 URL 信息。
					 * 
					 * - pathname: 请求的路径，不含搜索参数。
					 * - path: 请求的路径，包含搜索参数。
					 * - query: 获取搜索参数的 JSON 对象。
					 */
					urlInfo: null,
					
					/**
					 * 当前请求的文件路径的真实地址。
					 */
					physicalPath: null,
					
				};
				
				// 处理 POST 数据。
				request.addListener("data", function(postDataChunk) {
					context.postData += postDataChunk;
					if (postData.length > 1e6) {
						// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
						request.connection.destroy();
					}
				});
				
				// 解析地址。
				context.urlInfo = Url.parse(request.url, true);
				context.physicalPath = Path.normalize(rootPath + context.urlInfo.pathname);
				
				// 开始处理当前请求。
				XFly.beforeProcess(context);
				
				// 遍历预定义的处理，如果处理完毕，则退出请求。
				for(var i = 0, len = XFly.specailHandlers.length; i < len; i++){
					if(XFly.specailHandlers[i].call(XFly, context) === true){
						XFly.aferProcess(context);
						return;
					}
				}
					
				// 使用文件方式处理请求。
				FS.stat(context.physicalPath, function(err, stats) {
					
					// 如果文件不存在，则调用错误报告器。
					if(err){
						context.statusCode = 404;
						XFly.defaultHandlers.error.call(XFly, context);
						
					// 如果目标是一个文件。
					} else if(stats.isFile()) {
						(XFly.fileHandlers[context.fileExt = Path.extname(context.physicalPath)] || XFly.defaultHandlers.file).call(XFly, context);
						
					// 如果目标是一个文件夹。
					} else if(stats.isDirectory()) {
						
						// 如果末尾不包含 /, 自动补上。
						if(!(/\/$/).test(context.urlInfo.pathname)) {
							response.writeHead(302, {
								'Content-Type' : 'text/html',
								'Location': context.urlInfo.pathname + '/'
							});
							response.end('Object Moved To <a herf="' + context.urlInfo.pathname + '/">' + context.urlInfo.pathname + '/</a>');
						} else {
							XFly.defaultHandlers.directory.call(XFly, context);
						}
					
					// 无权限访问。
					} else {
						context.statusCode = 400;
						XFly.defaultHandlers.error.call(XFly, context);
					}
					
					XFly.aferProcess(context);
				});
						
			};

		}
		
	}
	
};


XFly.init();

module.exports = XFly;


