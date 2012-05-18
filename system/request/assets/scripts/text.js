/**
 * @fileOverview 提供底层的 Ajax 支持。
 */


using("System.Request.Base");


/**
 * 处理异步请求的功能。
 * @class Ajax
 */
Request.Text = Request.Base.extend({

	/**
	 * 获取或设置请求类型。
	 */
	type: 'GET',
	
	/**
	 * 获取或设置是否为异步请求。
	 */
	async: true,

	username: null,

	password: null,
	
	/**
	 * 获取请求头。
	 */
	headers: {
		'X-Requested-With': 'XMLHttpRequest',
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
		'Content-Type': 'application/x-www-form-urlencoded'
	},
		
	/**
	 * 判断一个 HTTP 状态码是否表示正常响应。
	 * @param {Number} statusCode 要判断的状态码。
	 * @return {Boolean} 如果正常则返回true, 否则返回 false 。
	 * 一般地， 200、304、1223 被认为是正常的状态吗。
	 */
	checkStatusCode: function(statusCode) {

		// 获取状态。
		if (!statusCode) {

			// 获取协议。
			var protocol = window.location.protocol;

			// 对谷歌浏览器, 在有些协议， statusCode 不存在。
			return (protocol == "file: " || protocol == "chrome: " || protocol == "app: ");
		}

		// 检查， 各浏览器支持不同。
		return (statusCode >= 200 && statusCode < 300) || statusCode == 304 || statusCode == 1223;
	},
	
	/**
	 * 初始化一个 XMLHttpRequest 对象。
	 * @constructor
	 * @class XMLHttpRequest
	 * @return {XMLHttpRequest} 请求的对象。
	 */
	createNativeRequest: window.XMLHttpRequest ? function(){
		return new XMLHttpRequest();
	} : function() {
		return new ActiveXObject("Microsoft.XMLHTTP");
	},

	getContent: function (xhr) {
		return xhr.responseText;
	},

	onStateChange: function (errorNo, message) {
		var me = this, xhr = me.xhr;
			
		if(xhr && (errorNo || xhr.readyState === 4)) {
			
			// 删除 readystatechange  。
			xhr.onreadystatechange = Function.empty;
			
			try{
				
				if(errorNo) {
					if(errorNo < 0) {
						xhr.abort();
					}
				} else {
					errorNo = this.checkStatusCode(xhr.status) ? 0 : 1;
					message = xhr.statusText;
				}
				
				if (errorNo) {
					if(me.error)
						me.error(errorNo, message, xhr);
				} else {
					if (me.success)
						me.success(me.getContent(xhr), message, xhr);
				}
				
				if (me.complete)
					me.complete(xhr, message, errorNo);
				
			} finally {
		
				xhr = me.xhr = null;

				me.progress();
			
			}
		}
	},
	
	/**
	 * @param options
	 * url - 请求的地址。
	 * data - 请求的数据。
	 * type - 请求类型。必须是大写。
	 * async - 是否为异步的请求。默认为 true 。
	 * cache - 是否允许缓存。默认为 true 。
	 * start - 请求开始时的回调。参数是 data, xhr
	 * error - 请求失败时的回调。参数是 errorNo, message, xhr
	 * success - 请求成功时的回调。参数是 content, message, xhr
	 * complete - 请求完成时的回调。参数是 xhr, message, errorNo
	 * encoding - 请求头的字符编码。
	 * contentType - 请求头的 Content-Type 。
	 * accept - 请求头的 accept 。
	 * timeout - 请求超时时间。单位毫秒。默认为 -1 无超时 。
	 */
	constructor: function (options) {

		for (var option in options) {
			var value = options[option];
			if (value !== undefined) {
				if (option in this) {
					this[option] = value;
				} else {
					switch (option) {
						case "encoding":
							this.setEncoding(value);
							break;
						case "contentType":
							option = "Content-Type";

							// fall through
						default:
							this.setHeader(option, value);
							break;
					}
				}
			}
		}
	},

	/**
	 * 发送请求。
	 */
	send: function() {
    	
		/**
		 * 当前实例。
		 * @type Ajax
		 * @ignore
		 */
		var me = this,  
			
			/**
			 * 类型。
			 * @type String
			 */
			type = me.type,  
			
			/**
			 * 当前请求。
			 * @type String
			 */
			url = me.initUrl(me.url),

			/**
			 * 发送的数据。
			 * @type String
			 */
			data = me.initData(me.data);
		
		assert(/^[A-Z]+$/.test(type), "Request.XMLHttpRequest.prototype.send(): {this.type} 必须是大写的。",this.type);
		
		// 处理数据

		// get  请求
		if (data && type == 'GET') {
			url = Request.combineUrl(url, data);
			data = null;
		}
		
		// 打开请求
		
		/**
		 * 请求对象。
		 * @type XMLHttpRequest
		 * @ignore
		 */
		var xhr = me.xhr = this.createNativeRequest();

		// 预处理数据。
		if (me.start)
			me.start(data, xhr);

		try {
		
			if (me.username) {
				xhr.open(type, url, me.async, me.username, me.password);
			} else {
				xhr.open(type, url, me.async);
			}
			
		} catch (e) {
		
			//  出现错误地址时  ie 在此产生异常
			me.onStateChange(2, e.message);
			return me;
		}
		
		// 设置文件头
		
		for(var key in me.headers)
			try {
				xhr.setRequestHeader(key, me.headers[key]);
			} catch (e){
				trace.error(e);
			}
		
		// 发送
		
		// 监视 提交是否完成
		xhr.onreadystatechange = function(){
			me.onStateChange(0);
		};
		
		try {
			xhr.send(data);
		} catch (e) {
			me.onStateChange(2, e.message);
			return me;
		}
		
		// 同步时，火狐不会自动调用 onreadystatechange
		if (!me.async) {
			me.onStateChange(0);
		} else if (me.timeouts > 0) {
			setTimeout(function() {
				me.onStateChange(2, me.timeouts);
			}, me.timeouts);
		}
		
		return me;
		
	},
	
	/**
	 * 设置地址的编码。
	 * @param {String} [value] 字符集。
	 * @return this
	 */
	setEncoding: function(value){
		
		if(typeof value === 'string')
			this.setHeader("Accept-Charset", value);
		return this.setHeader('Content-Type', 'application/x-www-form-urlencoded' + (value ? '; charset=' + value : ''));

	},
	
	/**
	 * 设置请求头。
	 * @param {String} key 键。
	 * @param {String} text 值。
	 * @return this
	 */
	setHeader: function(key, text){
		if(!this.hasOwnProperty("header"))
			this.header = Object.extend({}, this.header);
		
		this.header[key] = text;
		
		return this;
	}
	
});

