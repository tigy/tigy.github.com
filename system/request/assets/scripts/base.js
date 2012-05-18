/**
 * @fileOverview 提供最底层的请求底层辅助函数。
 */


using("System.Utils.Deferrable");

var Request = Request || {};

// errorNo
//  0 - 无错误
//  1 - 服务器响应错误 (404, 500, etc)
//  2 - 客户端出现异常
//  -1 - 服务器超时
//  -2 - 用户主动结束请求

/**
 * 提供一个请求的基本功能。
 * @class Request.Base
 * @abstract
 */
Request.Base = Deferrable.extend({
	
	/**
	 * 当前 AJAX 发送的地址。
	 * @field url
	 */
	
	/**
	 * 超时的时间大小。 (单位: 毫秒)
	 * @property timeouts
	 * @type Number
	 */

	url: null,

	/**
	 * 是否允许缓存。
	 * @type Boolean
	 */
	cache: true,

	data: null,

	timeout: -1,

	start: null,

	success: null,

	error: null,

	complete: null,

	initData: function (data) {
		return !data ? null : typeof data === 'string' ? data : Request.param(data);
	},

	initUrl: function (url) {
		assert.notNull(url, "Request.Base.prototype.initUrl(url): {url} ~。", url);
		url = url.replace(/#.*$/, '');

		// 禁止缓存，为地址加上随机数。
		return this.cache ? url : Request.combineUrl(url, '_=' + Date.now());
	},

	constructor: function (options) {
		Object.extend(this, options);
	},

	/**
	 * @param options
	 * url - 请求的地址。
	 * data - 请求的数据。
	 * cache - 是否允许缓存。默认为 true 。
	 * start - 请求开始时的回调。参数是 data, xhr
	 * error - 请求失败时的回调。参数是 errorNo, message, xhr
	 * success - 请求成功时的回调。参数是 content, message, xhr
	 * complete - 请求完成时的回调。参数是 xhr, message, errorNo
	 * timeout - 请求超时时间。单位毫秒。默认为 -1 无超时 。
	 */
	run: function(options, link){
    	if(this.defer(options, link)){
    		return this;
		}

    	this.constructor(options);
    	return this.send();
	},

	/**
	 * 停止当前的请求。
	 * @return this
	 */
	pause: function () {
		this.onStateChange(-2);
		return this;
	}
	
});

/**
 * 返回变量的地址形式。
 * @param { Base} obj 变量。
 * @return {String} 字符串。
 * @example <code>
 * Request.param({a: 4, g: 7}); //  a=4&g=7
 * </code>
 */
Request.param = function (obj, name) {

	var s;
	if (Object.isObject(obj)) {
		s = [];
		Object.each(obj, function (value, key) {
			s.push(Request.param(value, name ? name + "[" + key + "]" : key));
		});
		s = s.join('&');
	} else {
		s = encodeURIComponent(name) + "=" + encodeURIComponent(obj);
	}

	return s.replace(/%20/g, '+');
};

Request.combineUrl = function (url, param) {
	return url + (url.indexOf('?') >= 0 ? '&' : '?') + param;
};


