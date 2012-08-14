/** * AJAX 传输 JSON * @author xuld */using("System.Ajax.Base");using("System.Data.JSON");Ajax.accepts.json = "application/json, text/javascript";Ajax.transports.json = {
	getResponse: function(xhr) {
		return JSON.parse(Ajax.XHR.getResponse(xhr));
	},	// 基于 XMR 传递。	send: Ajax.XHR.send
};Ajax.json = function(url, data, onsuccess) {
	if (typeof data === 'function') {
		onsuccess = data;
		data = null;
	}

	return Ajax.send({
		url: url,		dataType: 'json',		data: data,		success: onsuccess
	});
};