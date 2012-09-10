/**
 * @fileOverview 提供最底层的请求底层辅助函数。
 */


using("System.Utils.Deferrable");

var Ajax = (function() {

	var ajaxLoc,
		ajaxLocParts,
		rUrl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
		defaultAccepts = ["*/"] + ["*"],
		Ajax;
	
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
	
	/**
	 * 用于发送和接收 AJAX 请求的工具。
	 */
	Ajax = Deferrable.extend({
		
		/**
		 * Ajax 默认配置。
		 */
		options: {

			///**
			// * 供 Transport 设置的状态回调。
			// */
			//callback: Function.empty,
			
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
			 * 出现错误后的回调。
			 */
			exception: function(e) {
				this.callback(e.message, -1);
			},
	
			///**
			// * 获取或设置是否为允许缓存。
			// * @type Boolean
			// */
			//cache: true,
	
			///**
			// * 发送的数据。
			// * @type Obeject/String
			// */
			//data: null,
	
			///**
			// * 发送数据前的回调。
			// * @type Function
			// */
			//start: null,
	
			///**
			// * 发送数据成功的回调。
			// * @type Function
			// */
			//success: null,
	
			///**
			// * 发送数据错误的回调。
			// * @type Function
			// */
			//errorCode: null,
	
			///**
			// * 发送数据完成的回调。
			// * @type Function
			// */
			//complete: null,
		
			/**
			 * 用于格式化原始数据的函数。
			 * @type Function
			 */
			formatData: function(data) {
				return typeof data === 'string' ? data : Ajax.param(data);
			}

			///**
			// * 获取或设置请求类型。
			// */
			//type: 'GET',

			///**
			// * 获取或设置是否为异步请求。
			// */
			//async: true,

			///**
			// * 获取或设置是否为请求使用的用户名。
			// */
			//username: null,

			///**
			// * 获取或设置是否为请求使用的密码。
			// */
			//password: null,

			///**
			// * 获取请求头。
			// */
			//headers: null,
			
		},
		
		/**
		 * Ajax 对象。
		 * @constructor Ajax
		 */
		constructor: function() {

		},

		/**
		 * 发送一个 AJAX 请求。
		 * @param {Object} options 发送的配置。
		 *
		 * //  accepts - 请求头的 accept ，默认根据 dataType 生成。
		 * async - 是否为异步的请求。默认为 true 。
		 * cache - 是否允许缓存。默认为 true 。
		 * charset - 请求的字符编码。
		 * complete(errorCode, xhr) - 请求完成时的回调。
		 * //  contentType - 请求头的 Content-Type 。默认为 'application/x-www-form-urlencoded; charset=UTF-8'。
		 * // createNativeRequest() - 创建原生 XHR 对象的函数。
		 * crossDomain - 指示 AJAX 强制使用跨域方式的请求。默认为 null,表示系统自动判断。
		 * data - 请求的数据。
		 * dataType - 请求数据的类型。默认为根据返回内容自动识别。
		 * errorCode(message, xhr) - 请求失败时的回调。
		 * formatData(data) - 用于将 data 格式化为字符串的函数。
		 * headers - 附加的额外请求头信息。
		 * jsonp - 如果使用 jsonp 请求，则指示 jsonp 参数。如果设为 false，则不添加后缀。默认为 callback。
		 * jsonpCallback - jsonp请求回调函数名。默认为根据当前时间戳自动生成。
		 * //  mimeType - 用于覆盖原始 mimeType 的 mimeType 。
		 * getResponse(data) - 用于解析请求数据用的回调函数。
		 * password - 请求的密码 。
		 * start(data, xhr) - 请求开始时的回调。return false 可以终止整个请求。
		 * success(data, xhr) - 请求成功时的回调。
		 * timeout - 请求超时时间。单位毫秒。默认为 -1 无超时 。
		 * type - 请求类型。必须是大写。默认是 "GET" 。
		 * url - 请求的地址。
		 * username - 请求的用户名 。
		 *
		 * @param {String} link 当出现两次并发的请求后的操作。
		 */
		run: function(options, link) {
			var me = this, defaultOptions, transport;
			
			if (!me.defer(options, link)) {

				// defaultOptions
				defaultOptions = me.options;

				// options
				me.options = options = Object.extend({
					target: me,
					formatData: defaultOptions.formatData,
					timeout: defaultOptions.timeout,
					exception: defaultOptions.exception
				}, options);
				
				assert(!options.url || options.url.replace, "Ajax#run(options): {options.url} 必须是字符串。", options.url);

				// dataType
				options.dataType = options.dataType || defaultOptions.dataType;

				// url
				options.url = options.url ? options.url.replace(/#.*$/, "") : defaultOptions.url;
	
				// data
				options.data = options.data ? options.formatData(options.data) : null;
	
				// crossDomain
				if (options.crossDomain == null) {
	
					var parts = rUrl.exec(options.url.toLowerCase());
	
					// from jQuery: 跨域判断。
					options.crossDomain = !!(parts &&
						(parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
							(parts[3] || (parts[1] === "http:" ? 80 : 443)) !=
								(ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443)))
					);
	
				}
				
				// 当前用于传输的工具。
				transport = Ajax.transports[options.dataType];

				assert(transport, "Ajax#run(options, link): 不支持 {dataType} 的数据格式。", options.dataType);
				
				// 实际的发送操作。
				transport.send(options);

			}
			
			return me;
		},

		/**
		 * 停止当前的请求。
		 * @return this
		 */
		pause: function() {
			this.options.callback('Aborted', -3);
			return this;
		}

	});
	
	Object.extend(Ajax, {

		send: function(options){
			return new Ajax().run(options);
		},
		
		transports: {
			
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
		},
		
		addCachePostfix: function(url){
			return /[?&]_=/.test(url) ? url : Ajax.concatUrl(url, '_=' + Date.now() + JPlus.id++);
		},

		/**
		 * 判断一个 HTTP 状态码是否表示正常响应。
		 * @param {Number} status 要判断的状态码。
		 * @return {Boolean} 如果正常则返回true, 否则返回 false 。
		 * @remark 一般地， 200、304、1223 被认为是正常的状态吗。
		 */
		checkStatus: function(status) {

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
		 * @return {XMLHttpRequest} 请求的对象。
		 */
		createNativeRequest: window.XMLHttpRequest ? function() {
			return new XMLHttpRequest();
		} : function() {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}

	});

	/**
	 * 公共的 XHR 对象。
	 */
	Ajax.transports.text = Ajax.XHR = {
		
		/**
		 * 根据 xhr 获取响应。
		 * @type {XMLHttpRequest} xhr 要获取的 xhr 。
		 */
		getResponse: function(xhr) {

			// 如果请求了一个二进制格式的文件， IE6-9 报错。
			try {
				return xhr.responseText;
			} catch (ieResponseTextError) {
				return '';
			}

		},

		/**
		 * 发送指定配置的 Ajax 对象。
		 * @type {Ajax} options 要发送的 AJAX 对象。
		 */
		send: function(options) {

			// 拷贝配置。

			// options
			var headers,
				xhr,
				key,
				callback;

			// type
			options.type = options.type ? options.type.toUpperCase() : 'GET';

			// async
			options.async = options.async !== false;

			// getResponse
			options.getResponse = options.getResponse || this.getResponse;

			// data
			if (options.data && options.type == 'GET') {
				options.url = Ajax.concatUrl(options.url, options.data);
				options.data = null;
			}

			// cache
			if (options.cache === false) {
				options.url = Ajax.addCachePostfix(options.url);
			}

			// headers
			headers = {};

			// headers['Accept']
			headers.Accept = options.dataType in Ajax.accepts ? Ajax.accepts[options.dataType] + ", " + defaultAccepts + "; q=0.01" : defaultAccepts;

			// headers['Content-Type']
			if (options.data) {
				headers['Content-Type'] = "application/x-www-form-urlencoded; charset=" + (options.charset || "UTF-8");
			}

			// headers['Accept-Charset']
			if (options.charset) {
				headers["Accept-Charset"] = value;
			}

			// headers['X-Requested-With']
			if (!options.crossDomain) {
				headers['X-Requested-With'] = 'XMLHttpRequest';
			}

			// 如果参数有 headers, 复制到当前 headers 。
			if (options.headers) {
				options.headers = Object.extend(headers, options.headers);
			}

			// 发送请求。

			// 请求对象。
			options.xhr = xhr = Ajax.createNativeRequest();

			/**
			 * 由 XHR 负责调用的状态检测函数。
			 * @param {Object} _ 忽略的参数。
			 * @param {Integer} errorCode 系统控制的错误码。
			 *
			 * - 0: 成功。
			 * - -1: 程序出现异常，导致进程中止。
			 * - -2: HTTP 相应超时， 程序自动终止。
			 * - -3: START 函数返回 false， 程序自动终止。
			 * - 1: HTTP 成功相应，但返回的状态码被认为是不对的。
			 * - 2: HTTP 成功相应，但返回的内容格式不对。
			 */
			callback = options.callback = function(errorMessage, errorCode) {

				// xhr
				var xhr = options.xhr;

				try {

					if (xhr && (errorCode || xhr.readyState === 4)) {

						// 删除 readystatechange  。
						// 删除 options.callback 避免被再次触发。
						xhr.onreadystatechange = options.callback = Function.empty;

						// 如果存在错误。
						if (errorCode) {

							// 如果是因为超时引发的，手动中止请求。
							if (xhr.readyState !== 4) {
								xhr.abort();
							}

							// 出现错误 status = errorCode 。
							options.status = errorCode;
							options.statusText = null;
							options.errorMessage = errorMessage;
						} else {

							options.status = xhr.status;

							// 如果跨域，火狐报错。
							try {
								options.statusText = xhr.statusText;
							} catch (firefoxCrossDomainError) {
								// 模拟 Webkit: 设为空字符串。
								options.statusText = "";
							}

							// 检验状态码是否正确。
							if (Ajax.checkStatus(options.status)) {
								// 如果请求合法，且数据返回正常，则使用 getResponse 获取解析的原始数据。
								errorCode = 0;
								options.errorMessage = null;
								try {
									options.response = options.getResponse(xhr);
								} catch (getResponseError) {
									errorCode = 2;
									options.errorMessage = getResponseError.message;
								}
							} else {
								errorCode = 1;
								options.errorMessage = options.statusText;
							}

						}

						// 保存 errorCode 。
						options.errorCode = errorCode;

						try {

							if (errorCode) {
								if (options.error)
									options.error.call(options.target, options.errorMessage, xhr);

							} else {
								if (options.success)
									options.success.call(options.target, options.response, xhr);
							}

							if (options.complete)
								options.complete.call(options.target, options, xhr);

						} finally {

							// 删除 XHR 以确保 onStateChange 不重复执行。
							options.xhr = xhr = null;

							// 删除 options 。
							delete options.target.options;

							// 确保 AJAX 的等待项正常继续。
							options.target.progress();

						}
					}
				} catch (firefoxAccessError) {

					// 赋予新的空对象，避免再次访问 XHR 。
					options.xhr = {readyState: 4};
					options.exception(firefoxAccessError);
				}
			};

			// 预处理数据。
			if (options.start && options.start.call(options.target, options, xhr) === false)
				return callback(0, -3);

			try {

				if (options.username)
					xhr.open(options.type, options.url, options.async, options.username, options.password);
				else
					xhr.open(options.type, options.url, options.async);

			} catch (ieOpenError) {

				//  出现错误地址时  ie 在此产生异常
				return options.exception(ieOpenError);
			}

			// 设置文件头。
			// 如果跨域了， 火狐会报错。
			for (key in headers)
				try {
					xhr.setRequestHeader(key, headers[key]);
				} catch (firefoxSetHeaderError) {
				}

			// 监视 提交是否完成。
			xhr.onreadystatechange = callback;

			try {
				xhr.send(options.data);
			} catch (sendError) {
				return options.exception(sendError);
			}

			// 同步时，火狐不会自动调用 onreadystatechange
			if (!options.async) {
				callback();
			} else if (xhr.readyState === 4) {
				// IE6/7： 如果存在缓存，需要手动执行回调函数。
				setTimeout(callback, 0);
			} else if (options.timeouts > 0) {
				setTimeout(function() {
					callback('Timeout', -2);
				}, options.timeouts);
			}

			// 发送完成。

		}

	};

	Object.map("get post", function(type) {

		Ajax[type] = function(url, data, onsuccess, dataType) {
			if (typeof data == 'function') {
				dataType = onsuccess;
				onsuccess = data;
				data = null;
			}

			return Ajax.send({
				url: url,
				data: data,
				success: onsuccess,
				type: type,
				dataType: dataType
			});
		};

	});

	return Ajax;

})();