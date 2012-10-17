
var DplManager = require('./dplmanager');
var res = require('./res');

switch(request.queryString['action']){
	case 'create':
		DplManager.createDpl(request.queryString.module, request.queryString.category, request.queryString.name, request.queryString.title);
		res.redirect(context);
		break;
	case 'delete':
		DplManager.deleteDpl(request.queryString.module, request.queryString.category, request.queryString.name);
		res.redirect(context);
		break;
	case 'update':
		var dplInfo = {
			status: request.queryString.status
		};

		if(request.queryString.support) {
			dplInfo.support = request.queryString.support.join("|");
		}

		if(request.queryString.hide) {
			dplInfo.hide = request.queryString.hide == "on";
		}

		DplManager.updateDpl(request.queryString.module, request.queryString.category, request.queryString.name, request.queryString.title, dplInfo);
		res.redirect(context);
		break;
	case 'getlist':
		var list = DplManager.getDplList(request.queryString.type || 'demo');
		res.writeJsonp(context, list);
		break;
	case 'updatelist':
		DplManager.updateDplList('demo');
		res.redirect(context);
		break;
	default:
		res.redirect(context);
		break;

}

response.end();