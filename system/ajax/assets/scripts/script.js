/** * AJAX 传输 JavaScript 。 * @author xuld */using("System.Ajax.Base");Ajax.accepts.script = "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript";Ajax.transports.script = {
	getResponse: function(xhr) {
		var code = Ajax.XHR.getResponse(xhr);
		window.execScript(code);
		return code;
	},	send: function(ajax) {
		if (!ajax.crossDomain) {
			return Ajax.XHR.send.call(this, ajax);		}		ajax.type = "GET";		// cache		if (!ajax.cache || ajax.options.cache !== false) {
			ajax.cache = false;
			ajax.url = Ajax.concatUrl(ajax.url, '_=' + Date.now() + JPlus.id++);		}		var options = ajax.options,			script = ajax.script = document.createElement('SCRIPT'),
			t,
			callback = ajax.callback = function(errorMessage, error) {
				var script = ajax.script;
				if (script && (error || !script.readyState || !/in/.test(script.readyState))) {

					// 删除 callback 避免再次执行。
					ajax.callback = Function.empty;

					// 删除全部绑定的函数。
					script.onerror = script.onload = script.onreadystatechange = null;

					// 删除当前脚本。
					script.parentNode.removeChild(script);

					// 保存 error 。
					ajax.error = error;

					try {

						if (error >= 0) {
							ajax.status = 200;
							ajax.statusText = "OK";
							ajax.errorMessage = null;
						} else {
							ajax.status = error;
							ajax.statusText = null;
							ajax.errorMessage = errorMessage;
						}

						if (error) {
							if (ajax.error)
								ajax.error(ajax.errorMessage, script);
						} else {
							if (ajax.success)
								ajax.success(ajax.response, script);
						}

						if (ajax.complete)
							ajax.complete(error, script);

					} finally {

						ajax.script = script = null;

						ajax.progress();
					}
				}
			};

		script.src = me.url;
		script.type = "text/javascript";
		script.async = "async";
		if (options.charset)
			script.charset = options.charset;
		
		// 预处理数据。
		if (ajax.start && ajax.start(ajax.data, xhr) === false)
			return callback(0, -3);

		script.onload = script.onreadystatechange = callback;

		script.onerror = function(e) {
			callback(e.message, 2);
		};		
		if (ajax.timeouts > 0) {
			setTimeout(function() {
				callback('Timeout', -2);
			}, ajax.timeouts);
		}

		t = document.getElementsByTagName("SCRIPT")[0];
		t.parentNode.insertBefore(script, t);	}};Ajax.script = function(url, onsuccess) {
	return Ajax.send({
		url: url,		dataType: 'script',		success: onsuccess	});};