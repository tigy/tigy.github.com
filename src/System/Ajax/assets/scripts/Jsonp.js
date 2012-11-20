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

	send: function(options) {

		if (options.jsonp === undefined) {
			options.jsonp = this.jsonp;
		}

		// callback=?
		var jsonpCallback = options.jsonpCallback || (options.jsonpCallback = 'jsonp' + Date.now() + JPlus.id++);

		// callback=jsonp123
		if (options.jsonp) {
			if (options.url.indexOf(options.jsonp + '=?') >= 0) {
				options.url = options.url.replace(options.jsonp + '=?', options.jsonp + '=' + jsonpCallback);
			} else {
				options.url = Ajax.concatUrl(options.url, options.jsonp + "=" + jsonpCallback);
			}
		}

		var oldMethod = window[jsonpCallback];

		window[jsonpCallback] = function(data) {

			// 回复初始的 jsonpCallback 函数。
			window[jsonpCallback] = oldMethod;

			// 保存 response 数据。
			options.response = data;

			// 通知 onStateChange 已完成请求。
			options.callback();
		};

		// 最后使用 Script 协议发送。
		Ajax.transports.script.send.call(this, options);
	}

};

Ajax.jsonp = function(url, data, onsuccess) {
	if (typeof data === 'function') {
		onsuccess = data;
		data = null;
	}

	return Ajax.send({
		url: url,
		dataType: 'jsonp',
		data: data,
		success: onsuccess
	});
};