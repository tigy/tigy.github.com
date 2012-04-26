
var rootPath = Demo.rootPath + 'assets/tools/system/assets/';

document.write('<link href="' + rootPath + 'lib/base.css" rel="stylesheet" type="text/css">');
document.write('<link href="' + rootPath + 'dplmanager/dplmanager.css" rel="stylesheet" type="text/css">');
document.write('<script src="' + rootPath + 'lib/base.js" type="text/javascript"></script>');
document.write('<script src="' + rootPath + 'dplmanager/dplmanager.js" type="text/javascript"></script>');

Demo.onLoad(function(){
	System.rootUrl = Demo.rootPath;
    
	var module = Demo.module;
	var body = document.getElementById('demo-body');
	
	document.title = Dpl.projects[module].summary + ' - ' +  document.title;

    var hr = document.createElement('hr');
    hr.className = 'demo';
    body.insertBefore(hr, body.firstChild);
    
    var h1 = document.createElement('h1');
    h1.className = 'demo';
    h1.innerHTML = Dpl.projects[module].summary + ' <small>(' + module + ')</small>';
    body.insertBefore(h1, hr);

	var div = document.createElement('div');
	div.id = 'demo-list-' + module;
	body.appendChild(div);
	DplManager[Dpl.projects[module].type === 'libs' ? 'showLib' : 'showRes'](module, 'demo-list-' + module);
	
});