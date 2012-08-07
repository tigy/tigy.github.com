

var JPlus = JPlus || {};

JPlus.getJSONP = function (path, data, onSuccess) {
	Ajax.getJSONP(Dpl.configs.host + ':' + Dpl.configs.port + '/' + path, data, onSuccess, 1000, function(){
		var r = 'assets/bin/startserver.bat';
		if(navigator.platform.indexOf("Win") === -1) {
			r = 'assets/bin-linux/startserver.sh';
		}
		alert("无法连接到代理服务器 " + Dpl.configs.host + ':' + Dpl.configs.port + '\r\n请先执行 ' + r + '\r\n更多信息见 文档/DPL管理系统/使用说明');
	});
};

JPlus.submit = function (path, data) {
	var form = Dom.create('form');
	form.setAttr('action', Dpl.configs.host + ':' + Dpl.configs.port + '/' + path);
	form.setAttr('method', 'post');
	form.setHtml('<textarea name="data"></textarea>');
	form.find('textarea').setText(JSON.encode(data));
	form.hide().appendTo();
	form.submit();
};
	
/**
 * 在网页里显示的跟地址。
 */
JPlus.rootUrl = '../../../';


var DplBuilder = {
	
	buildFiles: 'assets/tools/system/server/dplbuilder/buildfiles.nodejs',
	
	dataFile: 'assets/tools/system/server/dplbuilder/data.nodejs',
	
	// 列表页
	
	showList: function(container){
		
		var html = Tpl.parse('<table class="x-table x-row"><tr>\
        		<th>生成方案</th>\
        		<th width="259">操作</th>\
        	</tr>\
        	{for(var buildfile in $data)}\
        	<tr>\
        		<td><a href="buildfile.html#{buildfile}" target="_blank" class="name">{buildfile}</a></td>\
        		<td>\
        			<a href="buildfile.html#{buildfile}" class="x-button">编辑</a>\
        			<a href="javascript://删除解决方案" class="x-button" onclick="DplBuilder.deleteFile(\'{buildfile}\')">删除</a>\
        			<a href="javascript://删除解决方案" class="x-button" onclick="DplBuilder.preview(\'container-t\', \'{buildfile}\')">预览</a>\
        			<a href="buildfile.html?base={buildfile}#" class="x-button">复制</a>\
        			<a href="javascript://重新生成此解决方案" class="x-button x-button-info" onclick="DplBuilder.buildFile(\'{buildfile}\')">生成</a>\
        		</td>\
        	</tr>\
        	{end}</table><div id="container-t"></div>', BuildFiles);
		
		Dom.get(container).setHtml(html);
	},
	
	// 编辑页
	
	initNavBar: function(){
		 // x-tabbable-actived
		
		var html = Tpl.parse('<ul class="x-tabbable-container">\
		{for item in $data}<li class="x-tabbable-content" data-name="{$index}"><a href="#{$index}">{$index}</a></li>{end}\
		<li class="x-tabbable-content" data-name=""><a href="buildfile.html#">✚ 新建合成方案</a></li>\
		<li class="x-tabbable-content" data-name="$bak"><a href="build.html">←返回组件列表</a></li>\
		</ul>\
		', BuildFiles);
		Dom.get('tabbable').setHtml(html);
		
		Dom.hashchange(function(){
			var hash = location.getHash();
			try{
				hash = decodeURIComponent(hash);
			}catch(e){
					
			}
			DplBuilder.showView(hash);
		});	
	},

	createNewFile: function () {
		if (DplBuilder.addFile)
			return DplBuilder.addFile;
		var base = decodeURIComponent((/[?&]base=(.*?)([?&#]|$)/.exec(location.href) || ["", ""])[1]);
		
		var newProj = Object.extend({
			
		}, BuildFiles[base]);
		
		newProj.name = null;
		
		return DplBuilder.addFile = newProj;
	},
	
	showView: function (buildFileName) {
		DplBuilder.write();
		
		Dom.get('tabbable').query('.x-tabbable-actived').removeClass('x-tabbable-actived');
		Dom.get('tabbable').query('[data-name="' + buildFileName + '"]').addClass('x-tabbable-actived');
		
		DplBuilder.currentBuildFileName = buildFileName;
		DplBuilder.currentBuildFile = BuildFiles[buildFileName] || DplBuilder.createNewFile();
		
		var html = Tpl.parse('<div class="x-formfield">\
                <label class="x-formfield-label">\
                生成方案名: \
                </label>\
                <div class="x-formfield-container">\
                    <input type="text" class="x-textbox" name="name" value="' + (DplBuilder.currentBuildFile.$name || buildFileName  ) + '" placeholder="输入生成方案的名字。">\
                </div>\
            </div>\
            \
            <div class="x-formfield">\
                <label class="x-formfield-label">\
                目标 JS 文件: \
                </label>\
                <div class="x-formfield-container">\
                    <input type="text" class="x-textbox large" name="targetJs" value="{targetJs}" placeholder="输入合成后生成的 Javascript 文件位置。如 assets/share.js">\
                </div>\
            </div>\
            \
            <div class="x-formfield">\
                <label class="x-formfield-label">\
                目标 CSS 文件: \
                </label>\
                <div class="x-formfield-container">\
                    <input type="text" class="x-textbox large" name="targetCss" value="{targetCss}" placeholder="输入合成后生成的 CSS 文件位置。如 assets/share.css">\
                </div>\
            </div>\
            \
            <div class="x-formfield">\
                <label class="x-formfield-label">\
                目标图片位置: \
                </label>\
                <div class="x-formfield-container">\
                    <input type="text" value="{targetImages}" name="targetImages" class="x-textbox large" placeholder="输入合成后图片文件夹相对CSS文件的位置。如 ../images/">\
                </div>\
            </div>\
            \
            <div class="x-formfield">\
                <label class="x-formfield-label">\
                依赖的合成方案: \
                </label>\
                <div class="x-formfield-container">\
                    <input type="text" class="x-textbox large" name="require" value="{require}" placeholder="依赖项中包含的组件将被排除。多个项之间用;隔开">\
                </div>\
            </div>\
            \
            <div class="x-formfield">\
                <label class="x-formfield-label">\
                预定义宏: \
                </label>\
                <div class="x-formfield-container">\
                    <input type="text" class="x-textbox large" name="define" value="{define}" placeholder="用于预处理代码。多个项之间用;隔开">\
                </div>\
            </div>\
            \
            <div class="x-formfield">\
                <label class="x-formfield-label">\
                其他选项: \
                </label>\
                <div class="x-formfield-container">\
                    <label><input type="checkbox" class="x-checkbox" name="macro" {if $data.macro !== false}checked="checked"{end}>解析宏&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>\
                    <label><input type="checkbox" class="x-checkbox" name="resolveLess" {if $data.resolveLess !== false}checked="checked"{end}>解析 less&nbsp;&nbsp;&nbsp;</label>\
                    <label><input type="checkbox" class="x-checkbox" name="copyImages" {if $data.copyImages !== false}checked="checked"{end}>解析引用的图片</label>\
                    <br>\
                    <label><input type="checkbox" class="x-checkbox" name="removeTrace" {if $data.removeTrace !== false}checked="checked"{end}>删除 trace</label>\
                    <label><input type="checkbox" class="x-checkbox" name="removeAssert" {if removeAssert}checked="checked"{end}>删除 assert</label>\
                    <label><input type="checkbox" class="x-checkbox" name="removeConsole" {if removeConsole}checked="checked"{end}>删除 console</label>\
                    <br>\
                    <label><input type="checkbox" class="x-checkbox" name="header" {if $data.header!== false}checked="checked"{end}>添加注释信息</label>\
                    <label><input type="checkbox" class="x-checkbox" name="resolveUsing" {if $data.resolveUsing!== false}checked="checked"{end}>智能解析依赖</label>\
                </div>\
            </div>\
            \
            <div class="x-formfield">\
                <label class="x-formfield-label">\
               		\
                </label>\
                <div class="x-formfield-container">\
                    <span class="x-hint">注意：所有文件位置都是相对于项目跟目录(jplus-milk 目录)的相对位置。</span>\
                </div>\
            </div>\
            \
            <hr>\
            \
            <h3>组件列表</h3>\
            \
            <div id="namespaces">\
            	{for c in $data.top}\
            	<div class="namespace">\
	            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank">[置顶]{c}</a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', false)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', false)">查看引用</a> <a href="javascript://删除对当前模块的引用;" class="x-linkbutton" onclick="DplBuilder.deleteControl(\'{c}\', \'top\')">删除</a>\
	           	</div>\
	           	{end}\
            	{for c in $data.using}\
            	<div class="namespace">\
	            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank">{c}</a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', false)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', false)">查看引用</a> <a href="javascript://删除对当前模块的引用;" class="x-linkbutton" onclick="DplBuilder.deleteControl(\'{c}\', \'using\')">删除</a>\
	           	</div>\
	           	{end}\
            	{for c in $data.imports}\
            	<div class="namespace">\
	            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank">[样式]{c}</a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', true)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', true)">查看引用</a> <a href="javascript://删除对当前模块的引用;" class="x-linkbutton" onclick="DplBuilder.deleteControl(\'{c}\', \'imports\')">删除</a>\
	           	</div>\
	           	{end}\
            	{for c in $data.excludeJs}\
            	<div class="namespace">\
	            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank"><del>[排除]{c}</del></a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', true)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', false)">查看引用</a> <a href="javascript://删除对当前模块的引用;" class="x-linkbutton" onclick="DplBuilder.deleteControl(\'{c}\', \'excludeJs\')">删除</a>\
	           	</div>\
	           	{end}\
            	{for c in $data.excludeCss}\
            	<div class="namespace">\
	            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank"><del>[无样式]{c}</del></a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', true)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', true)">查看引用</a> <a href="javascript://删除对当前模块的引用;" class="x-linkbutton" onclick="DplBuilder.deleteControl(\'{c}\', \'excludeCss\')">删除</a>\
	           	</div>\
	           	{end}\
            	{for c in $data.bottom}\
            	<div class="namespace">\
	            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank">[置底]{c}</a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', false)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', false)">查看引用</a> <a href="javascript://删除对当前模块的引用;" class="x-linkbutton" onclick="DplBuilder.deleteControl(\'{c}\', \'bottom\')">删除</a>\
	           	</div>\
	           	{end}\
	           	\
	           	<div class="namespace add">\
	            	<select class="x-textbox">\
	                        <option value="using" title="完全引入一个组件及其依赖项">全部</option>\
	                        <option value="imports" title="仅引入一个组件的样式及其依赖样式">仅样式</option>\
	                        <option value="excludeJs" title="仅引入一个组件的样式及其依赖样式">排除</option>\
	                        <option value="excludeCss" title="仅引入一个组件的样式及其依赖样式">无样式</option>\
	                        <option value="top" title="置顶一个组件">置顶</option>\
	                        <option value="bottom" title="置底一个组件">置底</option>\
	                    </select>\
	                  \
	                      <input type="text" class="x-textbox control-namespace" placeholder="输入组件的名字空间" />\
	                   <a href="javascript://添加一个组件" class="x-button x-button-success" onclick="DplBuilder.addControl()">添加</a>\
	            \
	            </div>\
            </div>\
            \
            <div class="button-label">\
                <input type="button" value="保存并生成" class="x-button x-button-info" onclick="DplBuilder.saveAndBuildFile()"> \
                <input type="button" value="保存" class="x-button" onclick="DplBuilder.saveFile()"> \
            </div>\
            \
            ', DplBuilder.currentBuildFile);
		
		Dom.get('content').setHtml(html);
		
		new NamespaceAutoComplete(document.find('#namespaces .add .control-namespace'));
		
	},
	
	validate: function(namespace){
		if(!namespace) {
			return false;	
		}	
		if(namespace.indexOf('.') === -1 || namespace.indexOf('.') === namespace.lastIndexOf('.') || /\.$/.test(namespace)) {
			alert('组件名字空间格式如下：组件库.分类.组件名。  如  JPlus.Dom.Base ');	
			return  false;
		}
	},
	
	// 解决方案
	
	save: function(build){
		JPlus.submit(DplBuilder.buildFiles,  {
			build: build || "",
			data: BuildFiles,
			action: 'save',
			url: build ? location.href : '../../build.html'
		});
	},
	
	buildFile: function(buildFileName){
		JPlus.submit(DplBuilder.buildFiles, {
			build: buildFileName,
			action: 'build',
			url: location.href
		});
	},
	
	buildAllFiles: function(){
		JPlus.submit(DplBuilder.buildFiles, {
			action: 'rebuild',
			url: '../../build.html'
		});
	},
	
	deleteFile: function(buildFileName){
		
		if(prompt("确定删除生成方案 " + buildFileName + " ?\r\n如果确定删除，请输出yes") !== "yes"){
			return;	
		}
		
		delete BuildFiles[buildFileName];
		
		DplBuilder.save();
	},
	
	write: function () {
		var content = Dom.get('content');
		
		var currentFile = DplBuilder.currentBuildFile;
		
		if(!currentFile || !content)
			return;
		
		currentFile.$name = content.find('[name=name]').getText();
		currentFile.targetCss = content.find('[name=targetCss]').getText();
		currentFile.targetJs = content.find('[name=targetJs]').getText();
		currentFile.targetImages = content.find('[name=targetImages]').getText();
		currentFile.require = content.find('[name=require]').getText();
		currentFile.define = content.find('[name=define]').getText();
		
		
		currentFile.removeTrace = content.find('[name=removeTrace]').getAttr('checked');
		currentFile.removeAssert = content.find('[name=removeAssert]').getAttr('checked');
		currentFile.removeConsole = content.find('[name=removeConsole]').getAttr('checked');
		currentFile.copyImages = content.find('[name=copyImages]').getAttr('checked');
		currentFile.resolveLess = content.find('[name=resolveLess]').getAttr('checked');
		currentFile.header = content.find('[name=header]').getAttr('checked');
		currentFile.macro = content.find('[name=macro]').getAttr('checked');
		currentFile.resolveUsing = content.find('[name=resolveUsing]').getAttr('checked');
		
	},
	
	saveFile: function(build){
		
		DplBuilder.addControl(false);
		
		var currentFile = DplBuilder.currentBuildFile;
		
		var content = Dom.get('content');
		
		var name = content.find('[name=name]').getText();
		
		if(!name){
			alert('请输入合成方案名。');
			return;	
		}
		
		if(name in BuildFiles && BuildFiles[name] !== currentFile){
			alert('合成方案已存在，请修改名字。');
			return;	
		} else if(DplBuilder.currentBuildFileName != name){
			BuildFiles[name] = DplBuilder.currentBuildFile;
			delete BuildFiles[DplBuilder.currentBuildFileName];
		}
		
		DplBuilder.write();
		
		DplBuilder.save(build && name);
	},
	
	saveAndBuildFile: function(){
		this.saveFile(true);
	},
	
	addControl: function(tip){
		var type = document.find('#namespaces .add select').getText();
		var namespace = document.find('#namespaces .add .control-namespace').getText();
		 
		if(DplBuilder.validate(namespace) !== false){
			
			DplBuilder.currentBuildFile[type] = DplBuilder.currentBuildFile[type] || [];
			
			DplBuilder.currentBuildFile[type].include(namespace);
			DplBuilder.showView(DplBuilder.currentBuildFileName);
		} else if(false !== tip)   {
			document.find('#namespaces .add .control-namespace').addClass('x-textbox-error');
		}
		 
	},
	
	deleteControl: function(name, type){
		
		if(!confirm("确定删除组件 " + name + "?")){
			return;	
		}
		
		var arr = DplBuilder.currentBuildFile[  type ];
		
		arr.remove(name);
		DplBuilder.showView(DplBuilder.currentBuildFileName);
		
	},
	
	getData: function(type, ns, isStyle, callback){
		JPlus.getJSONP(DplBuilder.dataFile, {
			type: type,
			namespace: ns,
			isStyle: isStyle
		}, callback);
	},

	viewSources: function(node, ns, isStyle){
		var div = Dom.get(node.parentNode);
		var source = div.find('.source');
		var refs = div.find('.refs');
		
		
		if(source){
			source.toggle();
			return;
		}
		
		DplBuilder.getData('source', ns, isStyle, function(data){
			var html = Tpl.parse('<ul class="source x-bubble">\
				{for d in $data}\
	    		<li>\
					<a href="{JPlus.rootUrl}{d}" class="x-hint" target="_blank">{d}\
	    		</li>\
	    		{end}\
	    	</ul>', data);
			
			source = div.append(html);
			
			if(refs){
				 div.append(refs);	
			}
		}) ;
		
	},

	viewRefs: function(node, ns, isStyle){
		
		var div = Dom.get(node.parentNode);
		var refs = div.find('.refs');
		
		
		if(refs){
			refs.toggle();
			return;
		}
		
		
		DplBuilder.getData('refs', ns, isStyle, function(data){
			var html = Tpl.parse('<ul class="refs">\
    			{for c in js}\
	    		<li>\
					<div class="namespace">\
		            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank">{c}</a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', false)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', false)">查看引用</a>\
		           	</div>\
				</li>\
    			{end}\
    			{for c in css}\
	    		<li>\
					<div class="namespace">\
		            	<a href="{JPlus.rootUrl}{c.toLowerCase().replace(/\\./g, "/")}.html" class="link" target="_blank">[样式]{c}</a> - <a href="javascript://查看关联的源文件" class="x-linkbutton" onclick="DplBuilder.viewSources(this, \'{c}\', true)">源文件</a> <a href="javascript://查看当前模块引用的项" class="x-linkbutton" onclick="DplBuilder.viewRefs(this, \'{c}\', true)">查看引用</a>\
		           	</div>\
				</li>\
    			{end}\
	    	</ul>', data);
	    	
	    	if(html.indexOf('li') === -1){
	    		html = '<ul class="refs x-hint"><li>(无引用)</li></ul>';	
	    	}
			
			refs = div.append(html);
		}) ;
	},

	preview: function(container, name){
		JPlus.getJSONP(DplBuilder.dataFile, {
			type: 'preview',
			name: name
		}, function (data) {
			var html = Tpl.parse('<h3>' + name + ' 的依赖项</h3><table class="x-table">\
				<tr>\
				<th>\
					源文件\
				</th>\
				<th>\
					来自\
				</th>\
				</tr>\
    			{for c in data.css}\
	    		<tr class="alt">\
					<td>\
						{author(c)}\
		           	</td>\
					<td>\
						{for p in c.parent}\
							{author(p)}<br>\
						{end}\
					</td>\
				</tr>\
    			{end}\
    			{for c in data.js}\
	    		<tr>\
					<td>\
		            	{author(c)}\
		           	</td>\
					<td>\
						{for p in c.parent}\
							{author(p)}<br>\
						{end}\
					</td>\
				</tr>\
    			{end}\
    			{for c in data.excludeCss}\
	    		<tr class="alt">\
					<td>\
						<del>{author(c)}</del>\
		           	</td>\
					<td>\
						{for p in c.parent}\
							{author(p)}<br>\
						{end}\
					</td>\
				</tr>\
    			{end}\
    			{for c in data.excludeJs}\
	    		<tr>\
					<td>\
		            	<del>{author(c)}</del>\
		           	</td>\
					<td>\
						{for p in c.parent}\
							{author(p)}<br>\
						{end}\
					</td>\
				</tr>\
    			{end}\
	    	</ul>', {
	    		data: data,
	    		author: function(c){
	    			return '<a href="' + JPlus.rootUrl + c.name.toLowerCase().replace(/\./g, "/") + '.html" class="link" target="_blank">' + (c.isStyle ? '[css]' : '[js]') + c.name + '</a>';
	    		}
	    	});
	    	
	    	
	    	Dom.get(container).setHtml(html);   
		});
		
	
	}
};




var NamespaceAutoComplete = AutoComplete.extend({
	
	_guess: function(name, r){
		
		
		name = name.toLowerCase();
		
		for(var i in Dpl.libs){
			for(var j in Dpl.libs[i]){
				if(j.toLowerCase().indexOf(name) !== -1){
					r.push(i + '.' + j + '.');	
				}
				
				
				for(var k in Dpl.libs[i][j]){
					if(k.toLowerCase().indexOf(name) !== -1){
						r.push(i + '.' + j + '.' + k);	
					}
				}
			}
		}
	},
	
	_getModules: function(module){
		var r = [];
		
		module = module.toLowerCase();
		
		//module && this._getControlList(module, '', r);
		for(var i in Dpl.libs){
			if(i.toLowerCase().indexOf(module) !== -1)
				r.push(i + '.');	
		}
		
		
		
		module && this._guess(module, r);
		
		
		return r;
	},
	
	_getCategories: function(module, categegory){
		var c = Dpl.libs[module];
		
		var r = [];
		categegory = categegory.toLowerCase();
		
		for(var i in c){
			if(i.toLowerCase().indexOf(categegory) !== -1) {
				r.push(module + '.' + i + '.');
			}
		}
		
		return  r;
	},
	
	_getControlList: function(module, categegory, name){
		var c = Dpl.libs[module];
		var n = module + '.';
		
		var r = [];
		if(c){
			c = c[categegory];
			n += categegory + '.';
			name = name.toLowerCase();
			
			for(var i in c){
				if(c[i].attribute != '$' && i.toLowerCase().indexOf(name) !== -1) {
					r.push(n + i);
				}
			}
		}
		
		return  r;
	},
	
	getSuggestItems: function(text){
		var v = text.split('.');
		switch(v.length) {
			case 1:
				return this._getModules(v[0]);
			case 2:
				return this._getCategories(v[0], v[1]);
			case 3:
				return this._getControlList(v[0], v[1], v[2]);
			default:
				return this._getControlList(v[0], v[1], v.slice(2).join('.'));
		}
		return r;
	},
	
	onSelectItem: function(item){
		this.setText(item.getText());
		this.showSuggest();
		return false;
	}
	
});