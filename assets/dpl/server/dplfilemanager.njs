// 如果本源码被直接显示，说明使用了其它服务器。
// 本源码需要使用 xfly 服务器执行。请运行项目跟目录下的 startserver 文件。

var System = require('./system');
var DplFileManager = require('./dplfilemanager');
var res = require('./res');

switch(request.queryString['action']){
	case 'get':
		var list = DplFileManager.getDplFileList(System.Configs.physicalPath + System.Configs.dplbuildFilesPath);
		res.writeJsonp(context, list);
		break;
	case 'delete':
		var list = DplFileManager.deleteDplFile(System.Configs.physicalPath);
		res.redirect(context);
		break;
	case 'getsource':
		var list = DplFileManager.getDplSources(request.queryString.path, request.queryString.type);
		res.writeJsonp(context, list);
		break;
	case 'getrefs':
		var list = DplFileManager.getDplRefs(request.queryString.path, request.queryString.type);
		res.writeJsonp(context, list);
		break;

}

response.end();