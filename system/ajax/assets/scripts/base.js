/**
 * @fileOverview 提供最底层的请求底层辅助函数。
 */


using("System.Utils.Deferrable");

var Ajax = (function() {

	var ajaxLoc,
		ajaxLocParts,
		rUrl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
		defaultAccepts = ["*/"] + ["*"];

	// 如果设置了 document.domain, IE 会抛出异常。
	try {
		ajaxLoc = location.href;
	} catch (e) {
		// 使用 a 的默认属性获取当前地址。
		ajaxLoc = document.createElement("a");
		ajaxLoc.href = "";
		ajaxLoc = ajaxLoc.href;
	}

	ajaxLocParts = rUrl.exec(ajaxLoc.toLowerCase()) || [];

	var Ajax = Deferrable.extend({
		
		options: {
			
			/**
			 * 传输的数据类型。
			 * @type String
			 */
			dataType: 'text',
	
			/**
			 * 当前 AJAX 发送的地址。
			 * @field url
			 */
			url: ajaxLoc,
	
			/**
			 * 超时的时间大小。 (单位: 毫秒)
			 * @property timeouts
			 * @type Number
			 */
			timeout: -1,
	
			/**
			 * 获取或设置是否为允许缓存。
			 * @type Boolean
			 */
			cache: true,
	
			/**
			 * 发送的数据。
			 * @type Obeject/String
			 */
			data: null,
	
			/**
			 * 发送数据前的回调。
			 * @type Function
			 */
			start: null,
	
			/**
			 * 发送数据成功的回调。
			 * @type Function
			 */
			success: null,
	
			/**
			 * 发送数据错误的回调。
			 * @type Function
			 */
			error: null,
	
			/**
			 * 发送数据完成的回调。
			 * @type Function
			 */
			complete: null,
		
			formatData: function(data) {
				return typeof data === 'string' ? data : Ajax.param(data);
			},
	
			parseData: function(data) {
				return data;
			}
			
		},

		constructor: function() {

		},

		/**
		 * 发送一个 AJAX 请求。
		 * @param {Object} options 发送的配置。
		 *
		 * //  accepts - 请求头的 accept ，默认根据 dataType 生成。
		 * async - 是否为异步的请求。默认为 true 。
		 * cache - 是否允许缓存。默认为 true 。
		 * callback - jsonp请求回调函数名。默认为根据当前时间戳自动生成。
		 * charset - 请求的字符编码。
		 * complete(errorNo, request) - 请求完成时的回调。
		 * //  contentType - 请求头的 Content-Type 。默认为 'application/x-www-form-urlencoded; charset=UTF-8'。
		 * createNativeRequest() - 创建原生 XHR 对象的函数。
		 * crossDomain - 指示 AJAX 强制使用跨域方式的请求。默认为 null,表示系统自动判断。
		 * data - 请求的数据。
		 * dataType - 请求数据的类型。默认为根据返回内容自动识别。
		 * error(message, request) - 请求失败时的回调。
		 * formatData(data) - 用于将 data 格式化为字符串的函数。
		 * headers - 附加的额外请求头信息。
		 * jsonp - 如果使用 jsonp 请求，则指示 jsonp 参数。如果设为 false，则不添加后缀。默认为 callback。
		 * //  mimeType - 用于覆盖原始 mimeType 的 mimeType 。
		 * parseData(data) - 用于解析请求数据用的回调函数。
		 * password - 请求的密码 。
		 * start(xhr, request) - 请求开始时的回调。return false 可以终止整个请求。
		 * success(data, request) - 请求成功时的回调。
		 * timeout - 请求超时时间。单位毫秒。默认为 -1 无超时 。
		 * type - 请求类型。必须是大写。默认是 "GET" 。
		 * url - 请求的地址。
		 * username - 请求的用户名 。
		 *
		 * @param {String} link 当出现两次并发的请求后的操作。
		 */
		run: function(options, link) {
			var me = this;
			
			if (!me.defer(options, link)) {
	
				assert.notNull(options, "Ajax.prototype.run(options, link): {options} ~");
				
				// 将默认配置里的项拷贝 options 到当前对象，如果 options未指定项，则使用默认配置。
				for (var option in me.options) {
					me[option] = (option in options ? options : me.options)[option];
				}
				
				// 保存 options 。
				me.options = options;
				
				// 当前用于传输的工具。
				var transport = Ajax.transports[me.dataType];
				
				assert(transport, "Ajax.prototype.run(options, link): {me.dataType} ~", me.dataType);
				
				// 初始化 transport 。
				transport.init(me);
				
				// url
				me.url = me.url.replace(/#.*$/, "");
	
				// data
				me.data = me.data ? me.formatData(me.data) : null;
	
				// crossDomain
				if (me.crossDomain == null) {
	
					var parts = rUrl.exec(me.url.toLowerCase());
	
					// from jQuery: 跨域判断。
					me.crossDomain = !!(parts &&
						(parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
							(parts[3] || (parts[1] === "http:" ? 80 : 443)) !=
								(ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443)))
					);
	
				}
				
				// cache
				if (!me.cache) {
					me.url = Ajax.concatUrl(me.url, '_=' + Date.now() + JPlus.id++);
				}
				
				// 实际的发送操作。
				transport.send(me);
				
				// // 获取用于发送指定数据的 Request 对象。
				// var Request = Ajax.dataTypes[options.dataType] || Ajax.Text;
// 	
				// // 创建 Request 对象。
				// this.request = new Request(this);
// 	
				// // 初始化 Request 对象。
				// this.request.init(options);
// 	
				// // 使用 Request 对象开始真正的请求。
				// this.request.send();
			}
			
			return me;
		},

		/**
		 * 停止当前的请求。
		 * @return this
		 */
		pause: function() {
			this.request.abort();
			return this;
		}

	});

	Object.extend(Ajax, {
		
		transports: {},
		
		dataTypes: {},
		
		status: {
			'2': 'Syntax Error',
			'-1': 'Unexpected Exception',
			'-2': 'Timeout',
			'-3': 'Aborted'
		},
		
		accepts: {
			
		},
		
		/**
		 * 返回变量的地址形式。
		 * @param {Object} obj 变量。
		 * @return {String} 字符串。
		 * @example <pre>
		 * Ajax.param({a: 4, g: 7}); //  a=4&g=7
		 * </pre>
		 */
		param: function(obj, name) {
	
			var s;
			if (Object.isObject(obj)) {
				s = [];
				Object.each(obj, function(value, key) {
					s.push(Ajax.param(value, name ? name + "[" + key + "]" : key));
				});
				s = s.join('&');
			} else {
				s = encodeURIComponent(name) + "=" + encodeURIComponent(obj);
			}
	
			return s.replace(/%20/g, '+');
		},
		
		concatUrl: function(url, param) {
			return param ? url + (url.indexOf('?') >= 0 ? '&' : '?') + param : url;
		}
		
	});

	/**
	 * 提供一个请求的基本功能。
	 * @class Ajax.Request
	 * @abstract
	 */
	Ajax.Request = Class({

		/**
		 * 当系统处理时发生一个异常后的回调。
		 * @protected virtual
		 */
		onException: function(e) {
			this.statusText = e.message;
			this.onStateChange(-1);
		},

		constructor: function(ajax) {

			// 当前 Request 对象所服务的 AJAX 对象。
			this.ajax = ajax;

		},
 
	});
	
	Ajax.prototype.options.type = {
		
	};
	
	Ajax.transports.text = {
		
		send: function(ajax){
			
			// 拷贝配置。
			
			// options
			var options = ajax.options;
			
			// type
			ajax.type = options.type ? options.type.toUpperCase() : 'GET';
			
			// async
			ajax.async = options.async !== false;
			
			// username
			ajax.username = options.username;
			
			// password
			ajax.password = options.password;
			
			// data
			if (ajax.data && ajax.type == 'GET') {
				ajax.url = Ajax.concatUrl(ajax.url, ajax.data);
				ajax.data = null;
			}

			// headers
			var headers = ajax.headers = {};

			// headers['Accept']
			headers.Accept = options.dataType in Ajax.accepts ? Ajax.accepts[options.dataType] + ", " + defaultAcceptes + "; q=0.01" : defaultAccepts;

			// headers['Content-Type']
			if (ajax.data) {
				headers['Content-Type'] = "application/x-www-form-urlencoded; charset=" + (options.charset || "UTF-8");
			}

			// headers['Accept-Charset']
			if (options.charset) {
				headers["Accept-Charset"] = value;
			}

			// headers['X-Requested-With']
			if (!ajax.crossDomain) {
				headers['X-Requested-With'] = 'XMLHttpRequest';
			}

			// 如果参数有 headers, 复制到当前 headers 。
			if (options.headers) {
				Object.extend(headers, options.headers);
			}
			
			// 发送请求。
			
			
		},
		
	};

	Ajax.dataTypes.text = Ajax.Text = Ajax.Request.extend({

		/**
		 * 获取或设置请求类型。
		 */
		type: 'GET',

		/**
		 * 获取或设置是否为异步请求。
		 */
		async: true,

		/**
		 * 获取或设置是否为请求使用的用户名。
		 */
		username: null,

		/**
		 * 获取或设置是否为请求使用的密码。
		 */
		password: null,

		/**
		 * 获取请求头。
		 */
		headers: null,

		/**
		 * 判断一个 HTTP 状态码是否表示正常响应。
		 * @param {Number} status 要判断的状态码。
		 * @return {Boolean} 如果正常则返回true, 否则返回 false 。
		 * 一般地， 200、304、1223 被认为是正常的状态吗。
		 */
		checkstatus: function(status) {

			// 获取状态。
			if (!status) {

				// 获取协议。
				var protocol = window.location.protocol;

				// 对谷歌浏览器, 在有些协议， status 不存在。
				return (protocol == "file: " || protocol == "chrome: " || protocol == "app: ");
			}

			// 检查， 各浏览器支持不同。
			return (status >= 200 && status < 300) || status == 304 || status == 1223;
		},

		/**
		 * 初始化一个 XMLHttpRequest 对象。
		 * @constructor
		 * @class XMLHttpRequest
		 * @return {XMLHttpRequest} 请求的对象。
		 */
		createNativeRequest: window.XMLHttpRequest ? function() {
			return new XMLHttpRequest();
		} : function() {
			return new ActiveXObject("Microsoft.XMLHTTP");
		},

		getResponseHeaders: function(){
			return this.xhr.getResponseHeaders();
		},

		getResponseXML: function() {
			var xml = this.xhr.responseXML;
			return xml && xml.documentElement ? xml : null;
		},

		getResponseText: function() {

			// 如果请求了一个二进制格式的文件， IE6-9 报错。
			try {
				return this.xhr.responseText;
			} catch (ieResponseTextError) {
				return null;
			}
		},

		/**
		 * 获取当前相应数据。
		 * @protected virtual
		 */
		getResponse: function() {
			return this.parseData(this.getResponseText());
		},

		/**
		 * 由 XHR 负责调用的状态检测函数。
		 * @param {Integer} errorNo 系统控制的错误码。
		 *
		 * - 0: 成功。
		 * - -1: 程序出现异常，导致进程中止。
		 * - -2: HTTP 相应超时， 程序自动终止。
		 * - -3: START 函数返回 false， 程序自动终止。
		 * - 1: HTTP 成功相应，但返回的状态码被认为是不对的。
		 * - 2: HTTP 成功相应，但返回的内容格式不对。
		 */
		onStateChange: function(errorNo) {

			var me = this, 
				xhr = me.xhr;

			try{

				if (xhr && (errorNo || xhr.readyState === 4)) {

					// 删除 readystatechange  。
					xhr.onreadystatechange = Function.empty;

					if (errorNo) {

						// 如果是因为超时引发的，手动中止请求。
						if(xhr.readyState !== 4) {
							xhr.abort();
						}

						// 出现错误 status = errorCode 。
						me.status = errorNo;
						me.statusText = Ajax.status[errorNo];
					} else {

						me.status = xhr.status;
						errorNo = me.checkstatus(xhr.status) ? 0 : 1;

						// 如果跨域，火狐报错。
						try {
							me.statusText = xhr.statusText;
						} catch (firefoxCrossDomainError) {
							// We normalize with Webkit giving an empty statusText
							me.statusText = "";
						}

						if (!errorNo) {

							try {
								me.response = me.getResponse();
							} catch (parseDataError) {
								errorNo = 2;
								me.statusText = "Parse Error";
							}

						}

					}

					// 保存 errorCode 。
					me.errorCode = errorNo;

					try {

						if (errorNo) {
							if (me.error)
								me.error.call(me.ajax, errorNo, me);

						} else {
							if (me.success)
								me.success.call(me.ajax, me.response, me);
						}

						if (me.complete)
							me.complete.call(me.ajax, errorNo, me);

					} finally {

						// 删除 XHR 以确保 onStateChange 不重复执行。
						me.xhr = xhr = null;

						// 确保 AJAX 的等待项正常继续。
						me.ajax.progress();

					}
				}
			} catch (firefoxAccessError) {

				// 赋予新的空对象，避免再次访问 XHR 。
				me.xhr = {};
				me.onException(firefoxAccessError);
			}
		},

		init: function(options) {

			var me = this;

			// 调用父类 init(options)
			Ajax.Request.prototype.init.call(me, options);

			// type
			me.type = me.type.toUpperCase();

			// data
			if (me.data && me.type == 'GET') {
				me.url = Ajax.concatUrl(me.url, me.data);
				me.data = null;
			}

			// headers
			var headers = me.headers = {};

			// 如果参数有 headers, 复制到当前 headers 。
			if (options.headers) {
				Object.extend(headers, options.headers);
			}

			// headers['Accept']
			if (!('Accept' in headers)) {
				headers.Accept = (Ajax.accepts[me.dataType] || defaultAccepts).replace("~", defaultAccepts);
			} //      ", ~; q=0.01"

			// headers['Content-Type']
			if (me.data && !('Content-Type' in headers)) {
				headers['Content-Type'] = "application/x-www-form-urlencoded; charset=" + (me.charset || value);
			}

			// headers['Accept-Charset']
			if (me.charset && !('Accept-Charset' in headers)) {
				headers["Accept-Charset"] = value;
			}

			// headers['X-Requested-With']
			if (!me.crossDomain && !('X-Requested-With' in headers)) {
				headers['X-Requested-With'] = 'XMLHttpRequest';
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
				 * 请求对象。
				 * @type XMLHttpRequest
				 * @ignore
				 */
				xhr = me.xhr = me.createNativeRequest();

			// 预处理数据。
			if (me.start && me.start.call(me.ajax, xhr, me) === false)
				return me.onStateChange(-3);

			try {

				if (me.username)
					xhr.open(me.type, me.url, me.async, me.username, me.password);
				else
					xhr.open(me.type, me.url, me.async);

			} catch (ieOpenError) {

				//  出现错误地址时  ie 在此产生异常
				return me.onException(ieOpenError);
			}

			// 设置文件头。
			// 如果跨域了， 火狐会报错。
			for (var key in me.headers)
				try {
					xhr.setRequestHeader(key, me.headers[key]);
				} catch (firefoxSetHeaderError) {
				}

			// 监视 提交是否完成。
			xhr.onreadystatechange = function() {
				me.onStateChange(0);
			};

			try {
				xhr.send(me.data);
			} catch (sendError) {
				return me.onException(sendError);
			}

			// 同步时，火狐不会自动调用 onreadystatechange
			if (!me.async) {
				me.onStateChange(0);
			} else if (xhr.readyState === 4) {
				// (IE6 & IE7) if it's in cache and has been
				// retrieved directly we need to fire the callback
				setTimeout(function() {
					me.onStateChange(0);
				}, 0);
			} else if (me.timeouts > 0) {
				setTimeout(function() {
					me.onStateChange(-2);
				}, me.timeouts);
			}

		}

	});

	Ajax.accepts.json = 'application/json, text/javascript, application/javascript, ~;q=0.01';

	Ajax.dataTypes.json = Ajax.JSON = Ajax.Text.extend({

		parseData: function(response) {
			return eval("(" + response + ")");
		}

	});

	Ajax.dataTypes.xml = Ajax.XML = Ajax.Text.extend({

		getResponse: function() {
			return this.getResponseXML();
		}

	});

	Ajax.dataTypes.js = Ajax.Javascript = Ajax.Text.extend({

		getResponse: function(response) {
			window.execScript(response);
		}

	});


	Ajax.accepts.script = 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, ~;q=0.01';

	Ajax.dataTypes.script = Ajax.Script = Ajax.Request.extend({

		getResponseText: function() {
			return this.script.text || this.script.innerHTML;
		},

		onStateChange: function(errorNo) {
			var me = this, script = me.script;
			if (script && (errorNo || !script.readyState || !/in/.test(script.readyState))) {

				// 删除全部绑定的函数。
				script.onerror = script.onload = script.onreadystatechange = null;

				// 删除当前脚本。
				script.parentNode.removeChild(script);

				// 保存 errorCode 。
				me.errorCode = errorNo;

				try {

					if (errorNo) {

						// 记录 status。
						me.status = errorNo;
						me.statusText = Ajax.status[errorNo];

						if (me.error)
							me.error.call(me.ajax, errorNo, me);
					} else {

						me.status = 200;
						me.statusText = "OK";

						if (me.success)
							me.success.call(me.ajax, me.response, me);
					}

					if (me.complete)
						me.complete.call(me.ajax, errorNo, me);

				} finally {

					me.script = script = null;

					me.ajax.progress();
				}
			}
		},

		init: function(options) {
			options.cache = options.cache !== false;
			Ajax.Request.prototype.init.call(this, options);
		},

		send: function() {
			
			if(!this.crossDomain){
			//	return Ajax.Javascript
			}

			var me = this,
				script = me.script = document.createElement('SCRIPT'),
				t;

			// 预处理数据。
			if (me.start && me.start.call(me.ajax, script, me) === false)
				return me.onStateChange(-3);

			script.src = me.url;
			script.type = "text/javascript";
			script.async = "async";

			if (me.charset)
				script.charset = me.charset;

			script.onload = script.onreadystatechange = function() {
				me.onStateChange(0);
			};

			script.onerror = function() {
				me.onStateChange(2);
			};

			if (me.timeouts > 0) {
				setTimeout(function() {
					me.onStateChange(-1);
				}, me.timeouts);
			}

			t = document.getElementsByTagName("script")[0];
			t.parentNode.insertBefore(script, t);
		}

	});

	Ajax.dataTypes.jsonp = Ajax.JSONP = Ajax.Script.extend({

		jsonp: 'callback',

		send: function() {

			var me = this,
				url = me.url;

			url = Ajax.concatUrl(url, data);

			// 处理 callback=?
			var callback = me.callback || ('jsonp' + Date.now() + JPlus.id++);

			if (me.jsonp) {

				if (url.indexOf(me.jsonp + '=?') >= 0) {
					url = url.replace(me.jsonp + '=?', me.jsonp + '=' + callback);
				} else {
					url = Ajax.concatUrl(url, me.jsonp + "=" + callback);
				}

			}

			me.url = url;

			var oldMethod = window[callback];

			window[callback] = function(data) {
				window[callback] = oldMethod;

				// 保存 response 数据。
				me.response = data;

				// 通知 onStateChange 已完成请求。
				me.onStateChange(0);
			};

			// 最后使用 Script 协议发送。
			Ajax.Script.prototype.send.call(this);
		},

	});

	return Ajax;

})();