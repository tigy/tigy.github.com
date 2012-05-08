//===========================================
//  请求处理XML数据     A
//===========================================

using("System.Request.Text");

Request.XML = Request.Text.extend({

	getContent: function (xhr) {
		return xhr.responseXML;
	}

});
