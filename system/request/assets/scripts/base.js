/**
 * @fileOverview 提供最底层的请求底层辅助函数。
 */


var Request = Request || {};

/**
 * 提供一个请求的基本功能。
 * @class Request.Base
 * @abstract
 */
Request.Base = Class({
	
	/**
	 * 当前 AJAX 发送的地址。
	 * @field url
	 */
	
	/**
	 * 超时的时间大小。 (单位: 毫秒)
	 * @property timeouts
	 * @type Number
	 */
	
	onStart: function () {
		return this.trigger('start');
	},
	
	onError: function (errorNo, message) {
		return this.trigger('error', {
			type: errorNo,
			message: message
		});
	},
	
	onSuccess: function (data) {
		return this.trigger('success', data);
	},
	
	onComplete: function () {
		return this.trigger('complete');
	},
	
	onAbort: function () {
		return this.trigger('abort');
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
Request.param = function (obj) {
	if (!obj)
        return "";
    var s = [], e = encodeURIComponent;
    Object.each(obj, function(value, key) {
        s.push(e(key) + '=' + e(value));
    });

    // %20 -> + 。
    return s.join('&').replace(/%20/g, '+');
};

Request.combineUrl = function (url, param) {
	return url + (url.indexOf('?') >= 0 ? '&' : '?') + param;
};


