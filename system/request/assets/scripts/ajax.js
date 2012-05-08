/**
 * @fileOverview 提供底层的 Ajax 支持。
 */

using("System.Request.Base");
using("System.Utils.Deferred");


Request.Base.implement({

	run: function (args, deferred) {
		this.deferred = deferred;
		this.send();
	},

	done: function () {
		this.deferred.progress();
	}

});

var Ajax = Deferred.extend({

	constructor: function(){

	},
	
	run: function (options) {
		if (options.req) {

		}
		this.req = new Request[Ajax.dataTypes[options.dataType || '']](options);
		this.req.send();
	},

	pause: function(){
		this.req.abort();
	}
	
});

Ajax.deferred = new Deferred();

Ajax.send = function (options) {

	var req = new Request[Ajax.dataTypes[options.dataType] || 'Text'](options),
		deferred = Ajax.deferred;

	switch (options.link) {
		case 'wait':
			deferred.add(req, options);
			break;
		case 'stop':
			deferredA.stop();
			deferred.add(req, options);
			break;
		case 'abort':
			deferredA.abort();
			deferred.add(req, options);
			break;
	}


	Ajax.deferred.start();
};

Ajax.dataTypes  ={
	'text': 'Text',
	'jsonp': 'JSONP',
	'json': 'JSON',
	'xml': 'XML'
};

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


