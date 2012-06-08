
var rootPath = Demo.rootPath + 'assets/tools/system/assets/';

document.write('<link href="' + rootPath + 'lib/base.css" rel="stylesheet" type="text/css">');
document.write('<link href="' + rootPath + 'dplmanager/dplmanager.css" rel="stylesheet" type="text/css">');
document.write('<script src="' + rootPath + 'lib/base.js" type="text/javascript"></script>');
document.write('<script src="' + rootPath + 'dplmanager/dplmanager.js" type="text/javascript"></script>');

Demo.onLoad(function(){
	JPlus.rootUrl = Demo.rootPath;
    
	var module = Demo.module;
	var body = document.getElementById('demo-body');
	var isLibs = Dpl.projects[module].type === 'libs';
	
	document.title = Dpl.projects[module].summary + ' - ' +  document.title;

    var hr = document.createElement('hr');
    hr.className = 'demo';
    body.insertBefore(hr, body.firstChild);
    
    var h1 = document.createElement('h1');
    h1.className = 'demo';
    h1.innerHTML = Dpl.projects[module].summary + ' <small>(' + module + ')</small>';
    body.insertBefore(h1, hr);

	if(isLibs){
	    var div = document.createElement('div');
	    div.className = 'demo-control-toolbar';
	    div.innerHTML = '<input type="text" class="goto" placeholder="输入组件名转到" id="control-searchbox">';
	    body.insertBefore(div, body.firstChild);
	}
	    
	var div = document.createElement('div');
	div.id = 'demo-list-' + module;
	body.appendChild(div);
	DplManager[isLibs ? 'showLib' : 'showRes'](module, 'demo-list-' + module);
	
	if(isLibs){
		var NamespaceAutoComplete = AutoComplete.extend({
			
			dropDownMenuWidth: -1,
			
			getSuggestItems: function(text){
				
				text = text.toLowerCase();
				
				var r = [];
				
				var module = Demo.module;
				for(var  categegory in Dpl.libs[module]){
					for(var  name in Dpl.libs[module][categegory]){
						if(name.toLowerCase().indexOf(text) !== -1){
							r.push(module + '.' + categegory + '.' + name);	
						}
					}
				}
				return r;
			},
			
			go: function(){
				location.href = Demo.rootPath + this.getText().toLowerCase().replace(/\./g, "/") + ".html";
			},
			
			onSelectItem: function(item){
				this.setText(item.getText());
				this.go();
				return false;
			}
			
		});


		var a = new NamespaceAutoComplete('control-searchbox');
		
		a.on('keyup', function (e) {
		  if(e.which === 13){
		  	a.go();
		  }
		});
		
		document.on('keydown', function(e){
			if (e.target === document.body && e.which !== 32 && !e.ctrlKey && !e.altKey) {
				a.focus();
			}
		});
	}
});