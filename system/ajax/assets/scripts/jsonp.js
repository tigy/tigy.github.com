/**
 * AJAX 处理JSON-P数据。
 * @author xuld
 */
using("System.Ajax.Script");

Ajax.transports.jsonp = {

	jsonp: 'callback',

	getResponse: function(xhr) {
		window.execScript(Ajax.XHR.getResponse(xhr));
		return this.response;
	},

	send: function(ajax) {

		ajax.jsonp = ('jsonp' in ajax.options ? ajax.options : this).jsonp;

		// callback=?
		var jsonpCallback = ajax.jsonpCallback = ajax.options.jsonpCallback || ('jsonp' + Date.now() + JPlus.id++);

		// callback=jsonp123
		if (ajax.jsonp) {
			if (ajax.url.indexOf(ajax.jsonp + '=?') >= 0) {
				ajax.url = ajax.url.replace(ajax.jsonp + '=?', ajax.jsonp + '=' + jsonpCallback);
			} else {
				ajax.url = Ajax.concatUrl(ajax.url, ajax.jsonp + "=" + jsonpCallback);
			}
		}

		var oldMethod = window[jsonpCallback];

		window[jsonpCallback] = function(data) {

			// 回复初始的 jsonpCallback 函数。
			window[jsonpCallback] = oldMethod;

			// 保存 response 数据。
			ajax.response = data;

			// 通知 onStateChange 已完成请求。
			ajax.callback();
		};

		// 最后使用 Script 协议发送。
		Ajax.transports.script.send.call(this, ajax);
	}

};Ajax.jsonp = function(url, data, onsuccess) {
	if (typeof data === 'function') {
		onsuccess = data;
		data = null;
	}

	return Ajax.send({
		url: url,		dataType: 'jsonp',		data: data,		success: onsuccess
	});
};