/**
 * @fileOverview 提供底层的 Ajax 支持。
 */

using("System.Request.Base");
using("System.Utils.Deferred");


var Ajax = Ajax || {};

Ajax.deferred = new Deferred();

Ajax.dataTypes  ={
	'': 'XMLHttpRequest',
	'jsonp': 'JSONP',
	'json': 'JSON',
	'xml': 'XML'
};

Ajax.deferred.run = function(options){
	this.req = new Request[Ajax.dataTypes[options.dataType || '']](options);
	this.req.send(options);
};

Ajax.deferred.pause = function(){
	this.req.abort();
};

var Ajax = {};

Request.Ajax = Request.Base.extend({
	
	run: function (options) {
		this.xhr = new Request.XMLHttpRequest(options);
		this.xhr.send();
	},
	
	pause : function() {
		this.xhr.abort();
	}

	
});

Object.map("get post", function(k) {
	
	var emptyFn = Function.empty;

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
	
	k = k.toUpperCase();
	
	return function(url, data, onsuccess, onerror, timeouts, oncomplete) {
		assert.isString(url, "Ajax." + k.toLowerCase() + "(url, data, onsuccess, onerror, timeouts, ontimeout, oncomplete): 参数{url} 必须是一个地址。如果需要提交至本页，使用 location.href。");
		return Ajax.deferred.start({
			url: url,
			onSuccess: onsuccess || emptyFn,
			onError: onerror || emptyFn,
			timeouts: timeouts,
			onComplete: oncomplete || emptyFn,
			type: k,
			data: data
		});
	};
}, Ajax);


Ajax.getJSONP = function(url, data, onsuccess, timeouts, oncomplete){
    assert.isString(url, "Ajax.getJSONP(url, data, onsuccess, timeouts, ontimeout): 参数{url} 必须是一个地址。如果需要提交至本页，使用 location.href。");
    var emptyFn = Function.empty;
    Ajax.deferred.start({
        url: url,
        onSuccess: onsuccess || emptyFn,
        timeouts: timeouts,
        onComplete: oncomplete || emptyFn,
		data: data,
		dataType: 'jsonp'
    }).send();
};


