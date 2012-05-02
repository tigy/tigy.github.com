


var configs = require('../config'),
	Dpl = require(configs.project),
	Path = require('path'),
	IO = require('../lib/io');

var DplManager = {
	
	Dpl: Dpl,
	
	getTemplatePath: function (module, category){
		return (  configs.templates + '/' + module + '/'   ).toLowerCase() ;
	},
	
	getCategoryPath: function (module, category){
		return (configs.root + module + '/' + category + '/')  .toLowerCase();
	},
	
	saveDplManager: function(Dpl) {
		var data = JSON.stringify(Dpl);
		data = 'var Dpl = ' + data + ';\r\n\r\n\r\n\
if(typeof module === \'object\') {\
	module.exports = Dpl;\
}\r\n';
		IO.writeFile(configs.project, data);
	},
	
	createCateogory: function (module, category){
		var tplFolder = DplManager.getTemplatePath(module, category);
		var createFolder = DplManager.getCategoryPath(module, category);
		IO.copyDirectory(tplFolder, createFolder);
	},
	
	createNewControl: function (module, category, name){
	
		var tplFolder = DplManager.getTemplatePath(module, category);
		var createFolder = DplManager.getCategoryPath(module, category);
		
		var path = name.replace(/\./g, "/").toLowerCase();
		var tpl =  tplFolder + 'index.html';
		var text = IO.readFile(tpl);
		text = text.replace(/MODULE/g, module.toLowerCase()).replace(/CATEGORY/g, category.toLowerCase()).replace(/NAME/g, path);
		
		IO.writeFile(createFolder + path + '.html', text);
		
		IO.copyFile(tplFolder + "assets/styles/index.css", createFolder + "assets/styles/" + path + ".css");
		IO.copyFile(tplFolder + "assets/styles/index.less", createFolder + "assets/styles/" + path + ".less");
		IO.copyFile(tplFolder + "assets/scripts/index.js", createFolder + "assets/scripts/" + path + ".js");
		
	},
	
	deleteOneControl: function (module, category, name){
		
		var path = name.replace(/\./g, "/").toLowerCase();
		var createFolder = DplManager.getCategoryPath(module, category);
		IO.deleteFile(createFolder + path + '.html');
		IO.deleteFile(createFolder + "assets/styles/" + path + ".css");
		IO.deleteFile(createFolder + "assets/styles/" + path + ".less");
		IO.deleteFile(createFolder + "assets/scripts/" + path + ".js");
		
	},

	addControl: function (module, category, name, summary, status, attribute){
		if(!checkArgs())
			return;
		
		// 准备好分类文件夹
		DplManager.createCateogory(module, category);
		
		// 拷贝模板文件夹
		DplManager.createNewControl(module, category, name);
		
		// 添加到项目索引
		DplManager.updateList('libs', module, category, name, summary, status, attribute);
	},
	
	deleteControl: function (module, category, name, summary, status, attribute){
		if(!checkArgs())
			return;
	
		// 删除组件文件
		DplManager.deleteOneControl(module, category, name);
		
		// 删除项目索引
		DplManager.updateList('libs', module, category, name, summary, status, attribute, true);
		
	},
	
	updateControl: function (module, category, name, summary, status, attribute){
		if(!checkArgs())
			return;
			
		DplManager.updateList('libs', module, category, name, summary, status, attribute);
	},
	
	updateList: function(type, module, category, name, summary, status, attribute, bDelete){
			
		if(bDelete) {
			var data = Dpl[type][module];
			var cat = data && data[category];
			cat && delete cat[name];
			for(var item in cat){
								DplManager.saveDplManager(Dpl);
				return;	
			}
			data && delete data[category];
			
		} else {
			var data = Dpl[type];
			if(!data[module])
				data[module] = {};
			data = data[module];
			if(!data[category])
				data[category] = {};
			data = data[category];
			if(!data[name])
				data[name] = {};
			data = data[name];
				
			data.summary = summary;
			data.status = status;
			data.attribute = attribute;
		}
		
		
			DplManager.saveDplManager(Dpl);
	},
	
	getControls: function (){
		return JSON.stringify(Dpl.libs);
	},
	
	tryGetResourcePath: function(url){
		if(url.indexOf(':') >= 0){
			return null;	
		}
		
		return configs.root + url;
	},
	
	createNewResource: function (module, category, name, url){
		
		url = DplManager.tryGetResourcePath(url);
		
		if(!url){
			return;
		}
	
		var tplFolder = DplManager.getTemplatePath(module, category);
		
		IO.copyFile(tplFolder + "index.html", url);
		
	},
	
	deleteOneResource: function (module, category, name, url){
		
		url = DplManager.tryGetResourcePath(url);
		
		if(!url){
			return;
		}
		
		IO.deleteFile(url);
		
	},
	
	addResource: function (module, category, name, summary, status, attribute){
		if(!checkArgs())
			return;
		
		// 准备好分类文件夹
		DplManager.createCateogory(module, category);
		
		// 拷贝模板文件夹
		DplManager.createNewResource(module, category, name, summary);
		
		// 添加到项目索引
		DplManager.updateList('res', module, category, name, summary, status, attribute);
	},
	
	deleteResource: function (module, category, name){
			
		var data = Dpl.res;
		
		data = data && data[module];
		
		data = data && data[category];
		
		data = data && data[name];
		
		if(data) {
			
			// 删除组件文件
			DplManager.deleteOneControl(module, category, name, data.summary);
			
			// 删除项目索引
			DplManager.updateList('res', module, category, name, data.summary, data.status, data.attribute, true);
		
			
		}
		
		
	},
	
	updateResource: function (module, category, name, summary, status, attribute, oldName, oldCategory){
		if(!checkArgs())
			return;
			
		if(oldName && oldCategory && (oldName != name || oldCategory != category)){
			DplManager.updateList('res', module, oldCategory, oldName, summary, status, attribute, true);
		}
		
		DplManager.updateList('res', module, category, name, summary, status, attribute);
	}




};



module.exports = DplManager;



function checkArgs(){
	var args = arguments.callee.caller.arguments;
	if(!args[0] || !args[1] || !args[2]){
		return false;
	}
	
	
	return true;
}