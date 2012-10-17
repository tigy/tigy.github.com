/** * AJAX 传输 XML * @author xuld */using("System.Ajax.Base");Ajax.accepts.xml = "application/xml, text/xml";Ajax.transports.xml = {
	getResponse: function(xhr) {
		var xml = xhr.responseXML;
		return xml && xml.documentElement ? xml : null;
	},	// 基于 XMR 传递。	send: Ajax.XHR.send
};