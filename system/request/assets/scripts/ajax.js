/**
 * @fileOverview 提供底层的 Ajax 支持。
 */

//using("System.Request.Base");
//using("System.Request.Text");
//using("System.Request.JSONP");
//using("System.Request.JSON");
//using("System.Request.XML");

var Ajax = Ajax || {};

Ajax.dataTypes  ={
	'text': 'Text',
	'jsonp': 'JSONP',
	'json': 'JSON',
	'xml': 'XML'
};

Ajax.send = function (options) {
	return new Request[Ajax.dataTypes[options.dataType] || 'Text']().run(options);
};

Object.each({
	get: 'Text',
	post: 'Text',
	getJSONP: 'JSONP',
	getJSON: 'JSON'
}, function(value, key) {

	/**
	 * 快速请求一个地址。
	 * @param {String} url 地址。
	 * @param {String/Object} data 数据。
	 * @param {Function} [onsuccess] 成功回调函数。
	 * @param {Function} [onerror] 错误回调函数。
	 * @param {Object} timeouts=-1 超时时间， -1 表示不限。
	 * @param {Function} [ontimeout] 超时回调函数。
	 * @method Ajax.get
	 */
	
	/**
	 * 快速请求一个地址。
	 * @param {String} url 地址。
	 * @param {String/Object} data 数据。
	 * @param {Function} [onsuccess] 成功回调函数。
	 * @param {Function} [onerror] 错误回调函数。
	 * @param {Object} timeouts=-1 超时时间， -1 表示不限。
	 * @param {Function} [ontimeout] 超时回调函数。
	 * @method Ajax.post
	 */
	
	var type = value === "Text" ? key.toUpperCase() : null;
	
	Ajax[key] = function (url, data, onsuccess, onerror, oncomplete, timeouts) {
		assert(value in Request, "未载入 System.Request." + value + " 模块。");
		assert.isString(url, "Ajax." + key + "(url, data, onsuccess, onerror, timeouts, ontimeout, oncomplete): 参数{url} 必须是一个地址。如果需要提交至本页，使用 location.href。");
		if(typeof data == 'function'){
			timeouts = oncomplete;
			oncomplete = onerror;
			onerror = data;
			data = null;
		}
		return new Request[value]().run({
			url: url,
			type: type,
			data: data,
			success: onsuccess,
			error: onerror,
			complete: oncomplete,
			timeouts: timeouts
		});
	};
});
