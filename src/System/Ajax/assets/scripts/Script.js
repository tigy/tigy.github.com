/**
 * AJAX 传输 JavaScript 。
 * @author xuld
 */

using("System.Ajax.Base");

Ajax.accepts.script = "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript";

Ajax.transports.script = {

	getResponse: function(xhr) {
		var code = Ajax.XHR.getResponse(xhr);
		window.execScript(code);
		return code;
	},

	send: function(options) {
		if (!options.crossDomain) {
			return Ajax.XHR.send.call(this, options);
		}

		options.type = "GET";
		
		// cache
		if (options.cache !== false) {
			options.cache = false;
			
			options.url = Ajax.addCachePostfix(options.url);
		}

		// data
		if (options.data) {
			options.url = Ajax.concatUrl(options.url, options.data);
			options.data = null;
		}

		var script = options.script = document.createElement('SCRIPT'),
			t,
			callback = options.callback = function(errorMessage, error) {
				var script = options.script;
				if (script && (error || !script.readyState || !/in/.test(script.readyState))) {

					// 删除 callback 避免再次执行。
					options.callback = Function.empty;

					// 删除全部绑定的函数。
					script.onerror = script.onload = script.onreadystatechange = null;

					// 删除当前脚本。
					script.parentNode.removeChild(script);

					try {
						
						if(error < 0) {
							options.status = error;
							options.statusText = "";
						} else {
							options.status = 200;
							options.statusText = "OK";
						}

						if (error) {
							
							options.errorCode = error;
							options.errorMessage = errorMessage;
							
							if (options.error)
								options.error.call(options.target, options.errorMessage, script);
						} else {
							
							options.errorCode = 0;
							options.errorMessage = null;
							
							if (options.success)
								options.success.call(options.target, options.response, script);
						}

						if (options.complete)
							options.complete.call(options.target, options, script);

					} finally {

						options.script = script = null;

						delete options.target.options;

						options.target.progress();
					}
				}
			};

		script.src = options.url;
		script.type = "text/javascript";
		script.async = "async";
		if (options.charset)
			script.charset = options.charset;
		
		// 预处理数据。
		if (options.start && options.start.call(options.target, options, xhr) === false)
			return callback(0, -3);

		script.onload = script.onreadystatechange = callback;

		script.onerror = function(e) {
			callback('Network Error', 2);
		};
		
		if (options.timeouts > 0) {
			setTimeout(function() {
				callback('Timeout', -2);
			}, options.timeouts);
		}

		t = document.getElementsByTagName("SCRIPT")[0];
		t.parentNode.insertBefore(script, t);
	}

};

Ajax.script = function(url, onsuccess) {
	return Ajax.send({
		url: url,
		dataType: 'script',
		success: onsuccess
	});
};