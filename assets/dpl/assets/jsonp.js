

Demo.jsonp = function (path, data, onSuccess) {
    Ajax.jsonp(Demo.Configs.serverRootUrl + path, data, onSuccess, function () {
        var r = 'startserver.bat';
        if (navigator.platform.indexOf("Win") === -1) {
            r = 'startserver.sh';
        }
        alert("无法连接到代理服务器 " + Demo.Configs.serverRootUrl + '\r\n请运行 ' + r);
    }, null, 1000);
};

Demo.submit = function (path, data, target) {
    var form = Dom.create('form');
    form.setAttr('action', Demo.Configs.serverRootUrl + path);
    form.setAttr('method', 'post');
    form.setAttr('target', target || '_self');
    form.setHtml('<textarea name="data"></textarea>'); 
    form.find('textarea').setText(JSON.encode(data));
    form.hide().appendTo();
    form.submit();
};