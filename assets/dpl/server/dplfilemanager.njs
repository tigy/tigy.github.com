//dplmanager.njs?action=create&path=aa.dpl

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