

var System = System || {};

System.getJSONP = function (path, data, onSuccess) {
	Ajax.getJSONP(Dpl.configs.host + ':' + Dpl.configs.port + '/' + path, data, onSuccess, 1000, function(){
		var r = 'assets/bin/startserver.bat';
		if(navigator.platform.indexOf("Win") === -1) {
			r = 'assets/bin-linux/startserver.sh';
		}
		alert("无法连接到代理服务器 " + Dpl.configs.host + ':' + Dpl.configs.port + '\r\n请先执行 ' + r + '\r\n更多信息见 文档/DPL管理系统/使用说明');
	});
};

System.submit = function (path, data) {
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
System.rootUrl = '../../../';

var DplManager = {

	// 底层
	
	reloadFn: [],
	
	reload: function(){
		for(var i = 0; i < DplManager.reloadFn.length; i++){
			var f = DplManager.reloadFn[i];
			f[0](f[1], f[2], f[3], f[4]);
		}
	},
	
	ViewData: {

		status:{
			'': '计划',
			'+': '完成',
			'-': '放弃',
			'*': '凑合',
			'#': '高亮'
		},
		
		statusClass: {
			'': 'strong',
			'-': 'removed x-hint',
			'*': 'italic x-hint',
			'#': 'italic strong'
		},
		
		attribute:{
			'': '(无)',
			'^': '新窗口',
			'~': '隐藏',
			'$': '演示'
		},
		
		attributeTitle:{
			'': '不设置额外标记',
			'^': '表示在新窗口打开此项',
			'~': '隐藏菜单',
			'$': '表示此项仅仅用于演示和测试'
		},
		
		currentTr: '',
		
		getStatus: function(code){
			return code === '+' ? '' : (this.status[code] || ''  );
		},
		
		getStatusClass: function(code){
			return this.statusClass[code] || '';
		},
		
		getAttribute: function(code){
			return this.attribute[code] || '';
		},
		
		getStatusSelect: function(status){
			var status = status || '';
			var r = '<select class="x-textbox status">';
			for (i in this.status){
				r += '<option value="'+i+'"';
				if(i == status) r += ' selected="selected"';
				r += '>' + this.status[i] + '</option>'
			}
			r += '</select>'
			return r;
		},
		
		getAttrSelect: function(attr){
			var attr = attr || '';
			var r = '<select class="x-textbox attribute">';
			for (i in this.attribute){
				r += '<option value="'+i+'"';
				if(i == attr) r += ' selected="selected"';
				r += ' title="' + this.attributeTitle[i] +'"';
				r += '>' + this.attribute[i] + '</option>'
			}
			r += '</select>'
			return r;
		},
		
		getInfo: function(tr){
			return [tr.getAttr('data-module'), tr.getAttr('data-category'), tr.getAttr('data-name')];
		},
		
		setInfo: function(tr, module, category, name){
			tr.setAttr('data-module', module);
			tr.setAttr('data-category', category);
			tr.setAttr('data-name', name);
		},
		
		updateList: function(type, module, category, name, summary, status, attribute, bDelete){
			if(bDelete) {
				var data = Dpl[type][module];
				data = data && data[category];
				data && delete data[name];
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
			
		},
		
		show: function(View, module, container, noCache){
			var list = Dom.get(container);
			if(!list)
				return;
			
			if(!noCache)
				DplManager.reloadFn.push([DplManager.ViewData.show, View, module, container, true]);
			
			var data = [
				'<table class="x-table">\
					<thead>\
						<tr>\
							<th width="100">分类</th>\
							<th>名字</th>\
							<th>' + (View.name === 'libs' ? '描述' : '地址') + '</th>\
							<th>状态</th>\
							<th>属性</th>\
							<th width="108">操作</th>\
						</tr>\
					</thead>\
					<tbody>'
					
				
			];
			
			data.push('<tr data-add="true" data-module="' + module + '">' + View.addRow() + '</tr>');
			
			var controls = Dpl[View.name][module],
				keys = [],
				cache = {};
			
			for(var cat in controls){
					
				for(var c in controls[cat]){
					
					var key = cat + '.' + c;
					keys.push(key);
					cache[key] = {
						category: cat,
						name: c
					};
				}
				
			}
			
			keys.sort();
			
			for(var i = 0, lastCat = '', clazz = ''; i < keys.length; i++){
				
				var t = cache[keys[i]];
				
				if(t.category !== lastCat){
					clazz = clazz ? '' : ' class="alt"';
					lastCat = t.category;
				}
				
				data.push('<tr');
				data.push(' data-module="');
				data.push(module);
				data.push('" data-category="');
				data.push(t.category);
				data.push('" data-name="');
				data.push(t.name);
				data.push('"');
				data.push(clazz);
				data.push('>');
				data.push(View.initRow(module, t.category, t.name));
				data.push('</tr>');
			}
			
			data.push('<tr data-add="true" data-module="' + module + '">' + View.addRow() + '</tr>');
			
			data.push('</tbody>\
					</table>')
			
			list.setHtml(data.join(''));
			
			View.updateAutoComplete();
		}

	},
		
	// 组件
	
	showLib: function(module, container){
		DplManager.ViewData.show(DplManager.LibsView, module, container);
	},
	
	LibsView: {
		
		server: 'assets/tools/system/server/dplmanager/libs.nodejs',
		
		name: 'libs',
		
		getUrl: function(module, category, name){
			return System.rootUrl + (module + '/' + category + '/' + name.replace(/\./g, "/")).toLowerCase() + '.html';
		},
		
		initRow: function(module, category, name){
			
			var controlInfo = Dpl.libs[module][category][name];
			
			var k = DplManager.LibsView.getUrl(module, category, name);
			
			return '<td>' + category + '</td>\
					<td><a href="' + k + '" ' + (controlInfo.attribute === '^' ? ' target="_blank"' : ""  ) +' title="' + module + '.' + category + '.' +  name +'">' + name + '</a></td>\
					<td>' + (controlInfo.summary || '') + '</td>\
					<td class="' + DplManager.ViewData.getStatusClass(controlInfo.status || '') +'">' + DplManager.ViewData.getStatus(controlInfo.status) + '</td>\
					<td>' + (controlInfo.attribute ? DplManager.ViewData.getAttribute(controlInfo.attribute || '') : '') + '</td>\
					<td><a href="' + k + '" class="x-linkbutton" target="_blank">浏览</a> <a href="javascript:;" class="x-linkbutton" onclick="DplManager.LibsView.editControl(this)">更新</a> <a href="javascript:;" class="x-linkbutton" onclick="DplManager.LibsView.deleteControl(this)">删除</a></td>';
			
		},
		
		addRow: function(){
		
			return '<td>\
						<input type="text" class="x-textbox libs-category" placeholder="输入组件分类">\
					</td>\
					<td>\
						<input type="text" class="x-textbox libs-name" placeholder="输入组件名">\
					</td>\
					<td><input type="text" class="x-textbox libs-summary" placeholder="(可选)输入组件描述"></td>\
					<td>'+DplManager.ViewData.getStatusSelect('')+'</td>\
					<td>'+DplManager.ViewData.getAttrSelect('')+'</td>\
					<td><button class="x-button x-button-info" onclick="DplManager.LibsView.saveControl(this)">添加</button></td>';
		},
		
		editRow: function(module, category, name){
			
			var controlInfo = Dpl.libs[module][category][name];
		
			return '<td>\
						<input type="text" onfocus="this.select()" readonly="readonly" class="x-textbox libs-category" value="'+ category +'" placeholder="输入组件分类">\
					</td>\
					<td>\
						<input type="text" readonly="readonly" onfocus="this.select()" class="x-textbox x-textbox-disabled libs-name" value="'+ name +'" placeholder="输入组件名">\
					</td>\
					<td><input type="text" class="x-textbox libs-summary" value="'+ (controlInfo.summary || '') +'" placeholder="(可选)输入组件描述"></td>\
					<td>'+DplManager.ViewData.getStatusSelect(controlInfo.status || '')+'</td>\
					<td>'+DplManager.ViewData.getAttrSelect(controlInfo.attribute || '')+'</td>\
					<td><button class="x-button x-button-info" onclick="DplManager.LibsView.saveControl(this)">确定</button> <button class="x-button" onclick="DplManager.LibsView.cancelEdit(this)">取消</button></td>';
		},
			
		editControl: function(anchor){
			
			var me = Dom.get(anchor);
			var tr = me.getParent(1);
			var name = tr.find('td').getText();
			
			if(DplManager.ViewData.currentTr) {
				var info = DplManager.ViewData.getInfo(DplManager.ViewData.currentTr);
				DplManager.ViewData.currentTr.setHtml(this.initRow(info[0], info[1], info[2]));
			}
			
			var info = DplManager.ViewData.getInfo(tr);
			tr.setHtml(this.editRow(info[0], info[1], info[2]));
			DplManager.ViewData.currentTr = tr;
			
		},
		
		deleteControl: function(anchor){
		
			var me = Dom.get(anchor);
			var tr = me.getParent(1);
			var info = DplManager.ViewData.getInfo(tr);
			var ns = info[0] + '.' + info[1] + '.' + info[2];
		
			if(prompt("确定删除组件 " + ns + " ?\r\n如果确认删除，请在下框输入 yes") != "yes"){
				return;
			}
			
			System.getJSONP(this.server, {
				action:'delete',
				module: info[0],
				category: info[1],
				name: info[2]
			}, DplManager.reload);
			
			delete Dpl.libs[info[0]][info[1]][info[2]];
		
		},
		
		saveControl: function(anchor){
		
			var me = Dom.get(anchor);
			var tr = me.getParent(1);
			var isAdd = tr.getAttr('data-add');
			
			var arg = {
				module: tr.getAttr('data-module'),
				category: tr.find('.libs-category').getText(),
				name: tr.find('.libs-name').getText(),
				summary: tr.find('.libs-summary').getText(),
				attribute: tr.find('.attribute').getText(),
				status: tr.find('.status').getText()
			}
			arg.action = isAdd ? 'add' : 'update';
			
			if(this.validate(arg, isAdd) === false) return;
			
			var me = this;
			
			System.getJSONP(this.server, arg, function(){
				DplManager.ViewData.updateList(me.name, arg.module, arg.category, arg.name, arg.summary, arg.status, arg.attribute);
				DplManager.reload();
				DplManager.ViewData.currentTr = 0;
			});
			
			
		},
		
		cancelEdit:  function(anchor){

			var me = Dom.get(anchor);
			var tr = me.getParent(1);
			var info = DplManager.ViewData.getInfo(tr);
			
			tr.setHtml(this.initRow(info[0], info[1], info[2]));
			DplManager.ViewData.currentTr = 0;
			
			
		},
		
		validate: function(arg, bAdd){//验证
			
			if(!arg.category || !arg.name)
				return false;
				
			arg.name = arg.name.replace(/\//, '.');
				
			if(bAdd) {
					
				var data = Dpl.libs;
				
				if(!data)
					return false;
					
				data = data[arg.module];
				
				if(!data)
					return false;
					
				data = data[arg.category];
					
				if(!data && !confirm('分类 ' + arg.category + ' 不存在。是否创建分类?')){
					return false;
				} else if(data && data[arg.name] && !confirm('组件 ' + arg.name + ' 已存在。是否继续添加?')){
					return false;
				}
				
			}
			
			return true;
		},
		
		updateAutoComplete: function(){

			document.query('.libs-category').each(function(node){
				if(node.inited)
					return;
				
				node.inited = true;
				
				var autoComplete = new AutoComplete(node);
				
				var tr = autoComplete.getParent(1), info = DplManager.ViewData.getInfo(tr);
				
				for(var cat in Dpl.libs[info[0]]){
					autoComplete.items.add(cat);
				}
				
			});

			document.query('.libs-name').each(function(node){
				if(node.inited)
					return;
					
				
				node.inited = true;
				
				var a = new AutoComplete(node);
				
				a.getSuggestItems = function(text){
					var tr = this.getParent(1), info = DplManager.ViewData.getInfo(tr), r= [];
					
					text = text.toLowerCase();
					
					for(var cat in (Dpl.libs[info[0]] || {})[tr.find('.libs-category').getText()]){
						if(cat.toLowerCase().indexOf(text) !== -1)
							r.push(cat);
					}
					
					return r;
				};
				
			});
		}

	},
	
	// 资源
	
	showRes:    function(module, container) {
		DplManager.ViewData.show(DplManager.ResView, module, container);
	},
	
	ResView:  {
		
		server: 'assets/tools/system/server/dplmanager/res.nodejs',
		
		name: 'res',
		
		getUrl: function(module, category, name){
			var url = Dpl.res[module][category][name].summary;
			
			if(url.indexOf(':') === -1){
				url = 	System.rootUrl + url;
			}
			
			return url;
		},
		
		initRow: function(module, category, name){
			
			var controlInfo = Dpl.res[module][category][name];
			
			var k = DplManager.ResView.getUrl(module, category, name);
			
			return '<td>' + category + '</td>\
					<td><a href="' + k + '"' + (controlInfo.attribute === '^' ? ' target="_blank"' : ""  ) +' title="' + k +'">' + name + '</a></td>\
					<td>' + (controlInfo.summary || '') + '</td>\
					<td class="' + DplManager.ViewData.getStatusClass(controlInfo.status || '') +'">' + DplManager.ViewData.getStatus(controlInfo.status) + '</td>\
					<td>' + (controlInfo.attribute ? DplManager.ViewData.getAttribute(controlInfo.attribute) : '') + '</td>\
					<td><a href="' + k + '" class="x-linkbutton" target="_blank">浏览</a> <a href="javascript:;" class="x-linkbutton" onclick="DplManager.ResView.editControl(this)">更新</a> <a href="javascript:;" class="x-linkbutton" onclick="DplManager.ResView.deleteControl(this)">删除</a></td>';
			
		},
		
		addRow: function(){
		
			return '<td>\
						<input type="text" class="x-textbox res-category" placeholder="输入资源分类">\
					</td>\
					<td>\
						<input type="text" class="x-textbox res-name" placeholder="输入资源名">\
					</td>\
					<td><input type="text" class="x-textbox res-summary" placeholder="输入资源地址"></td>\
					<td>'+DplManager.ViewData.getStatusSelect('')+'</td>\
					<td>'+DplManager.ViewData.getAttrSelect('')+'</td>\
					<td><button class="x-button x-button-info" onclick="DplManager.ResView.saveControl(this)">添加</button></td>';
		},
		
		editRow: function(module, category, name){
			
			var controlInfo = Dpl.res[module][category][name];
		
			return '<td>\
						<input type="text" class="x-textbox res-category" value="'+ category +'" placeholder="输入资源分类">\
					</td>\
					<td>\
						<input type="text" class="x-textbox x-textbox-disabled res-name" value="'+ name +'" placeholder="输入资源名">\
					</td>\
					<td><input type="text" class="x-textbox res-summary" value="'+ (controlInfo.summary || '') +'" placeholder="输入资源地址"></td>\
					<td>'+DplManager.ViewData.getStatusSelect(controlInfo.status || '')+'</td>\
					<td>'+DplManager.ViewData.getAttrSelect(controlInfo.attribute || '')+'</td>\
					<td><button class="x-button x-button-info" onclick="DplManager.ResView.saveControl(this)">确定</button> <button class="x-button" onclick="DplManager.ResView.cancelEdit(this)">取消</button></td>';
		},
			
		editControl: function(anchor){
			DplManager.LibsView.editControl.call(this,  anchor);
			this.updateAutoComplete();
		},
		
		deleteControl: function(anchor){
		
			var me = Dom.get(anchor);
			var tr = me.getParent(1);
			var info = DplManager.ViewData.getInfo(tr);
		
			if(prompt("确定删除资源 " + info[2] + " ?\r\n如果确认删除，请在下框输入 yes") != "yes"){
				return;
			}
			
			System.getJSONP(this.server, {
				action:'delete',
				module: info[0],
				category: info[1],
				name: info[2]
			}, DplManager.reload);
			
			delete Dpl.res[info[0]][info[1]][info[2]];
		
		},
		
		saveControl: function(anchor){
		
			var me = Dom.get(anchor);
			var tr = me.getParent(1);
			var isAdd = tr.getAttr('data-add');
			
			var arg = {
				module: tr.getAttr('data-module'),
				category: tr.find('.res-category').getText(),
				name: tr.find('.res-name').getText(),
				summary: tr.find('.res-summary').getText(),
				attribute: tr.find('.attribute').getText(),
				status: tr.find('.status').getText()
			}
			arg.action = isAdd ? 'add' : 'update';
			
			if(this.validate(arg, isAdd) === false) return;
			
			if(!isAdd){
				var info = DplManager.ViewData.getInfo(tr);
				arg.oldCategory = info[1];
				arg.oldName = info[2];
				
				if(arg.oldName != arg.name || arg.oldCategory != arg.category) {
					DplManager.ViewData.updateList(this.name, arg.module, arg.oldCategory, arg.oldName, arg.summary, arg.status, arg.attribute, true);
					DplManager.ViewData.setInfo(tr, arg.module, arg.category, arg.name);
				}
				
			}
			
			DplManager.ViewData.updateList(this.name, arg.module, arg.category, arg.name, arg.summary, arg.status, arg.attribute);
			
			System.getJSONP(this.server, arg, DplManager.reload);
			
			DplManager.ViewData.currentTr = 0;
			
		},
		
		cancelEdit:  function(anchor){

			var me = Dom.get(anchor);
			var tr = me.getParent(1);
			var info = DplManager.ViewData.getInfo(tr);
			
			tr.setHtml(this.initRow(info[0], info[1], info[2]));
			DplManager.ViewData.currentTr = 0;
			
			
		},
		
		validate: function(arg, bAdd){
			
			if(!arg.category || !arg.name)
				return false;
			
			if(!arg.summary) {
				alert('请填入资源地址');
				return false;
			}
				
			if(bAdd) {
					
				var data = Dpl.res;
				
				if(!data)
					return false;
					
				data = data[arg.module];
				
				if(!data)
					return false;
					
				data = data[arg.category];
					
				if(!data && !confirm('分类 ' + arg.category + ' 不存在。是否创建分类?')){
					return false;
				} else if(data && data[arg.name] && !confirm('资源 ' + arg.name + ' 已存在。是否继续添加?')){
					return false;
				}
				
			}
				
			return true;
		},
		
		updateAutoComplete: function(){

			document.query('.res-category').each(function(node){
				if(node.inited)
					return;
				
				node.inited = true;
				
				var autoComplete = new AutoComplete(node);
				
				var tr = autoComplete.getParent(1), info = DplManager.ViewData.getInfo(tr);
				
				for(var cat in Dpl.res[info[0]]){
					autoComplete.items.add(cat);
				}
				
			});

			document.query('.res-name').each(function(node){
				if(node.inited)
					return;
					
				
				node.inited = true;
				
				var a = new AutoComplete(node);
				
				a.getSuggestItems = function(text){
					var tr = this.getParent(1), info = DplManager.ViewData.getInfo(tr), r= [];
					
					text = text.toLowerCase();
					
					for(var cat in (Dpl.res[info[0]] || {})[tr.find('.res-category').getText()]){
						if(cat.toLowerCase().indexOf(text) !== -1)
							r.push(cat);
					}
					
					return r;
				};
				
			});
		}

	}

};



